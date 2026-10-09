import type { Metadata } from "next";
import Link from "next/link";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { PageHeader } from "@/components/admin/ui";
import { getAdminCategories } from "@/lib/cms/admin-queries";
import { mediaUrlPrefix } from "@/lib/cms/env";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  const categories = await getAdminCategories();
  return (
    <>
      <PageHeader
        eyebrow={<Link href="/admin/projects" className="hover:text-ink">← Projects</Link>}
        title="New project"
        description="Save as a draft at any time. Publish when the cover image and description are ready."
      />
      <ProjectForm
        project={null}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        mediaPrefix={mediaUrlPrefix()}
      />
    </>
  );
}
