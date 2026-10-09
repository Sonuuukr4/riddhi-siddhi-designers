import "server-only";
import { cmsMode } from "./env";
import { createLocalMediaStore, createLocalRepository } from "./local-repo";
import { CmsError, type CmsRepository, type MediaStore } from "./repository";
import { createSupabaseMediaStore, createSupabaseRepository } from "./supabase-repo";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Repository + media store for admin requests. In Supabase mode every query
 * runs with the signed-in user's session, so row-level security is enforced
 * by the database as well as by requireAdmin().
 */
export async function getAdminCms(): Promise<{ repo: CmsRepository; media: MediaStore }> {
  const mode = cmsMode();
  if (mode === "supabase") {
    const db = await createServerSupabase();
    return { repo: createSupabaseRepository(db), media: createSupabaseMediaStore(db) };
  }
  if (mode === "local") return { repo: createLocalRepository(), media: createLocalMediaStore() };
  throw new CmsError("unavailable", "The content database is not connected yet.");
}
