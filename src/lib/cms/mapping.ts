import { img } from "@/content/images";
import type { Drawing, GalleryItem, GalleryLayout, ImageAsset, Project, ProjectVideo } from "@/lib/types";
import { pad } from "@/lib/utils";
import { mediaUrlPrefix } from "./env";
import type { CmsMedia, CmsProject } from "./types";
import { parseVideoUrl } from "./validation";

/**
 * Converts a CMS project into the `Project` shape the public components
 * already render, so new projects inherit the full editorial treatment.
 */

const paragraphs = (text: string | null) =>
  (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);

const TEMPLATE_NOTE = /^This entry is a template/;

const firstSentence = (text: string) => {
  const m = text.match(/^(.{20,220}?[.!?])(\s|$)/);
  return m ? m[1] : text.slice(0, 180);
};

/** Rhythm for automatic art direction of a gallery: wide, paired, tall, offset… */
const RHYTHM: GalleryLayout[] = ["full", "pair", "portrait", "wide", "pair", "offset"];

export function layoutGallery(images: (ImageAsset & { caption?: string })[]): GalleryItem[] {
  const out: GalleryItem[] = [];
  let i = 0;
  let step = 0;
  while (i < images.length) {
    let layout = RHYTHM[step % RHYTHM.length];
    if (layout === "pair" && i + 1 >= images.length) layout = "wide";
    const item: GalleryItem = { ...images[i], layout };
    if (layout === "pair") {
      item.pairWith = images[i + 1];
      i += 2;
    } else {
      i += 1;
    }
    out.push(item);
    step += 1;
  }
  return out;
}

export function toPublicProject(p: CmsProject): Project {
  const categoryName = p.category?.name ?? "Project";
  const asset = (m: CmsMedia, n: number): ImageAsset & { caption?: string } => ({
    src: m.url,
    alt: m.alt ?? m.caption ?? `${p.title} — image ${n}`,
    placeholder: p.isPlaceholder,
    caption: m.caption ?? undefined,
  });

  const images = p.media.filter((m) => m.kind === "image");
  const cover: ImageAsset = p.coverUrl
    ? { src: p.coverUrl, alt: p.coverAlt ?? `${p.title}, ${categoryName}`, placeholder: p.isPlaceholder }
    : images[0]
      ? asset(images[0], 1)
      : { ...img.concretePlanes, alt: p.title };

  const drawings: Drawing[] = p.media
    .filter((m) => m.kind === "drawing")
    .map((m, i) => ({ sheet: `D-${pad(i + 1)}`, title: m.caption ?? "Drawing", kind: "plan", image: asset(m, i + 1) }));

  const visualizations = p.media.filter((m) => m.kind === "visualization").map((m, i) => asset(m, i + 1));

  // The seeded demo entries carry an editing note ("This entry is a template… Replace it…") meant
  // for the admin, not for visitors. It is dropped here for demo entries only; real projects are untouched.
  const description = paragraphs(p.description).filter((d) => !(p.isPlaceholder && TEMPLATE_NOTE.test(d)));
  const approachParas = paragraphs(p.designApproach);
  // "Title — text" paragraphs become the structured three-column approach.
  const structured = approachParas.map((a) => a.match(/^([^—]{2,40}) — (.+)$/));
  const approach = structured.every(Boolean) && structured.length
    ? structured.map((m) => ({ title: m![1].trim(), text: m![2].trim() }))
    : [];

  let video: ProjectVideo | undefined;
  if (p.videoUrl) {
    const parsed = parseVideoUrl(p.videoUrl, mediaUrlPrefix());
    if (parsed) {
      video = {
        kind: parsed.kind,
        url: parsed.url,
        embedUrl: parsed.kind === "file" ? undefined : parsed.embedUrl,
        poster: p.videoPosterUrl ?? p.coverUrl ?? undefined,
      };
    }
  }

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: categoryName,
    categorySlug: p.category?.slug ?? "other",
    typology: categoryName,
    location: p.location,
    year: p.year,
    status: p.projectStatus,
    client: p.clientName,
    scope: [],
    summary: p.summary ?? (description[0] ? firstSentence(description[0]) : ""),
    description,
    approach,
    approachText: approach.length ? undefined : approachParas,
    heroImage: cover,
    gallery: layoutGallery(images.map((m, i) => asset(m, i + 1))),
    drawings,
    visualizations,
    materials: [],
    video,
    featured: p.featured,
    placeholder: p.isPlaceholder,
  };
}
