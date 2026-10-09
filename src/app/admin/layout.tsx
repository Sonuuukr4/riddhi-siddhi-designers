import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * The admin panel has its own chrome — none of the public site's header,
 * motion or smooth scrolling — and is never indexed. Access is enforced in
 * src/app/admin/(panel)/layout.tsx, every server action, and the database.
 */
// Admin pages depend on the signed-in session — never prerender or cache them.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Admin" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-bone text-ink">{children}</div>;
}
