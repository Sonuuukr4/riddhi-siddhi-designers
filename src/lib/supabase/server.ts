import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/cms/env";

/**
 * Supabase client bound to the signed-in user's session (cookies).
 * Every query runs as that user, so row-level security decides what is
 * allowed — the anon key never grants admin rights on its own.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component — cookies are refreshed by src/proxy.ts instead.
        }
      },
    },
  });
}

/**
 * Cookie-less anonymous client for public, cacheable reads. Row-level security
 * limits it to published content.
 */
export function createPublicSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
