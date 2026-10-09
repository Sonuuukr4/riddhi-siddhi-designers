/**
 * CMS environment.
 *
 * The CMS runs in one of three modes:
 *
 *  - "supabase" — production. Supabase Auth, Postgres (with row-level security)
 *    and Storage. Active when NEXT_PUBLIC_SUPABASE_URL and
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY are set.
 *  - "local"    — development / offline preview only. Content is stored in
 *    .data/ on this machine and the admin signs in with LOCAL_ADMIN_PASSWORD.
 *    Enabled with CMS_LOCAL_MODE=true; refused on Vercel because its
 *    filesystem is not persistent.
 *  - "static"   — no CMS connected. The public site renders the built-in
 *    content from src/content and the admin panel shows setup instructions.
 */

export type CmsMode = "supabase" | "local" | "static";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Storage bucket holding every uploaded image and video. Created by the migration. */
export const MEDIA_BUCKET = "project-media";

export function cmsMode(): CmsMode {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) return "supabase";
  if (process.env.CMS_LOCAL_MODE === "true" && !process.env.VERCEL) return "local";
  return "static";
}

/** Public URL prefix of uploaded media, used to validate URLs submitted by the admin form. */
export function mediaUrlPrefix(mode: CmsMode = cmsMode()): string | null {
  if (mode === "supabase") return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/`;
  if (mode === "local") return "/api/media/";
  return null;
}

/** Cache tag shared by every public CMS read; admin mutations expire it. */
export const CMS_TAG = "cms";
