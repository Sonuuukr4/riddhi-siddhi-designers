import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { Badge, PageHeader, formatDate } from "@/components/admin/ui";
import { getAdminCategories, getAdminProject } from "@/lib/cms/admin-queries";
import { mediaUrlPrefix } from "@/lib/cms/env";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getAdminProject(id);
  return { title: project ? `Edit · ${project.title}` : "Project not found" };
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const [project, categories] = await Promise.all([getAdminProject(id), getAdminCategories()]);
  if (!project) notFound();

  return (
    <>
      <PageHeader
        eyebrow={<Link href="/admin/projects" className="hover:text-ink">← Projects</Link>}
        title={project.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={project.visibility === "published" ? "published" : "draft"}>{project.visibility}</Badge>
            {project.isPlaceholder && <Badge tone="demo">Demo</Badge>}
            <span>Last updated {formatDate(project.updatedAt)}</span>
          </span>
        }
      />
      {/* Keyed by id so moving between projects always starts from a fresh form. */}
      <ProjectForm
        key={project.id}
        project={project}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        mediaPrefix={mediaUrlPrefix()}
      />
    </>
  );
}
