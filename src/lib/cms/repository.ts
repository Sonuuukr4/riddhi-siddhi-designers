import "server-only";
import type { CmsCategory, CmsProject, UploadTarget } from "./types";
import type { CategoryInput, ProjectInput } from "./validation";

/**
 * Storage-agnostic contract for CMS content. Implemented by
 * supabase-repo.ts (production) and local-repo.ts (development preview).
 */
export interface CmsRepository {
  listCategories(): Promise<CmsCategory[]>;
  createCategory(input: CategoryInput): Promise<CmsCategory>;
  updateCategory(id: string, input: CategoryInput): Promise<CmsCategory>;
  /** Deletes a category. If projects use it, `reassignTo` must name another category. */
  deleteCategory(id: string, reassignTo: string | null): Promise<void>;

  listProjects(opts: { includeDrafts: boolean }): Promise<CmsProject[]>;
  getProjectById(id: string): Promise<CmsProject | null>;
  getProjectBySlug(slug: string, opts: { includeDrafts: boolean }): Promise<CmsProject | null>;
  /** Creates (id = null) or replaces a project and its media list atomically. */
  saveProject(input: ProjectInput, id: string | null): Promise<CmsProject>;
  deleteProject(id: string): Promise<void>;
  slugTaken(kind: "project" | "category", slug: string, exceptId: string | null): Promise<boolean>;
}

/** Where uploaded files live. */
export interface MediaStore {
  createUploadTarget(path: string): Promise<UploadTarget>;
  /** Copies an object (used when duplicating a project) and returns the new public URL. */
  copy(fromPath: string, toPath: string): Promise<string>;
  remove(paths: string[]): Promise<void>;
}

export type CmsErrorCode = "not_found" | "conflict" | "in_use" | "invalid" | "unauthorized" | "unavailable";

export class CmsError extends Error {
  constructor(
    public code: CmsErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "CmsError";
  }
}

/** Every storage object referenced by a project (cover, video, poster, gallery). */
export function storagePathsOf(project: CmsProject | null | undefined): string[] {
  if (!project) return [];
  return [project.coverPath, project.videoPath, project.videoPosterPath, ...project.media.map((m) => m.storagePath)].filter(
    (p): p is string => Boolean(p),
  );
}
