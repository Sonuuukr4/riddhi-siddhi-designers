import { projects as staticProjects, staticCategories } from "@/content/projects";
import type { CmsCategory, CmsMedia, CmsProject } from "./types";

/**
 * The starting content for a new CMS: the nine portfolio categories and the
 * six existing demo projects, flagged as placeholders. Used to seed the local
 * preview store, and mirrored in supabase/seed.sql.
 */

const EPOCH = "2026-10-01T00:00:00.000Z";

export function seedCategories(): CmsCategory[] {
  return staticCategories.map((c, i) => ({
    id: `cat-${c.slug}`,
    name: c.name,
    slug: c.slug,
    description: null,
    sortOrder: (i + 1) * 10,
    projectCount: 0,
    createdAt: EPOCH,
    updatedAt: EPOCH,
  }));
}

export function seedProjects(): CmsProject[] {
  return staticProjects.map((p, i) => {
    const media: CmsMedia[] = [];
    const push = (kind: CmsMedia["kind"], src: string, alt: string, caption?: string) =>
      media.push({
        id: `${p.slug}-m${media.length + 1}`,
        kind,
        url: src,
        storagePath: null,
        alt,
        caption: caption ?? null,
        width: null,
        height: null,
        sortOrder: media.length,
      });
    for (const g of p.gallery) {
      push("image", g.src, g.alt, g.caption);
      if (g.pairWith) push("image", g.pairWith.src, g.pairWith.alt);
    }
    for (const v of p.visualizations) push("visualization", v.src, v.alt);

    return {
      id: `prj-${p.slug}`,
      title: p.title,
      slug: p.slug,
      categoryId: `cat-${p.categorySlug}`,
      category: null,
      location: p.location,
      year: p.year,
      clientName: p.client,
      projectStatus: p.status,
      summary: p.summary,
      description: p.description.join("\n\n"),
      designApproach: p.approach.map((a) => `${a.title} — ${a.text}`).join("\n\n"),
      coverUrl: p.heroImage.src,
      coverPath: null,
      coverAlt: p.heroImage.alt,
      videoUrl: null,
      videoPath: null,
      videoPosterUrl: null,
      videoPosterPath: null,
      visibility: "published",
      featured: Boolean(p.featured),
      sortOrder: (i + 1) * 10,
      isPlaceholder: true,
      media,
      createdAt: EPOCH,
      updatedAt: EPOCH,
      publishedAt: EPOCH,
    };
  });
}
