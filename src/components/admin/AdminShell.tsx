"use client";

import { ExternalLink, FolderOpen, LayoutDashboard, LogOut, Settings, Tags } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { signOutAction } from "@/lib/cms/actions";
import { cn } from "@/lib/utils";
import { ToastProvider } from "./feedback";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/projects", label: "Projects", icon: FolderOpen },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  email,
  mode,
  children,
}: {
  email: string;
  mode: "supabase" | "local";
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <ToastProvider>
      <a
        href="#admin-main"
        className="sr-only z-[70] bg-ink px-4 py-2 text-bone focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
      >
        Skip to content
      </a>

      <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
        {/* Sidebar (desktop) / top bar (mobile) */}
        <aside className="z-40 border-b border-ink/10 bg-ink text-bone lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 px-5 py-4 lg:block lg:px-6 lg:py-7">
              <Link href="/admin" className="block leading-tight">
                <span className="block text-[0.9375rem] font-semibold tracking-[-0.01em]">Riddhi Siddhi</span>
                <span className="label text-bone/50">Studio admin</span>
              </Link>
              <div className="flex items-center gap-1 lg:hidden">
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex size-11 items-center justify-center rounded-[3px] text-bone/70 hover:bg-bone/10 hover:text-bone"
                  aria-label="View website (opens in a new tab)"
                >
                  <ExternalLink className="size-[18px]" aria-hidden />
                </a>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="flex size-11 items-center justify-center rounded-[3px] text-bone/70 hover:bg-bone/10 hover:text-bone"
                    aria-label="Sign out"
                  >
                    <LogOut className="size-[18px]" aria-hidden />
                  </button>
                </form>
              </div>
            </div>

            <nav aria-label="Admin" className="no-scrollbar overflow-x-auto px-3 pb-2 lg:flex-1 lg:overflow-visible lg:pb-0">
              <ul className="flex gap-1 lg:flex-col">
                {NAV.map((item) => {
                  const active = isActive(item);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-11 items-center gap-3 whitespace-nowrap rounded-[3px] px-3 text-sm transition-colors",
                          active ? "bg-bone/12 text-bone" : "text-bone/60 hover:bg-bone/6 hover:text-bone",
                        )}
                      >
                        <Icon className="size-[18px] shrink-0" aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="hidden border-t border-bone/10 px-3 py-4 lg:block">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center gap-3 rounded-[3px] px-3 text-sm text-bone/60 hover:bg-bone/6 hover:text-bone"
              >
                <ExternalLink className="size-[18px]" aria-hidden />
                View website
              </a>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex min-h-11 w-full items-center gap-3 rounded-[3px] px-3 text-sm text-bone/60 hover:bg-bone/6 hover:text-bone"
                >
                  <LogOut className="size-[18px]" aria-hidden />
                  Sign out
                </button>
              </form>
              <p className="label mt-3 truncate px-3 text-bone/35" title={email}>
                {mode === "local" ? "Local preview" : email}
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          {mode === "local" && (
            <p className="border-b border-[#d9b98a] bg-[#faf1e2] px-5 py-2 text-[0.8125rem] text-[#6b4b1c] md:px-10">
              <strong className="font-semibold">Local preview mode.</strong> Content and uploads are saved on this computer
              only. Connect Supabase before going live.
            </p>
          )}
          <main id="admin-main" className="mx-auto w-full max-w-6xl px-5 pb-28 pt-8 md:px-10 md:pt-12">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
