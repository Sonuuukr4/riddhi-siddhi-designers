import "server-only";
import { requireAdminPage } from "@/lib/auth/session";
import { getAdminCms } from "./admin-repo";
import type { DashboardStats } from "./types";

/**
 * Reads for admin pages (Server Components). Each call re-checks the session,
 * so a page can never render admin data for a visitor who is not signed in.
 */

export async function getAdminCategories() {
  await requireAdminPage();
  const { repo } = await getAdminCms();
  return repo.listCategories();
}

export async function getAdminProjects() {
  await requireAdminPage();
  const { repo } = await getAdminCms();
  return repo.listProjects({ includeDrafts: true });
}

export async function getAdminProject(id: string) {
  await requireAdminPage();
  const { repo } = await getAdminCms();
  return repo.getProjectById(id);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdminPage();
  const { repo } = await getAdminCms();
  const [projects, categories] = await Promise.all([repo.listProjects({ includeDrafts: true }), repo.listCategories()]);
  const published = projects.filter((p) => p.visibility === "published").length;
  const mediaFiles = projects.reduce(
    (n, p) => n + p.media.length + (p.coverUrl ? 1 : 0) + (p.videoUrl ? 1 : 0),
    0,
  );
  const recent = [...projects]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)
    .map(({ id, title, slug, visibility, coverUrl, createdAt, updatedAt, category }) => ({
      id,
      title,
      slug,
      visibility,
      coverUrl,
      createdAt,
      updatedAt,
      category,
    }));
  return {
    totalProjects: projects.length,
    published,
    drafts: projects.length - published,
    categories: categories.length,
    mediaFiles,
    recent,
  };
}
