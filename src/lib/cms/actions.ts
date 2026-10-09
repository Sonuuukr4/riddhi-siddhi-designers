"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createLocalSessionToken,
  LOCAL_SESSION_COOKIE,
  localAuthConfigured,
  verifyLocalPassword,
} from "@/lib/auth/local-auth";
import { requireAdmin } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAdminCms } from "./admin-repo";
import { CMS_TAG, cmsMode, mediaUrlPrefix } from "./env";
import { checkUpload, extensionFor } from "./limits";
import { CmsError, storagePathsOf } from "./repository";
import type { ActionResult, CmsCategory, UploadTarget } from "./types";
import {
  categoryInputSchema,
  fieldErrors,
  isAllowedImageUrl,
  parseVideoUrl,
  projectInputSchema,
  slugify,
  uploadRequestSchema,
  type ProjectInput,
} from "./validation";

/* ——— Helpers ——————————————————————————————————————————————————— */

const OBJECT_PATH = /^(images|videos)\/[a-f0-9-]{36}\.(jpg|png|webp|avif|mp4|webm|mov)$/;

function failure(e: unknown): { ok: false; error: string } {
  if (e instanceof CmsError) return { ok: false, error: e.message };
  console.error("[cms] action failed", e);
  return { ok: false, error: "Something went wrong. Please try again." };
}

/** Make new content visible on the public site immediately. */
function publish() {
  updateTag(CMS_TAG);
  revalidatePath("/", "layout");
}

/**
 * Every file reference must point at our own media store (or, for the seeded
 * demo projects, the original placeholder library), and every object path
 * must match the URL it claims to be — so a crafted request cannot make the
 * site display arbitrary third-party content.
 */
function checkMediaReferences(input: ProjectInput): Record<string, string> {
  const prefix = mediaUrlPrefix();
  const errors: Record<string, string> = {};
  const checkPath = (url: string | null, objectPath: string | null, key: string) => {
    if (!objectPath) return;
    if (!OBJECT_PATH.test(objectPath) || !prefix || url !== prefix + objectPath) errors[key] = "This file reference is not valid.";
  };

  if (input.coverUrl && !isAllowedImageUrl(input.coverUrl, prefix)) errors.coverUrl = "Upload the cover image again.";
  checkPath(input.coverUrl, input.coverPath, "coverUrl");

  input.media.forEach((m, i) => {
    if (!isAllowedImageUrl(m.url, prefix)) errors[`media.${i}`] = "Upload this image again.";
    checkPath(m.url, m.storagePath, `media.${i}`);
  });

  if (input.videoUrl) {
    if (!parseVideoUrl(input.videoUrl, prefix))
      errors.videoUrl = "Use a YouTube or Vimeo link, or upload an MP4 / WebM file.";
    checkPath(input.videoUrl, input.videoPath, "videoUrl");
  } else if (input.videoPath) {
    errors.videoUrl = "This file reference is not valid.";
  }

  if (input.videoPosterUrl && !isAllowedImageUrl(input.videoPosterUrl, prefix))
    errors.videoPosterUrl = "Upload the poster image again.";
  checkPath(input.videoPosterUrl, input.videoPosterPath, "videoPosterUrl");
  return errors;
}

/* ——— Authentication ———————————————————————————————————————————— */

export type SignInState = { error: string | null; email?: string };

const credentials = z.object({
  email: z.string().trim().max(200).optional(),
  password: z.string().min(1, "Enter your password.").max(200),
});

export async function signInAction(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = credentials.safeParse({ email: formData.get("email") ?? undefined, password: formData.get("password") });
  const email = typeof formData.get("email") === "string" ? String(formData.get("email")) : "";
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your details.", email };

  const mode = cmsMode();
  if (mode === "static") return { error: "The content database is not connected yet.", email };

  if (mode === "local") {
    if (!localAuthConfigured()) return { error: "Set LOCAL_ADMIN_PASSWORD (8+ characters) in .env.local first." };
    if (!verifyLocalPassword(parsed.data.password)) {
      await new Promise((r) => setTimeout(r, 600)); // slow down guessing
      return { error: "That password is not correct." };
    }
    const { token, expires } = createLocalSessionToken();
    (await cookies()).set(LOCAL_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires,
    });
    redirect("/admin");
  }

  if (!parsed.data.email || !z.email().safeParse(parsed.data.email).success)
    return { error: "Enter the email address of your admin account.", email };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user) return { error: "Email or password is not correct.", email };

  const { data: adminRow } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!adminRow) {
    await supabase.auth.signOut();
    return { error: "This account does not have admin access.", email };
  }
  redirect("/admin");
}

export async function signOutAction() {
  if (cmsMode() === "supabase") {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  }
  (await cookies()).delete(LOCAL_SESSION_COOKIE);
  redirect("/admin/login");
}

export type PasswordState = { ok: boolean; message: string | null };

export async function changePasswordAction(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  try {
    const session = await requireAdmin();
    if (session.mode !== "supabase")
      return { ok: false, message: "In local preview mode the password is set by LOCAL_ADMIN_PASSWORD." };
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (password.length < 10) return { ok: false, message: "Use at least 10 characters." };
    if (password !== confirm) return { ok: false, message: "The two passwords do not match." };
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Password updated." };
  } catch (e) {
    return { ok: false, message: failure(e).error };
  }
}

/* ——— Projects ——————————————————————————————————————————————————— */

export async function saveProjectAction(
  rawInput: unknown,
  id: string | null,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
    const parsed = projectInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
    }
    const input = parsed.data;
    const refErrors = checkMediaReferences(input);
    if (Object.keys(refErrors).length)
      return { ok: false, error: "Some media could not be verified.", fieldErrors: refErrors };

    const { repo, media } = await getAdminCms();
    if (await repo.slugTaken("project", input.slug, id))
      return { ok: false, error: "Please check the highlighted fields.", fieldErrors: { slug: "Another project already uses this web address." } };

    const previous = id ? await repo.getProjectById(id) : null;
    if (id && !previous) return { ok: false, error: "That project no longer exists." };

    const saved = await repo.saveProject(input, id);

    // Remove files that were replaced or taken out of the gallery.
    const keep = new Set(storagePathsOf(saved));
    await media.remove(storagePathsOf(previous).filter((p) => !keep.has(p)));

    publish();
    return { ok: true, data: { id: saved.id, slug: saved.slug } };
  } catch (e) {
    return failure(e);
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { repo, media } = await getAdminCms();
    const project = await repo.getProjectById(String(id));
    if (!project) return { ok: false, error: "That project no longer exists." };
    await repo.deleteProject(project.id);
    await media.remove(storagePathsOf(project));
    publish();
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

/** Creates an unpublished copy, including private copies of every uploaded file. */
export async function duplicateProjectAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const { repo, media } = await getAdminCms();
    const source = await repo.getProjectById(String(id));
    if (!source) return { ok: false, error: "That project no longer exists." };

    let slug = `${source.slug}-copy`.slice(0, 80);
    for (let n = 2; await repo.slugTaken("project", slug, null); n++) slug = `${source.slug}-copy-${n}`.slice(0, 80);

    const copyFile = async (url: string | null, objectPath: string | null) => {
      if (!url || !objectPath) return { url, path: objectPath };
      const ext = objectPath.split(".").pop();
      const next = `${objectPath.split("/")[0]}/${randomUUID()}.${ext}`;
      return { url: await media.copy(objectPath, next), path: next };
    };

    const cover = await copyFile(source.coverUrl, source.coverPath);
    const video = await copyFile(source.videoUrl, source.videoPath);
    const poster = await copyFile(source.videoPosterUrl, source.videoPosterPath);
    const items = [];
    for (const m of source.media) {
      const f = await copyFile(m.url, m.storagePath);
      items.push({ ...m, url: f.url ?? m.url, storagePath: f.path });
    }

    const input = projectInputSchema.parse({
      title: `${source.title} (copy)`.slice(0, 140),
      slug,
      categoryId: source.categoryId,
      location: source.location,
      year: source.year,
      clientName: source.clientName,
      projectStatus: source.projectStatus,
      summary: source.summary,
      description: source.description,
      designApproach: source.designApproach,
      coverUrl: cover.url,
      coverPath: cover.path,
      coverAlt: source.coverAlt,
      videoUrl: video.url,
      videoPath: video.path,
      videoPosterUrl: poster.url,
      videoPosterPath: poster.path,
      visibility: "draft",
      featured: false,
      isPlaceholder: source.isPlaceholder,
      sortOrder: source.sortOrder,
      media: items.map((m) => ({
        kind: m.kind,
        url: m.url,
        storagePath: m.storagePath,
        alt: m.alt,
        caption: m.caption,
        width: m.width,
        height: m.height,
      })),
    });
    const saved = await repo.saveProject(input, null);
    publish();
    return { ok: true, data: { id: saved.id } };
  } catch (e) {
    return failure(e);
  }
}

/** Returns a unique, valid web address derived from a title (used by the form's "auto" slug). */
export async function suggestSlugAction(title: string, exceptId: string | null): Promise<string> {
  await requireAdmin();
  const { repo } = await getAdminCms();
  const base = slugify(String(title)) || "project";
  let slug = base;
  for (let n = 2; await repo.slugTaken("project", slug, exceptId); n++) slug = `${base}-${n}`.slice(0, 80);
  return slug;
}

/* ——— Categories ————————————————————————————————————————————————— */

export async function saveCategoryAction(rawInput: unknown, id: string | null): Promise<ActionResult<CmsCategory>> {
  try {
    await requireAdmin();
    const parsed = categoryInputSchema.safeParse(rawInput);
    if (!parsed.success)
      return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
    const { repo } = await getAdminCms();
    if (await repo.slugTaken("category", parsed.data.slug, id))
      return { ok: false, error: "Please check the highlighted fields.", fieldErrors: { slug: "Another category already uses this web address." } };
    const category = id ? await repo.updateCategory(id, parsed.data) : await repo.createCategory(parsed.data);
    publish();
    return { ok: true, data: category };
  } catch (e) {
    return failure(e);
  }
}

export async function deleteCategoryAction(id: string, reassignTo: string | null): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { repo } = await getAdminCms();
    await repo.deleteCategory(String(id), reassignTo ? String(reassignTo) : null);
    publish();
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}

/* ——— Uploads ———————————————————————————————————————————————————— */

/**
 * Authorises one upload and returns where the browser should send it.
 * Files go straight from the browser to storage (no size limit on our
 * server), but only to a path we generated, of a type and size we accept.
 */
export async function createUploadTargetAction(rawRequest: unknown): Promise<ActionResult<UploadTarget>> {
  try {
    await requireAdmin();
    const parsed = uploadRequestSchema.safeParse(rawRequest);
    if (!parsed.success) return { ok: false, error: "This file cannot be uploaded." };
    const { kind, mime, size } = parsed.data;
    const problem = checkUpload(kind, mime, size);
    if (problem) return { ok: false, error: problem };
    const ext = extensionFor(mime);
    if (!ext) return { ok: false, error: "This file type is not supported." };

    const { media } = await getAdminCms();
    const target = await media.createUploadTarget(`${kind === "image" ? "images" : "videos"}/${randomUUID()}.${ext}`);
    return { ok: true, data: target };
  } catch (e) {
    return failure(e);
  }
}

/** Deletes uploads that were never saved into a project (e.g. removed before saving, or a cancelled form). */
export async function discardUploadsAction(paths: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    const candidates = (Array.isArray(paths) ? paths : []).map(String).filter((p) => OBJECT_PATH.test(p)).slice(0, 100);
    if (!candidates.length) return { ok: true };
    const { repo, media } = await getAdminCms();
    const inUse = new Set((await repo.listProjects({ includeDrafts: true })).flatMap(storagePathsOf));
    await media.remove(candidates.filter((p) => !inUse.has(p)));
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}
