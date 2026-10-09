import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { projects as staticProjects, staticCategories } from "@/content/projects";
import type { PortfolioCategory, Project } from "@/lib/types";
import { createPublicSupabase } from "@/lib/supabase/server";
import { CMS_TAG, cmsMode } from "./env";
import { createLocalRepository } from "./local-repo";
import { toPublicProject } from "./mapping";
import { createSupabaseRepository } from "./supabase-repo";

/**
 * Public, cached read API for every page of the site.
 *
 * Data comes from the CMS when one is connected and from src/content
 * otherwise. Results are cached under the "cms" tag; admin changes expire
 * that tag, so a newly published project appears on the next request.
 */

type PublicContent = { projects: Project[]; categories: PortfolioCategory[]; source: "cms" | "static" };

function countCategories(list: { slug: string; name: string }[], projects: Project[]): PortfolioCategory[] {
  return list.map((c) => ({ ...c, count: projects.filter((p) => p.categorySlug === c.slug).length }));
}

async function loadContent(): Promise<PublicContent> {
  const mode = cmsMode();
  if (mode === "static") {
    return { projects: staticProjects, categories: countCategories(staticCategories, staticProjects), source: "static" };
  }
  const repo = mode === "supabase" ? createSupabaseRepository(createPublicSupabase()) : createLocalRepository();
  const [cmsProjects, cmsCategories] = await Promise.all([
    repo.listProjects({ includeDrafts: false }),
    repo.listCategories(),
  ]);
  const projects = cmsProjects.filter((p) => p.visibility === "published").map(toPublicProject);
  return {
    projects,
    categories: countCategories(
      cmsCategories.map((c) => ({ slug: c.slug, name: c.name })),
      projects,
    ),
    source: "cms",
  };
}

const getCachedContent = unstable_cache(loadContent, ["cms-public-content-v1"], {
  tags: [CMS_TAG],
  revalidate: 600,
});

/** Deduplicated per request; cached across requests until the CMS changes. */
export const getPublicContent = cache(() => getCachedContent());

export async function getPublishedProjects(): Promise<Project[]> {
  return (await getPublicContent()).projects;
}

/** Every category, with its number of published projects (filters hide empty ones). */
export async function getPortfolioCategories(): Promise<PortfolioCategory[]> {
  return (await getPublicContent()).categories;
}

/** Projects for the home page spreads: featured first, topped up in portfolio order. */
export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
  const projects = await getPublishedProjects();
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, limit);
}

export async function getProjectWithNeighbours(slug: string) {
  const projects = await getPublishedProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  const n = projects.length;
  return {
    project: projects[index],
    number: index + 1,
    total: n,
    previous: projects[(index - 1 + n) % n],
    next: projects[(index + 1) % n],
    previousNumber: ((index - 1 + n) % n) + 1,
    nextNumber: ((index + 1) % n) + 1,
  };
}

/** Lightweight list for the global project index overlay. */
export type ProjectSummary = Pick<
  Project,
  "slug" | "title" | "category" | "categorySlug" | "typology" | "location" | "status" | "heroImage" | "placeholder"
>;

export async function getProjectSummaries(): Promise<ProjectSummary[]> {
  return (await getPublishedProjects()).map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    categorySlug: p.categorySlug,
    typology: p.typology,
    location: p.location,
    status: p.status,
    heroImage: p.heroImage,
    placeholder: p.placeholder,
  }));
}
