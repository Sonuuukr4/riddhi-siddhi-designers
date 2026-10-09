import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs before every /admin request:
 *  - refreshes the Supabase session cookie so signed-in admins stay signed in;
 *  - sends visitors without a session to the sign-in page.
 *
 * This is an optimistic gate only. Real authorisation happens on the server
 * in every admin page and server action (src/lib/auth/session.ts) and in the
 * database itself (row-level security).
 */
export async function proxy(request: NextRequest) {
  const isLogin = request.nextUrl.pathname === "/admin/login";
  const toLogin = () => NextResponse.redirect(new URL("/admin/login", request.url));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    let response = NextResponse.next({ request });
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        },
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user && !isLogin) return toLogin();
    return response;
  }

  if (process.env.CMS_LOCAL_MODE === "true" && !request.cookies.has("rsd_local_admin") && !isLogin) {
    return toLogin();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
