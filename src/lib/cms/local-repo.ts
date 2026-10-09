import "server-only";
import { randomUUID } from "node:crypto";
import { copyFile, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { CmsError, type CmsRepository, type MediaStore } from "./repository";
import { seedCategories, seedProjects } from "./seed-data";
import type { CmsCategory, CmsProject, UploadTarget } from "./types";
import type { CategoryInput, ProjectInput } from "./validation";

/**
 * Local preview store — development only (CMS_LOCAL_MODE=true).
 * Content lives in .data/cms.json and uploads in .data/uploads/, so the whole
 * admin workflow can be exercised before Supabase is connected.
 */

export const LOCAL_DATA_DIR = path.join(process.cwd(), ".data");
export const LOCAL_UPLOAD_DIR = path.join(LOCAL_DATA_DIR, "uploads");
const DB_FILE = path.join(LOCAL_DATA_DIR, "cms.json");

type Store = { categories: CmsCategory[]; projects: CmsProject[] };

async function load(): Promise<Store> {
  try {
    return JSON.parse(await readFile(DB_FILE, "utf8")) as Store;
  } catch {
    const store: Store = { categories: seedCategories(), projects: seedProjects() };
    await save(store);
    return store;
  }
}

async function save(store: Store) {
  await mkdir(LOCAL_DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${randomUUID()}.tmp`;
  await writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await rename(tmp, DB_FILE);
}

/** Serialise writes so concurrent requests cannot lose each other's changes. */
let queue: Promise<unknown> = Promise.resolve();
function mutate<T>(fn: (store: Store) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const store = await load();
    const result = await fn(store);
    await save(store);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

const now = () => new Date().toISOString();

function hydrate(store: Store, project: CmsProject): CmsProject {
  const c = store.categories.find((x) => x.id === project.categoryId);
  return {
    ...project,
    category: c ? { id: c.id, name: c.name, slug: c.slug } : null,
    media: [...project.media].sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

function withCounts(store: Store): CmsCategory[] {
  return [...store.categories]
    .map((c) => ({ ...c, projectCount: store.projects.filter((p) => p.categoryId === c.id).length }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

function sortProjects(list: CmsProject[]) {
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder || b.createdAt.localeCompare(a.createdAt));
}

export function createLocalRepository(): CmsRepository {
  return {
    async listCategories() {
      return withCounts(await load());
    },

    createCategory: (input: CategoryInput) =>
      mutate((store) => {
        if (store.categories.some((c) => c.slug === input.slug))
          throw new CmsError("conflict", "That web address is already in use. Choose another.");
        const category: CmsCategory = {
          id: randomUUID(),
          name: input.name,
          slug: input.slug,
          description: input.description,
          sortOrder: input.sortOrder,
          projectCount: 0,
          createdAt: now(),
          updatedAt: now(),
        };
        store.categories.push(category);
        return category;
      }),

    updateCategory: (id, input) =>
      mutate((store) => {
        const c = store.categories.find((x) => x.id === id);
        if (!c) throw new CmsError("not_found", "That category no longer exists.");
        if (store.categories.some((x) => x.slug === input.slug && x.id !== id))
          throw new CmsError("conflict", "That web address is already in use. Choose another.");
        Object.assign(c, { ...input, updatedAt: now() });
        return { ...c, projectCount: store.projects.filter((p) => p.categoryId === id).length };
      }),

    deleteCategory: (id, reassignTo) =>
      mutate((store) => {
        if (!store.categories.some((c) => c.id === id)) throw new CmsError("not_found", "That category no longer exists.");
        const users = store.projects.filter((p) => p.categoryId === id);
        if (users.length) {
          if (!reassignTo || reassignTo === id || !store.categories.some((c) => c.id === reassignTo))
            throw new CmsError("in_use", "Projects still use this category. Choose where to move them first.");
          for (const p of users) {
            p.categoryId = reassignTo;
            p.updatedAt = now();
          }
        }
        store.categories = store.categories.filter((c) => c.id !== id);
      }),

    async listProjects({ includeDrafts }) {
      const store = await load();
      const list = includeDrafts ? store.projects : store.projects.filter((p) => p.visibility === "published");
      return sortProjects(list).map((p) => hydrate(store, p));
    },

    async getProjectById(id) {
      const store = await load();
      const p = store.projects.find((x) => x.id === id);
      return p ? hydrate(store, p) : null;
    },

    async getProjectBySlug(slug, { includeDrafts }) {
      const store = await load();
      const p = store.projects.find((x) => x.slug === slug && (includeDrafts || x.visibility === "published"));
      return p ? hydrate(store, p) : null;
    },

    saveProject: (input: ProjectInput, id) =>
      mutate((store) => {
        if (!store.categories.some((c) => c.id === input.categoryId))
          throw new CmsError("invalid", "Choose a category that exists.");
        if (store.projects.some((p) => p.slug === input.slug && p.id !== id))
          throw new CmsError("conflict", "That web address is already in use. Choose another.");

        const existing = id ? store.projects.find((p) => p.id === id) : undefined;
        if (id && !existing) throw new CmsError("not_found", "That project no longer exists.");

        const { media, ...fields } = input;
        const stamp = now();
        const project: CmsProject = {
          ...(existing ?? {
            id: randomUUID(),
            createdAt: stamp,
            publishedAt: null,
            category: null,
          }),
          ...fields,
          media: media.map((m, i) => ({ ...m, id: randomUUID(), sortOrder: i })),
          updatedAt: stamp,
          publishedAt:
            input.visibility === "published" ? (existing?.publishedAt ?? stamp) : (existing?.publishedAt ?? null),
        } as CmsProject;

        if (existing) store.projects[store.projects.indexOf(existing)] = project;
        else store.projects.push(project);
        return hydrate(store, project);
      }),

    deleteProject: (id) =>
      mutate((store) => {
        const before = store.projects.length;
        store.projects = store.projects.filter((p) => p.id !== id);
        if (store.projects.length === before) throw new CmsError("not_found", "That project no longer exists.");
      }),

    async slugTaken(kind, slug, exceptId) {
      const store = await load();
      const list: { id: string; slug: string }[] = kind === "project" ? store.projects : store.categories;
      return list.some((x) => x.slug === slug && x.id !== exceptId);
    },
  };
}

/** Strict pattern for object paths the server hands out — nothing else may be written or read. */
export const LOCAL_PATH_PATTERN = /^(images|videos)\/[a-f0-9-]{36}\.(jpg|png|webp|avif|mp4|webm|mov)$/;

export function createLocalMediaStore(): MediaStore {
  return {
    async createUploadTarget(objectPath): Promise<UploadTarget> {
      return {
        mode: "local",
        path: objectPath,
        uploadUrl: `/api/admin/upload?path=${encodeURIComponent(objectPath)}`,
        publicUrl: `/api/media/${objectPath}`,
      };
    },
    async copy(fromPath, toPath) {
      if (!LOCAL_PATH_PATTERN.test(fromPath) || !LOCAL_PATH_PATTERN.test(toPath))
        throw new CmsError("invalid", "Invalid media path.");
      await mkdir(path.dirname(path.join(LOCAL_UPLOAD_DIR, toPath)), { recursive: true });
      await copyFile(path.join(LOCAL_UPLOAD_DIR, fromPath), path.join(LOCAL_UPLOAD_DIR, toPath));
      return `/api/media/${toPath}`;
    },
    async remove(paths) {
      for (const p of paths) {
        if (!LOCAL_PATH_PATTERN.test(p)) continue;
        await rm(path.join(LOCAL_UPLOAD_DIR, p), { force: true });
      }
    },
  };
}
