/**
 * CMS data model (mirrors supabase/migrations). These shapes are shared by the
 * admin UI, the server actions and both repository implementations.
 */

export type Visibility = "draft" | "published";

/** What a gallery item depicts — decides which section of the project page it appears in. */
export type MediaKind = "image" | "drawing" | "visualization";

export type CmsCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  /** Number of projects (any visibility) assigned to the category. */
  projectCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CmsMedia = {
  id: string;
  kind: MediaKind;
  url: string;
  /** Object path inside the media bucket; null for external URLs (e.g. seeded placeholders). */
  storagePath: string | null;
  alt: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
};

export type CmsProject = {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  category: { id: string; name: string; slug: string } | null;
  location: string | null;
  year: string | null;
  clientName: string | null;
  /** Free-text project status, e.g. "Completed" or "In progress". */
  projectStatus: string | null;
  summary: string | null;
  description: string | null;
  designApproach: string | null;
  coverUrl: string | null;
  coverPath: string | null;
  coverAlt: string | null;
  videoUrl: string | null;
  videoPath: string | null;
  videoPosterUrl: string | null;
  videoPosterPath: string | null;
  visibility: Visibility;
  featured: boolean;
  sortOrder: number;
  isPlaceholder: boolean;
  media: CmsMedia[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type DashboardStats = {
  totalProjects: number;
  published: number;
  drafts: number;
  categories: number;
  mediaFiles: number;
  recent: Pick<CmsProject, "id" | "title" | "slug" | "visibility" | "coverUrl" | "createdAt" | "updatedAt" | "category">[];
};

/** Where the browser should send an upload, issued by the server after authorisation. */
export type UploadTarget =
  | { mode: "supabase"; bucket: string; path: string; token: string; publicUrl: string }
  | { mode: "local"; path: string; uploadUrl: string; publicUrl: string };

/** Result shape returned by every admin server action. */
export type ActionResult<T = undefined> =
  | ({ ok: true } & ([T] extends [undefined] ? object : { data: T }))
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
