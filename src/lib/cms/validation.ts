import { z } from "zod";
import { MAX_GALLERY_ITEMS } from "./limits";

/**
 * Server-side validation for everything the admin submits. The admin form
 * uses the same schemas for instant feedback, but the server never trusts it.
 */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .transform((v) => v ?? null);

export const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "The web address needs at least two characters.")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only.");

export const mediaItemSchema = z.object({
  kind: z.enum(["image", "drawing", "visualization"]),
  url: z.string().trim().min(1).max(2048),
  storagePath: z.string().trim().max(512).nullable().optional().transform((v) => v || null),
  alt: optionalText(300),
  caption: optionalText(200),
  width: z.number().int().positive().max(20000).nullable().optional().transform((v) => v ?? null),
  height: z.number().int().positive().max(20000).nullable().optional().transform((v) => v ?? null),
});

export const projectInputSchema = z
  .object({
    title: z.string().trim().min(2, "Please give the project a title.").max(140),
    slug: slugSchema,
    categoryId: z.string().trim().min(1, "Choose a category."),
    location: optionalText(140),
    year: optionalText(20),
    clientName: optionalText(140),
    projectStatus: optionalText(60),
    summary: optionalText(240),
    description: optionalText(8000),
    designApproach: optionalText(8000),
    coverUrl: z.string().trim().max(2048).nullable().optional().transform((v) => v || null),
    coverPath: z.string().trim().max(512).nullable().optional().transform((v) => v || null),
    coverAlt: optionalText(300),
    videoUrl: z.string().trim().max(2048).nullable().optional().transform((v) => v || null),
    videoPath: z.string().trim().max(512).nullable().optional().transform((v) => v || null),
    videoPosterUrl: z.string().trim().max(2048).nullable().optional().transform((v) => v || null),
    videoPosterPath: z.string().trim().max(512).nullable().optional().transform((v) => v || null),
    visibility: z.enum(["draft", "published"]),
    featured: z.boolean(),
    isPlaceholder: z.boolean(),
    sortOrder: z.number().int().min(-10000).max(10000),
    media: z.array(mediaItemSchema).max(MAX_GALLERY_ITEMS, `A project can hold up to ${MAX_GALLERY_ITEMS} images.`),
  })
  .superRefine((p, ctx) => {
    if (p.visibility === "published") {
      if (!p.coverUrl) ctx.addIssue({ code: "custom", path: ["coverUrl"], message: "Add a cover image before publishing." });
      if (!p.description)
        ctx.addIssue({ code: "custom", path: ["description"], message: "Add a description before publishing." });
    }
  });

export type ProjectInput = z.infer<typeof projectInputSchema>;
export type MediaItemInput = z.infer<typeof mediaItemSchema>;

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2, "Please enter a category name.").max(60),
  slug: slugSchema,
  description: optionalText(300),
  sortOrder: z.number().int().min(-10000).max(10000),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export const uploadRequestSchema = z.object({
  kind: z.enum(["image", "video"]),
  mime: z.string().min(3).max(100),
  size: z.number().int().positive(),
  filename: z.string().max(255).optional(),
});

export type UploadRequest = z.infer<typeof uploadRequestSchema>;

/** Flattens zod issues into { field: message } for the form. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/* ——— Video URLs ——————————————————————————————————————————————— */

export type ParsedVideo =
  | { kind: "youtube"; id: string; url: string; embedUrl: string }
  | { kind: "vimeo"; id: string; url: string; embedUrl: string }
  | { kind: "file"; url: string };

/**
 * Accepts YouTube and Vimeo links (any common form), uploaded files in the
 * media store, or a direct https link to an .mp4/.webm file.
 */
export function parseVideoUrl(raw: string, mediaPrefix: string | null): ParsedVideo | null {
  const value = raw.trim();
  if (!value) return null;
  if (mediaPrefix && value.startsWith(mediaPrefix)) return { kind: "file", url: value };

  let u: URL;
  try {
    u = new URL(value);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^www\.|^m\./, "");

  if (host === "youtu.be" || host === "youtube.com" || host === "youtube-nocookie.com") {
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0] || null;
    else if (u.pathname === "/watch") id = u.searchParams.get("v");
    else {
      const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/);
      id = m ? m[1] : null;
    }
    if (!id || !/^[A-Za-z0-9_-]{6,20}$/.test(id)) return null;
    return {
      kind: "youtube",
      id,
      url: `https://www.youtube.com/watch?v=${id}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`,
    };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = u.pathname.match(/(?:^|\/)(\d{6,12})(?:\/|$)/);
    if (!m) return null;
    return {
      kind: "vimeo",
      id: m[1],
      url: `https://vimeo.com/${m[1]}`,
      embedUrl: `https://player.vimeo.com/video/${m[1]}?dnt=1&title=0&byline=0&portrait=0`,
    };
  }

  if (/\.(mp4|webm)$/i.test(u.pathname)) return { kind: "file", url: u.toString() };
  return null;
}

/** Image URLs the CMS will store: our own media store, or the library behind the seeded placeholders. */
export function isAllowedImageUrl(url: string, mediaPrefix: string | null): boolean {
  if (mediaPrefix && url.startsWith(mediaPrefix)) return true;
  return url.startsWith("https://images.unsplash.com/");
}
