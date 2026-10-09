"use client";

import { Copy, ExternalLink, Film, Images, Pencil, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteProjectAction, duplicateProjectAction } from "@/lib/cms/actions";
import type { Visibility } from "@/lib/cms/types";
import { cn } from "@/lib/utils";
import { ConfirmDialog, useToast } from "./feedback";
import { Badge, Thumb, formatDate, inputClass } from "./ui";

export type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string | null;
  visibility: Visibility;
  featured: boolean;
  isPlaceholder: boolean;
  coverUrl: string | null;
  location: string | null;
  year: string | null;
  imageCount: number;
  hasVideo: boolean;
  updatedAt: string;
};

type StatusFilter = "all" | Visibility;

export function ProjectsTable({
  rows,
  categories,
  initialStatus,
}: {
  rows: ProjectRow[];
  categories: { id: string; name: string }[];
  initialStatus: StatusFilter;
}) {
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [pendingDelete, setPendingDelete] = useState<ProjectRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (status === "all" || r.visibility === status) &&
        (category === "all" || r.categoryId === category) &&
        (!q || [r.title, r.location, r.categoryName, r.year].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [rows, query, category, status]);

  const duplicate = (row: ProjectRow) => {
    setBusyId(row.id);
    startTransition(async () => {
      const res = await duplicateProjectAction(row.id);
      setBusyId(null);
      if (!res.ok) return toast(res.error, "error");
      toast(`Copied “${row.title}” as a draft.`);
      router.push(`/admin/projects/${res.data.id}`);
    });
  };

  const confirmDelete = () => {
    const row = pendingDelete;
    if (!row) return;
    startTransition(async () => {
      const res = await deleteProjectAction(row.id);
      setPendingDelete(null);
      if (!res.ok) return toast(res.error, "error");
      toast(`Deleted “${row.title}”.`);
      router.refresh();
    });
  };

  const counts = {
    all: rows.length,
    published: rows.filter((r) => r.visibility === "published").length,
    draft: rows.filter((r) => r.visibility === "draft").length,
  };

  return (
    <>
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, place or year"
            aria-label="Search projects"
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className={cn(inputClass, "md:w-52")}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div role="group" aria-label="Filter by status" className="flex rounded-[3px] border border-ink/20 bg-white p-0.5">
          {(["all", "published", "draft"] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
              className={cn(
                "min-h-10 flex-1 rounded-[2px] px-3 text-[0.8125rem] capitalize transition-colors md:flex-none",
                status === s ? "bg-ink text-bone" : "text-ink/60 hover:text-ink",
              )}
            >
              {s === "all" ? "All" : s === "draft" ? "Drafts" : "Published"}
              <span className="ml-1.5 tabular-nums opacity-60">{counts[s]}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {filtered.length} of {rows.length} projects shown
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-[4px] border border-dashed border-ink/20 bg-white px-6 py-16 text-center">
          <p className="font-medium">{rows.length ? "No projects match these filters." : "No projects yet."}</p>
          <p className="mt-1 text-sm text-ink/55">
            {rows.length ? (
              <button
                type="button"
                className="underline underline-offset-4"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setStatus("all");
                }}
              >
                Clear filters
              </button>
            ) : (
              <Link href="/admin/projects/new" className="underline underline-offset-4">
                Add the first project
              </Link>
            )}
          </p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-[4px] border border-ink/10 bg-white">
          {filtered.map((r) => (
            <li
              key={r.id}
              className={cn(
                "flex flex-col gap-3 border-b border-ink/8 p-4 last:border-b-0 sm:flex-row sm:items-center sm:gap-4 sm:px-5",
                busyId === r.id && "opacity-60",
              )}
            >
              <Link href={`/admin/projects/${r.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                <Thumb src={r.coverUrl} className="h-16 w-24 shrink-0 rounded-[2px] sm:h-14 sm:w-20" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.title}</p>
                  <p className="truncate text-[0.8125rem] text-ink/55">
                    {[r.categoryName ?? "Uncategorised", r.location, r.year].filter(Boolean).join(" · ")}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <Badge tone={r.visibility === "published" ? "published" : "draft"}>{r.visibility}</Badge>
                    {r.featured && <Badge tone="featured">Featured</Badge>}
                    {r.isPlaceholder && <Badge tone="demo">Demo</Badge>}
                    <span className="ml-1 inline-flex items-center gap-1 text-[0.75rem] text-ink/45">
                      <Images className="size-3.5" aria-hidden />
                      {r.imageCount}
                      <span className="sr-only">images</span>
                    </span>
                    {r.hasVideo && (
                      <span className="inline-flex items-center gap-1 text-[0.75rem] text-ink/45">
                        <Film className="size-3.5" aria-hidden />
                        <span className="sr-only">Has video</span>
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              <p className="hidden w-28 shrink-0 text-[0.8125rem] text-ink/50 lg:block">
                <span className="sr-only">Updated </span>
                {formatDate(r.updatedAt)}
              </p>

              <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                <RowAction href={`/admin/projects/${r.id}`} label={`Edit ${r.title}`} icon={Pencil} />
                {r.visibility === "published" && (
                  <RowAction href={`/projects/${r.slug}`} external label={`View ${r.title} on the website`} icon={ExternalLink} />
                )}
                <RowAction
                  onClick={() => duplicate(r)}
                  disabled={isPending}
                  label={`Duplicate ${r.title}`}
                  icon={Copy}
                />
                <RowAction
                  onClick={() => setPendingDelete(r)}
                  disabled={isPending}
                  label={`Delete ${r.title}`}
                  icon={Trash2}
                  danger
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this project?"
        confirmLabel="Delete project"
        busy={isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      >
        <strong className="text-ink">{pendingDelete?.title}</strong> and all of its uploaded photos and video will be
        removed permanently. This cannot be undone.
      </ConfirmDialog>
    </>
  );
}

function RowAction({
  label,
  icon: Icon,
  href,
  external,
  onClick,
  disabled,
  danger,
}: {
  label: string;
  icon: typeof Pencil;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  const className = cn(
    "flex size-10 items-center justify-center rounded-[3px] text-ink/55 transition-colors hover:bg-ink/5 disabled:opacity-40",
    danger ? "hover:text-terra" : "hover:text-ink",
  );
  const icon = <Icon className="size-[18px]" aria-hidden />;
  if (href)
    return external ? (
      <a href={href} target="_blank" rel="noreferrer" className={className} aria-label={label} title={label}>
        {icon}
      </a>
    ) : (
      <Link href={href} className={className} aria-label={label} title={label}>
        {icon}
      </Link>
    );
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className} aria-label={label} title={label}>
      {icon}
    </button>
  );
}
