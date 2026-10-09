import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MEDIA_BUCKET, supabaseHost } from "./env";
import { CmsError, type CmsRepository, type MediaStore } from "./repository";
import type { CmsCategory, CmsMedia, CmsProject, UploadTarget } from "./types";
import type { CategoryInput, ProjectInput } from "./validation";

/* ——— Row mapping ——————————————————————————————————————————————— */

type Row = Record<string, unknown>;

const str = (v: unknown) => (typeof v === "string" ? v : null);
const num = (v: unknown) => (typeof v === "number" ? v : null);

function toCategory(row: Row): CmsCategory {
  const counts = row.projects as { count: number }[] | undefined;
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: str(row.description),
    sortOrder: num(row.sort_order) ?? 0,
    projectCount: counts?.[0]?.count ?? 0,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function toMedia(row: Row): CmsMedia {
  return {
    id: String(row.id),
    kind: (row.kind as CmsMedia["kind"]) ?? "image",
    url: String(row.url),
    storagePath: str(row.storage_path),
    alt: str(row.alt),
    caption: str(row.caption),
    width: num(row.width),
    height: num(row.height),
    sortOrder: num(row.sort_order) ?? 0,
  };
}

function toProject(row: Row): CmsProject {
  const category = row.category as Row | null;
  const media = ((row.media as Row[] | null) ?? []).map(toMedia).sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    categoryId: String(row.category_id),
    category: category ? { id: String(category.id), name: String(category.name), slug: String(category.slug) } : null,
    location: str(row.location),
    year: str(row.year),
    clientName: str(row.client_name),
    projectStatus: str(row.project_status),
    summary: str(row.summary),
    description: str(row.description),
    designApproach: str(row.design_approach),
    coverUrl: str(row.cover_url),
    coverPath: str(row.cover_path),
    coverAlt: str(row.cover_alt),
    videoUrl: str(row.video_url),
    videoPath: str(row.video_path),
    videoPosterUrl: str(row.video_poster_url),
    videoPosterPath: str(row.video_poster_path),
    visibility: row.visibility === "published" ? "published" : "draft",
    featured: Boolean(row.featured),
    sortOrder: num(row.sort_order) ?? 0,
    isPlaceholder: Boolean(row.is_placeholder),
    media,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    publishedAt: str(row.published_at),
  };
}

const PROJECT_SELECT = "*, category:categories(id, name, slug), media:project_media(*)";

type DbError = { code?: string; message: string; details?: string; hint?: string };

/** Translate Postgres / PostgREST errors into messages an editor (or a build log) can act on. */
function fail(error: DbError): never {
  // Network-level failure: the request never reached Supabase. postgrest-js keeps
  // the underlying cause (e.g. ENOTFOUND) in `details`.
  if (/fetch failed|FetchError|network/i.test(error.message) || /Caused by:/.test(error.details ?? "")) {
    const cause = (error.details ?? "").match(/\((E[A-Z_]+|UND_ERR_[A-Z_]+)\)/)?.[1] ?? "network error";
    const why =
      cause === "ENOTFOUND"
        ? "the hostname does not exist (ENOTFOUND)"
        : cause === "EAI_AGAIN"
          ? "the DNS lookup failed (EAI_AGAIN)"
          : `the connection failed (${cause})`;
    throw new CmsError(
      "unavailable",
      `Could not reach Supabase at ${supabaseHost()} — ${why}. Check NEXT_PUBLIC_SUPABASE_URL: it must be the exact Project URL from Supabase → Project Settings → Data API.`,
    );
  }
  if (/invalid api key|no api key found/i.test(error.message))
    throw new CmsError(
      "unavailable",
      `Supabase rejected the API key. NEXT_PUBLIC_SUPABASE_ANON_KEY must be the publishable (or anon) key of the same project as ${supabaseHost()}.`,
    );
  if (error.code === "PGRST205" || error.code === "42P01")
    throw new CmsError(
      "unavailable",
      `The CMS tables are missing in ${supabaseHost()}. Run supabase/migrations/20261008120000_cms_schema.sql in the Supabase SQL Editor. (${error.message})`,
    );
  if (error.code === "42501" && /permission denied for (table|schema)/i.test(error.message))
    throw new CmsError(
      "unavailable",
      `The website's database role lacks table permissions (${error.message}). Re-run supabase/migrations/20261008120000_cms_schema.sql, which grants them.`,
    );
  if (error.code === "23505") throw new CmsError("conflict", "That web address is already in use. Choose another.");
  if (error.code === "42501" || error.code === "PGRST301")
    throw new CmsError("unauthorized", "Your account is not allowed to make this change.");
  if (error.message?.includes("category_in_use"))
    throw new CmsError("in_use", "Projects still use this category. Choose where to move them first.");
  throw new CmsError("unavailable", `The database rejected the request: ${error.message}`);
}

/* ——— Repository ——————————————————————————————————————————————— */

export function createSupabaseRepository(db: SupabaseClient): CmsRepository {
  async function getProjectBy(column: "id" | "slug", value: string, includeDrafts: boolean) {
    let query = db.from("projects").select(PROJECT_SELECT).eq(column, value);
    if (!includeDrafts) query = query.eq("visibility", "published");
    const { data, error } = await query.maybeSingle();
    if (error) fail(error);
    return data ? toProject(data) : null;
  }

  return {
    async listCategories() {
      const { data, error } = await db
        .from("categories")
        .select("*, projects(count)")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) fail(error);
      return (data ?? []).map(toCategory);
    },

    async createCategory(input: CategoryInput) {
      const { data, error } = await db
        .from("categories")
        .insert({ name: input.name, slug: input.slug, description: input.description, sort_order: input.sortOrder })
        .select("*, projects(count)")
        .single();
      if (error) fail(error);
      return toCategory(data);
    },

    async updateCategory(id, input) {
      const { data, error } = await db
        .from("categories")
        .update({ name: input.name, slug: input.slug, description: input.description, sort_order: input.sortOrder })
        .eq("id", id)
        .select("*, projects(count)")
        .maybeSingle();
      if (error) fail(error);
      if (!data) throw new CmsError("not_found", "That category no longer exists.");
      return toCategory(data);
    },

    async deleteCategory(id, reassignTo) {
      const { error } = await db.rpc("admin_delete_category", { target: id, reassign_to: reassignTo });
      if (error) fail(error);
    },

    async listProjects({ includeDrafts }) {
      let query = db.from("projects").select(PROJECT_SELECT);
      if (!includeDrafts) query = query.eq("visibility", "published");
      const { data, error } = await query
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) fail(error);
      return (data ?? []).map(toProject);
    },

    getProjectById: (id) => getProjectBy("id", id, true),

    getProjectBySlug: (slug, { includeDrafts }) => getProjectBy("slug", slug, includeDrafts),

    async saveProject(input: ProjectInput, id) {
      const payload = {
        id,
        title: input.title,
        slug: input.slug,
        category_id: input.categoryId,
        location: input.location,
        year: input.year,
        client_name: input.clientName,
        project_status: input.projectStatus,
        summary: input.summary,
        description: input.description,
        design_approach: input.designApproach,
        cover_url: input.coverUrl,
        cover_path: input.coverPath,
        cover_alt: input.coverAlt,
        video_url: input.videoUrl,
        video_path: input.videoPath,
        video_poster_url: input.videoPosterUrl,
        video_poster_path: input.videoPosterPath,
        visibility: input.visibility,
        featured: input.featured,
        is_placeholder: input.isPlaceholder,
        sort_order: input.sortOrder,
        media: input.media.map((m) => ({
          kind: m.kind,
          url: m.url,
          storage_path: m.storagePath,
          alt: m.alt,
          caption: m.caption,
          width: m.width,
          height: m.height,
        })),
      };
      const { data, error } = await db.rpc("admin_save_project", { payload });
      if (error) fail(error);
      const saved = await getProjectBy("id", String(data), true);
      if (!saved) throw new CmsError("unavailable", "The project was saved but could not be reloaded.");
      return saved;
    },

    async deleteProject(id) {
      const { error, count } = await db.from("projects").delete({ count: "exact" }).eq("id", id);
      if (error) fail(error);
      if (!count) throw new CmsError("not_found", "That project no longer exists.");
    },

    async slugTaken(kind, slug, exceptId) {
      let query = db.from(kind === "project" ? "projects" : "categories").select("id").eq("slug", slug);
      if (exceptId) query = query.neq("id", exceptId);
      const { data, error } = await query.limit(1);
      if (error) fail(error);
      return (data ?? []).length > 0;
    },
  };
}

/* ——— Storage ——————————————————————————————————————————————————— */

export function createSupabaseMediaStore(db: SupabaseClient): MediaStore {
  const bucket = db.storage.from(MEDIA_BUCKET);
  return {
    async createUploadTarget(path): Promise<UploadTarget> {
      const { data, error } = await bucket.createSignedUploadUrl(path);
      if (error || !data) throw new CmsError("unavailable", `Upload could not be prepared: ${error?.message ?? "unknown"}`);
      return { mode: "supabase", bucket: MEDIA_BUCKET, path: data.path, token: data.token, publicUrl: bucket.getPublicUrl(data.path).data.publicUrl };
    },
    async copy(fromPath, toPath) {
      const { error } = await bucket.copy(fromPath, toPath);
      if (error) throw new CmsError("unavailable", `A file could not be copied: ${error.message}`);
      return bucket.getPublicUrl(toPath).data.publicUrl;
    },
    async remove(paths) {
      if (!paths.length) return;
      const { error } = await bucket.remove(paths);
      if (error) console.error("[cms] storage cleanup failed", error.message);
    },
  };
}
