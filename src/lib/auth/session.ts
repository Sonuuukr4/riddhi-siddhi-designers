import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { cmsMode } from "@/lib/cms/env";
import { CmsError } from "@/lib/cms/repository";
import { createServerSupabase } from "@/lib/supabase/server";
import { LOCAL_ADMIN_EMAIL, LOCAL_SESSION_COOKIE, verifyLocalSessionToken } from "./local-auth";

export type AdminSession = { mode: "supabase" | "local"; userId: string; email: string };

export type AuthState =
  | { status: "admin"; session: AdminSession }
  /** Signed in with Supabase, but the account is not listed in public.admins. */
  | { status: "forbidden"; email: string }
  | { status: "anonymous" }
  /** No CMS backend configured — the admin shows setup instructions. */
  | { status: "unconfigured" };

/**
 * The single source of truth for "is this request an admin?". Always
 * verified on the server: the Supabase JWT is checked with the auth server
 * (getUser), then membership of public.admins is confirmed.
 */
export const getAuthState = cache(async (): Promise<AuthState> => {
  const mode = cmsMode();
  if (mode === "static") return { status: "unconfigured" };

  if (mode === "local") {
    const token = (await cookies()).get(LOCAL_SESSION_COOKIE)?.value;
    return verifyLocalSessionToken(token)
      ? { status: "admin", session: { mode, userId: "local-admin", email: LOCAL_ADMIN_EMAIL } }
      : { status: "anonymous" };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "anonymous" };

  const { data: adminRow } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adminRow) return { status: "forbidden", email: user.email ?? "this account" };
  return { status: "admin", session: { mode, userId: user.id, email: user.email ?? "" } };
});

/** For admin pages: redirect anyone who is not an admin to the sign-in screen. */
export async function requireAdminPage(): Promise<AdminSession> {
  const state = await getAuthState();
  if (state.status === "admin") return state.session;
  redirect("/admin/login");
}

/** For server actions and route handlers: throw instead of redirecting. */
export async function requireAdmin(): Promise<AdminSession> {
  const state = await getAuthState();
  if (state.status !== "admin") throw new CmsError("unauthorized", "Please sign in again to continue.");
  return state.session;
}
