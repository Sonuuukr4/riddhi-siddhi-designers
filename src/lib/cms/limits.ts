/**
 * Upload rules — shared by the admin UI (instant feedback) and the server
 * (authoritative checks). The storage bucket enforces the same limits again.
 */

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;

/** Largest image accepted before in-browser optimization. */
export const IMAGE_MAX_BYTES = 25 * 1024 * 1024;
/** Images are resized so their longest edge is at most this many pixels. */
export const IMAGE_MAX_EDGE = 2560;
export const IMAGE_QUALITY = 0.86;

/**
 * Largest video upload. 50 MB matches Supabase's default per-file limit on the
 * free plan; longer films are better hosted on YouTube or Vimeo and linked.
 */
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024;

export const MAX_GALLERY_ITEMS = 40;

export type UploadKind = "image" | "video";

export function extensionFor(mime: string): string | null {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    case "video/mp4":
      return "mp4";
    case "video/webm":
      return "webm";
    case "video/quicktime":
      return "mov";
    default:
      return null;
  }
}

export function checkUpload(kind: UploadKind, mime: string, size: number): string | null {
  const types: readonly string[] = kind === "image" ? IMAGE_TYPES : VIDEO_TYPES;
  if (!types.includes(mime)) {
    return kind === "image"
      ? "Please choose a JPEG, PNG, WebP or AVIF image."
      : "Please choose an MP4, WebM or MOV video.";
  }
  const max = kind === "image" ? IMAGE_MAX_BYTES : VIDEO_MAX_BYTES;
  if (size <= 0) return "The file is empty.";
  if (size > max) return `The file is larger than ${Math.round(max / 1024 / 1024)} MB.`;
  return null;
}

export const formatBytes = (n: number) =>
  n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
