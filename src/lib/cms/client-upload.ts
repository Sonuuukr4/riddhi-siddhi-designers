"use client";

import { createBrowserSupabase } from "@/lib/supabase/browser";
import { createUploadTargetAction } from "./actions";
import { checkUpload, IMAGE_MAX_EDGE, IMAGE_QUALITY, type UploadKind } from "./limits";

/**
 * Browser-side upload pipeline used by the admin forms:
 *
 *   1. images are resized (longest edge ≤ 2560 px) and re-encoded as WebP,
 *      so uploads are fast and storage stays small;
 *   2. the server authorises the upload and returns a one-time target;
 *   3. the file is sent straight to storage with progress reporting.
 */

export type UploadedFile = { url: string; path: string; width: number | null; height: number | null; bytes: number };

export class UploadError extends Error {}

async function optimizeImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new UploadError("This image could not be read. Please export it as JPEG or PNG and try again.");
  }
  const scale = Math.min(1, IMAGE_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new UploadError("Your browser could not process this image.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", IMAGE_QUALITY));
  // Very old browsers cannot encode WebP; fall back to the original file if it is still a supported type.
  if (!blob || blob.type !== "image/webp") return { blob: file, width, height };
  return { blob, width, height };
}

function sendWithProgress(url: string, body: Blob, contentType: string, onProgress?: (fraction: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", contentType);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new UploadError(xhr.responseText || "Upload failed."));
    xhr.onerror = () => reject(new UploadError("The connection was interrupted during upload."));
    xhr.send(body);
  });
}

export async function uploadMedia(
  file: File,
  kind: UploadKind,
  onProgress?: (fraction: number) => void,
): Promise<UploadedFile> {
  const problem = checkUpload(kind, file.type, file.size);
  if (problem) throw new UploadError(problem);

  let body: Blob = file;
  let width: number | null = null;
  let height: number | null = null;
  if (kind === "image") {
    const optimized = await optimizeImage(file);
    body = optimized.blob;
    width = optimized.width;
    height = optimized.height;
  }
  const mime = body.type || file.type;

  const target = await createUploadTargetAction({ kind, mime, size: body.size, filename: file.name });
  if (!target.ok) throw new UploadError(target.error);
  const t = target.data;

  if (t.mode === "local") {
    await sendWithProgress(t.uploadUrl, body, mime, onProgress);
  } else {
    // Supabase signed upload URLs do not expose progress through the SDK, so report start/finish.
    onProgress?.(0.05);
    const { error } = await createBrowserSupabase()
      .storage.from(t.bucket)
      .uploadToSignedUrl(t.path, t.token, body, { contentType: mime, upsert: false });
    if (error) throw new UploadError(error.message);
  }
  onProgress?.(1);
  return { url: t.publicUrl, path: t.path, width, height, bytes: body.size };
}
