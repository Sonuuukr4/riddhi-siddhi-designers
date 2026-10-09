import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Notice, buttonClass } from "@/components/admin/ui";
import { site } from "@/config/site";
import { getAuthState } from "@/lib/auth/session";
import { signOutAction } from "@/lib/cms/actions";
import { cmsMode } from "@/lib/cms/env";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const state = await getAuthState();
  if (state.status === "admin") redirect("/admin");
  const mode = cmsMode();

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-bone lg:flex">
        <div aria-hidden className="ink-grid absolute inset-0 opacity-60" />
        <p className="label relative text-bone/50">Studio admin</p>
        <div className="relative">
          <p className="text-[clamp(2.5rem,4.5vw,4.5rem)] font-medium uppercase leading-[0.86] condensed">
            Riddhi
            <br />
            Siddhi
          </p>
          <p className="mt-4 font-serif text-2xl italic text-bone/75">Designers</p>
        </div>
        <p className="label relative text-bone/40">{site.descriptor}</p>
      </aside>

      <div className="flex items-center justify-center px-5 py-16 md:px-10">
        <div className="w-full max-w-md">
          <p className="label mb-3 text-ink/50 lg:hidden">Riddhi Siddhi Designers · Studio admin</p>

          {state.status === "unconfigured" ? (
            <SetupGuide />
          ) : state.status === "forbidden" ? (
            <>
              <h1 className="text-[1.75rem] font-semibold leading-tight">No admin access</h1>
              <Notice tone="warning" className="mt-6">
                You are signed in as <strong>{state.email}</strong>, but this account is not listed as a studio
                administrator. Ask the site owner to grant access, or sign in with a different account.
              </Notice>
              <form action={signOutAction} className="mt-6">
                <button type="submit" className={buttonClass("primary")}>
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-[1.75rem] font-semibold leading-tight">Sign in</h1>
              <p className="mt-1.5 text-[0.9375rem] text-ink/60">Manage projects, photographs and categories.</p>
              {mode === "local" && (
                <Notice tone="warning" className="mt-6">
                  Local preview mode — use the password set in <code className="font-mono text-[0.8125rem]">.env.local</code>.
                </Notice>
              )}
              <LoginForm mode={mode === "local" ? "local" : "supabase"} />
            </>
          )}

          <p className="mt-10 text-[0.8125rem] text-ink/45">
            <Link href="/" className="underline-offset-4 hover:text-ink hover:underline">
              ← Back to the website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function SetupGuide() {
  const steps = [
    <>
      Create a free project at <strong>supabase.com</strong> (region: Mumbai).
    </>,
    <>
      In <strong>SQL Editor</strong>, run <code>supabase/migrations/…_cms_schema.sql</code>, then optionally{" "}
      <code>supabase/seed.sql</code>.
    </>,
    <>
      Create the studio&apos;s user under <strong>Authentication → Users</strong> and add it to the{" "}
      <code>admins</code> table.
    </>,
    <>
      Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to the hosting
      environment and redeploy.
    </>,
  ];
  return (
    <>
      <h1 className="text-[1.75rem] font-semibold leading-tight">Connect the content database</h1>
      <p className="mt-1.5 text-[0.9375rem] text-ink/60">
        The admin panel needs Supabase to store projects and media. Until it is connected, the website shows its
        built-in content.
      </p>
      <ol className="mt-8 space-y-4 text-sm leading-relaxed [&_code]:rounded-[2px] [&_code]:bg-ink/6 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.75rem]">
        {steps.map((step, i) => (
          <li key={i} className="grid grid-cols-[2rem_1fr] gap-2">
            <span className="label pt-0.5 text-ink/45">{String(i + 1).padStart(2, "0")}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <Notice className="mt-8">
        Full instructions are in <code className="font-mono text-[0.75rem]">supabase/README.md</code>. The service role
        key is never needed.
      </Notice>
    </>
  );
}
