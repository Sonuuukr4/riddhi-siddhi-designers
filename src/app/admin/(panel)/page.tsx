import { ArrowRight, FolderOpen, Plus, Tags } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, CardHeader, PageHeader, Thumb, buttonClass, formatDate } from "@/components/admin/ui";
import { getDashboardStats } from "@/lib/cms/admin-queries";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const cards = [
    { label: "Projects", value: stats.totalProjects, href: "/admin/projects" },
    { label: "Published", value: stats.published, href: "/admin/projects?status=published" },
    { label: "Drafts", value: stats.drafts, href: "/admin/projects?status=draft" },
    { label: "Categories", value: stats.categories, href: "/admin/categories" },
    { label: "Media files", value: stats.mediaFiles },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Everything published here appears on the website straight away."
        actions={
          <Link href="/admin/projects/new" className={buttonClass("primary")}>
            <Plus className="size-4" aria-hidden />
            Add project
          </Link>
        }
      />

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {cards.map((c) => {
          const body = (
            <>
              <dt className="label text-ink/50">{c.label}</dt>
              <dd className="mt-3 text-[2.25rem] font-semibold leading-none tracking-[-0.02em] tabular-nums">{c.value}</dd>
            </>
          );
          return c.href ? (
            <Link
              key={c.label}
              href={c.href}
              className="rounded-[4px] border border-ink/10 bg-white p-5 transition-colors hover:border-ink/40"
            >
              {body}
            </Link>
          ) : (
            <div key={c.label} className="rounded-[4px] border border-ink/10 bg-white p-5">
              {body}
            </div>
          );
        })}
      </dl>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader
            title="Recently added"
            action={
              <Link href="/admin/projects" className="text-sm text-ink/60 underline-offset-4 hover:text-ink hover:underline">
                All projects
              </Link>
            }
          />
          {stats.recent.length ? (
            <ul className="divide-y divide-ink/8">
              {stats.recent.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/projects/${p.id}`}
                    className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-bone"
                  >
                    <Thumb src={p.coverUrl} className="h-12 w-16 shrink-0 rounded-[2px]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{p.title}</p>
                      <p className="text-[0.8125rem] text-ink/55">
                        {p.category?.name ?? "Uncategorised"} · Added {formatDate(p.createdAt)}
                      </p>
                    </div>
                    <Badge tone={p.visibility === "published" ? "published" : "draft"}>{p.visibility}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-ink/55">No projects yet — add the first one.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Quick actions" />
          <ul className="p-2">
            {[
              { href: "/admin/projects/new", label: "Add a new project", icon: Plus },
              { href: "/admin/projects", label: "Edit existing projects", icon: FolderOpen },
              { href: "/admin/categories", label: "Manage categories", icon: Tags },
            ].map((a) => (
              <li key={a.href}>
                <Link
                  href={a.href}
                  className="group flex min-h-12 items-center gap-3 rounded-[3px] px-3 text-sm hover:bg-bone"
                >
                  <a.icon className="size-[18px] text-ink/50" aria-hidden />
                  <span className="flex-1">{a.label}</span>
                  <ArrowRight className="size-4 text-ink/30 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
            <li>
              <a
                href="/portfolio"
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-12 items-center gap-3 rounded-[3px] px-3 text-sm hover:bg-bone"
              >
                <ArrowRight className="size-[18px] -rotate-45 text-ink/50" aria-hidden />
                <span className="flex-1">Open the public portfolio</span>
              </a>
            </li>
          </ul>
          <div className="border-t border-ink/10 px-5 py-4 text-[0.8125rem] leading-relaxed text-ink/55">
            Tip: projects marked <strong className="font-medium text-ink/75">Featured</strong> appear first on the home
            page. Drafts are never shown publicly.
          </div>
        </Card>
      </div>
    </>
  );
}
