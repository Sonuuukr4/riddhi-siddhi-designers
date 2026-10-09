"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/cms/env";

let client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Browser client — used only to send files to signed upload URLs issued by
 * the server. It carries the public anon key, never the service role key.
 */
export function createBrowserSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase is not configured.");
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
