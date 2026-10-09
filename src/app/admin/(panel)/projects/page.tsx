import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ProjectsTable, type ProjectRow } from "@/components/admin/ProjectsTable";
import { PageHeader, buttonClass } from "@/components/admin/ui";
import { getAdminCategories, getAdminProjects } from "@/lib/cms/admin-queries";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [{ status }, projects, categories] = await Promise.all([searchParams, getAdminProjects(), getAdminCategories()]);

  const rows: ProjectRow[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    categoryId: p.categoryId,
    categoryName: p.category?.name ?? null,
    visibility: p.visibility,
    featured: p.featured,
    isPlaceholder: p.isPlaceholder,
    coverUrl: p.coverUrl,
    location: p.location,
    year: p.year,
    imageCount: p.media.length + (p.coverUrl ? 1 : 0),
    hasVideo: Boolean(p.videoUrl),
    updatedAt: p.updatedAt,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Projects"
        description="Add, edit and publish the work shown on the website."
        actions={
          <Link href="/admin/projects/new" className={buttonClass("primary")}>
            <Plus className="size-4" aria-hidden />
            Add project
          </Link>
        }
      />
      <ProjectsTable
        rows={rows}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initialStatus={status === "published" || status === "draft" ? status : "all"}
      />
    </>
  );
}
