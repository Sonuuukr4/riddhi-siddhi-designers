"use client";

import { ArrowDown, ArrowUp, CheckCircle2, ExternalLink, GripVertical, ImagePlus, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition, type ComponentProps } from "react";
import { deleteProjectAction, discardUploadsAction, saveProjectAction, suggestSlugAction } from "@/lib/cms/actions";
import { UploadError, uploadMedia, type UploadedFile } from "@/lib/cms/client-upload";
import { IMAGE_TYPES, MAX_GALLERY_ITEMS, VIDEO_MAX_BYTES, VIDEO_TYPES, formatBytes } from "@/lib/cms/limits";
import type { CmsProject, MediaKind, Visibility } from "@/lib/cms/types";
import { fieldErrors as toFieldErrors, parseVideoUrl, projectInputSchema, slugify } from "@/lib/cms/validation";
import { cn } from "@/lib/utils";
import { ConfirmDialog, useToast } from "./feedback";
import { DropZone, ImageSlot, UploadingTile, VideoFileSlot, type UploadState } from "./MediaFields";
import { Button, Card, CardHeader, Field, Notice, Thumb, buttonClass, inputClass } from "./ui";

/* ——— Form model ————————————————————————————————————————————————— */

type GalleryItem = {
  key: string;
  /** Upload batch and position within it — keeps a multi-file selection in the order it was chosen. */
  batch?: { id: string; seq: number };
  kind: MediaKind;
  url: string;
  storagePath: string | null;
  alt: string;
  caption: string;
  width: number | null;
  height: number | null;
};

type VideoMode = "none" | "file" | "link";

type Draft = {
  title: string;
  slug: string;
  categoryId: string;
  location: string;
  year: string;
  clientName: string;
  projectStatus: string;
  summary: string;
  description: string;
  designApproach: string;
  coverUrl: string | null;
  coverPath: string | null;
  coverAlt: string;
  videoMode: VideoMode;
  videoFileUrl: string | null;
  videoFilePath: string | null;
  videoLink: string;
  posterUrl: string | null;
  posterPath: string | null;
  visibility: Visibility;
  featured: boolean;
  isPlaceholder: boolean;
  sortOrder: string;
  media: GalleryItem[];
};

type Slot = "cover" | "poster" | "video" | "gallery";

const IMAGE_ACCEPT = IMAGE_TYPES.join(",");
const VIDEO_ACCEPT = VIDEO_TYPES.join(",");

const KIND_LABELS: Record<MediaKind, string> = {
  image: "Photograph",
  drawing: "Drawing",
  visualization: "Visualization",
};

const STATUS_SUGGESTIONS = ["Completed", "In progress", "Under construction", "Design stage", "Concept"];

function fromProject(p: CmsProject | null, defaultCategory: string): Draft {
  const isFile = Boolean(p?.videoPath);
  return {
    title: p?.title ?? "",
    slug: p?.slug ?? "",
    categoryId: p?.categoryId ?? defaultCategory,
    location: p?.location ?? "",
    year: p?.year ?? "",
    clientName: p?.clientName ?? "",
    projectStatus: p?.projectStatus ?? "",
    summary: p?.summary ?? "",
    description: p?.description ?? "",
    designApproach: p?.designApproach ?? "",
    coverUrl: p?.coverUrl ?? null,
    coverPath: p?.coverPath ?? null,
    coverAlt: p?.coverAlt ?? "",
    videoMode: p?.videoUrl ? (isFile ? "file" : "link") : "none",
    videoFileUrl: isFile ? (p?.videoUrl ?? null) : null,
    videoFilePath: isFile ? (p?.videoPath ?? null) : null,
    videoLink: !isFile ? (p?.videoUrl ?? "") : "",
    posterUrl: p?.videoPosterUrl ?? null,
    posterPath: p?.videoPosterPath ?? null,
    visibility: p?.visibility ?? "draft",
    featured: p?.featured ?? false,
    isPlaceholder: p?.isPlaceholder ?? false,
    sortOrder: String(p?.sortOrder ?? 0),
    media: (p?.media ?? []).map((m) => ({
      key: m.id,
      kind: m.kind,
      url: m.url,
      storagePath: m.storagePath,
      alt: m.alt ?? "",
      caption: m.caption ?? "",
      width: m.width,
      height: m.height,
    })),
  };
}

/** The payload sent to saveProjectAction (validated again on the server). */
function toInput(d: Draft) {
  const video =
    d.videoMode === "file"
      ? { url: d.videoFileUrl, path: d.videoFilePath }
      : d.videoMode === "link"
        ? { url: d.videoLink.trim() || null, path: null }
        : { url: null, path: null };
  const hasVideo = Boolean(video.url);
  return {
    title: d.title,
    slug: d.slug,
    categoryId: d.categoryId,
    location: d.location,
    year: d.year,
    clientName: d.clientName,
    projectStatus: d.projectStatus,
    summary: d.summary,
    description: d.description,
    designApproach: d.designApproach,
    coverUrl: d.coverUrl,
    coverPath: d.coverPath,
    coverAlt: d.coverAlt,
    videoUrl: video.url,
    videoPath: video.path,
    videoPosterUrl: hasVideo ? d.posterUrl : null,
    videoPosterPath: hasVideo ? d.posterPath : null,
    visibility: d.visibility,
    featured: d.featured,
    isPlaceholder: d.isPlaceholder,
    sortOrder: Number.parseInt(d.sortOrder, 10) || 0,
    media: d.media.map(({ kind, url, storagePath, alt, caption, width, height }) => ({
      kind,
      url,
      storagePath,
      alt,
      caption,
      width,
      height,
    })),
  };
}

/** Field → element to focus when it has an error, in reading order. */
const ERROR_TARGETS: [string, string][] = [
  ["title", "f-title"],
  ["categoryId", "f-category"],
  ["location", "f-location"],
  ["year", "f-year"],
  ["clientName", "f-client"],
  ["projectStatus", "f-status"],
  ["summary", "f-summary"],
  ["description", "f-description"],
  ["designApproach", "f-approach"],
  ["coverUrl", "f-cover"],
  ["coverAlt", "f-cover-alt"],
  ["media", "f-gallery"],
  ["videoUrl", "f-video"],
  ["videoPosterUrl", "f-poster"],
  ["slug", "f-slug"],
  ["sortOrder", "f-order"],
];

function focusFirstError(errors: Record<string, string>) {
  const keys = Object.keys(errors);
  const hit = ERROR_TARGETS.find(([field]) => keys.some((k) => k === field || k.startsWith(`${field}.`)));
  const el = hit && document.getElementById(hit[1]);
  if (!el) return;
  el.scrollIntoView({ block: "center", behavior: "smooth" });
  el.focus({ preventScroll: true });
}

/* ——— Component ——————————————————————————————————————————————————— */

export function ProjectForm({
  project,
  categories,
  mediaPrefix,
}: {
  project: CmsProject | null;
  categories: { id: string; name: string }[];
  mediaPrefix: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const projectId = project?.id ?? null;

  const [draft, setDraft] = useState<Draft>(() => fromProject(project, categories[0]?.id ?? ""));
  const [baseline, setBaseline] = useState(() => JSON.stringify(toInput(fromProject(project, categories[0]?.id ?? ""))));
  const [saved, setSaved] = useState(project ? { slug: project.slug, visibility: project.visibility } : null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploads, setUploads] = useState<Record<string, UploadState & { slot: Slot }>>({});
  const [slugAuto, setSlugAuto] = useState(!project);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  /** Files uploaded since the last save — deleted again if they end up unused. */
  const sessionUploads = useRef(new Set<string>());

  const input = useMemo(() => toInput(draft), [draft]);
  const dirty = JSON.stringify(input) !== baseline;
  const uploadList = Object.values(uploads);
  const uploading = uploadList.filter((u) => !u.error).length;

  const slotUpload = (slot: Exclude<Slot, "gallery">) => uploadList.find((u) => u.slot === slot) ?? null;
  const err = (key: string) => errors[key] ?? null;

  /* ——— State helpers ——— */

  const clearError = (...keys: string[]) =>
    setErrors((e) => {
      if (!keys.some((k) => k in e)) return e;
      const next = { ...e };
      for (const k of keys) delete next[k];
      return next;
    });

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    clearError(key);
  };

  const updateItem = (key: string, patch: Partial<GalleryItem>) =>
    setDraft((d) => ({ ...d, media: d.media.map((m) => (m.key === key ? { ...m, ...patch } : m)) }));

  const moveItem = (key: string, to: number) =>
    setDraft((d) => {
      const from = d.media.findIndex((m) => m.key === key);
      if (from < 0 || to < 0 || to >= d.media.length || from === to) return d;
      const media = [...d.media];
      const [item] = media.splice(from, 1);
      media.splice(to, 0, item);
      return { ...d, media };
    });

  const discardSession = useCallback(() => {
    const paths = [...sessionUploads.current];
    sessionUploads.current.clear();
    if (paths.length) void discardUploadsAction(paths);
  }, []);

  // Leaving the form by any route tidies up uploads that were never saved
  // (the server keeps any file a saved project still uses).
  useEffect(() => () => discardSession(), [discardSession]);

  /* ——— Uploads ——— */

  const runUpload = async (file: File, slot: Slot): Promise<UploadedFile | null> => {
    const id = crypto.randomUUID();
    setUploads((u) => {
      // A new attempt replaces any earlier failure shown in the same single-file slot.
      const next = slot === "gallery" ? { ...u } : Object.fromEntries(Object.entries(u).filter(([, x]) => x.slot !== slot));
      next[id] = { id, slot, name: file.name, progress: 0, error: null };
      return next;
    });
    try {
      const uploaded = await uploadMedia(file, slot === "video" ? "video" : "image", (progress) =>
        setUploads((u) => (u[id] ? { ...u, [id]: { ...u[id], progress } } : u)),
      );
      sessionUploads.current.add(uploaded.path);
      setUploads((u) => {
        const next = { ...u };
        delete next[id];
        return next;
      });
      return uploaded;
    } catch (e) {
      const message = e instanceof UploadError ? e.message : "The upload failed. Please try again.";
      setUploads((u) => ({ ...u, [id]: { ...u[id], progress: 0, error: message } }));
      toast(`${file.name}: ${message}`, "error");
      return null;
    }
  };

  const uploadCover = async (file: File) => {
    const f = await runUpload(file, "cover");
    if (!f) return;
    setDraft((d) => ({ ...d, coverUrl: f.url, coverPath: f.path }));
    clearError("coverUrl");
  };

  const uploadPoster = async (file: File) => {
    const f = await runUpload(file, "poster");
    if (f) setDraft((d) => ({ ...d, posterUrl: f.url, posterPath: f.path }));
  };

  const uploadVideo = async (file: File) => {
    const f = await runUpload(file, "video");
    if (!f) return;
    setDraft((d) => ({ ...d, videoFileUrl: f.url, videoFilePath: f.path }));
    clearError("videoUrl");
  };

  const uploadGallery = async (files: File[]) => {
    const inFlight = uploadList.filter((u) => u.slot === "gallery" && !u.error).length;
    const room = Math.max(0, MAX_GALLERY_ITEMS - draft.media.length - inFlight);
    const accepted = files.slice(0, room);
    if (files.length > accepted.length)
      toast(`A project holds up to ${MAX_GALLERY_ITEMS} gallery images — ${files.length - accepted.length} not added.`, "error");

    // Two at a time: quick on a good connection, gentle on a weak one. Finished
    // files are slotted into selection order, whichever completes first.
    const batch = crypto.randomUUID();
    const queue = accepted.map((file, seq) => ({ file, seq }));
    const worker = async () => {
      for (let next = queue.shift(); next; next = queue.shift()) {
        const f = await runUpload(next.file, "gallery");
        if (!f) continue;
        const item: GalleryItem = {
          key: crypto.randomUUID(),
          batch: { id: batch, seq: next.seq },
          kind: "image",
          url: f.url,
          storagePath: f.path,
          alt: "",
          caption: "",
          width: f.width,
          height: f.height,
        };
        setDraft((d) => {
          const before = d.media.findIndex((m) => m.batch?.id === batch && m.batch.seq > item.batch!.seq);
          const media = [...d.media];
          media.splice(before < 0 ? media.length : before, 0, item);
          return { ...d, media };
        });
      }
    };
    await Promise.all([worker(), worker()]);
  };

  const dismissUpload = (id: string) =>
    setUploads((u) => {
      const next = { ...u };
      delete next[id];
      return next;
    });

  /* ——— Unsaved-changes guard ——— */

  const guard = useRef({ active: false });
  useEffect(() => {
    guard.current.active = dirty || uploading > 0;
  }, [dirty, uploading]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!guard.current.active) return;
      e.preventDefault();
      e.returnValue = "";
    };
    // In-app links: ask before leaving, and tidy up unsaved uploads if the answer is yes.
    const onClick = (e: MouseEvent) => {
      if (!guard.current.active || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (window.confirm("You have unsaved changes. Leave this page without saving?")) {
        guard.current.active = false;
        discardSession();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [discardSession]);

  /* ——— Slug ——— */

  const onTitleChange = (title: string) => {
    setDraft((d) => ({ ...d, title, slug: slugAuto ? slugify(title) : d.slug }));
    clearError("title", ...(slugAuto ? ["slug"] : []));
  };

  const onTitleBlur = async () => {
    if (!slugAuto || !draft.title.trim()) return;
    try {
      const unique = await suggestSlugAction(draft.title, projectId);
      setDraft((d) => (slugify(d.title) === slugify(draft.title) ? { ...d, slug: unique } : d));
    } catch {
      /* The server re-checks on save. */
    }
  };

  /* ——— Save / delete / leave ——— */

  const save = () => {
    if (uploading) return toast("Please wait for the uploads to finish.", "error");
    const parsed = projectInputSchema.safeParse(input);
    if (!parsed.success) {
      const fe = toFieldErrors(parsed.error);
      setErrors(fe);
      toast("Please check the highlighted fields.", "error");
      focusFirstError(fe);
      return;
    }
    const payload = input;
    startSaving(async () => {
      const res = await saveProjectAction(payload, projectId);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast(res.error, "error");
        if (res.fieldErrors) focusFirstError(res.fieldErrors);
        return;
      }
      // Anything uploaded but not used in the saved version is deleted again.
      const used = new Set(
        [payload.coverPath, payload.videoPath, payload.videoPosterPath, ...payload.media.map((m) => m.storagePath)].filter(Boolean),
      );
      const orphans = [...sessionUploads.current].filter((p) => !used.has(p));
      sessionUploads.current.clear();
      if (orphans.length) void discardUploadsAction(orphans);

      setErrors({});
      setBaseline(JSON.stringify(payload));
      setSaved({ slug: res.data.slug, visibility: payload.visibility });
      setSlugAuto(false);
      guard.current.active = false;
      toast(payload.visibility === "published" ? "Saved — the project is live on the website." : "Saved as a draft.");
      if (!projectId) router.replace(`/admin/projects/${res.data.id}`);
      else router.refresh();
    });
  };

  const remove = () => {
    if (!projectId) return;
    startDeleting(async () => {
      const res = await deleteProjectAction(projectId);
      if (!res.ok) {
        setConfirmDelete(false);
        toast(res.error, "error");
        return;
      }
      guard.current.active = false;
      discardSession();
      toast(`Deleted “${draft.title}”.`);
      router.replace("/admin/projects");
      router.refresh();
    });
  };

  const leave = () => {
    if (guard.current.active && !window.confirm("You have unsaved changes. Leave this page without saving?")) return;
    guard.current.active = false;
    discardSession();
    router.push("/admin/projects");
  };

  /* ——— Derived ——— */

  const video = draft.videoMode === "link" && draft.videoLink.trim() ? parseVideoUrl(draft.videoLink, mediaPrefix) : null;
  const galleryUploads = uploadList.filter((u) => u.slot === "gallery");
  const galleryErrors = Object.entries(errors).filter(([k]) => k === "media" || k.startsWith("media."));
  const isLive = saved?.visibility === "published";
  const saveLabel =
    draft.visibility === "published" ? (isLive && !dirty ? "Saved" : isLive ? "Save changes" : "Save & publish") : "Save draft";

  if (!categories.length) {
    return (
      <Notice tone="warning" title="Add a category first">
        Every project belongs to a category.{" "}
        <Link href="/admin/categories" className="underline underline-offset-4">
          Create a category
        </Link>{" "}
        and then come back to add the project.
      </Notice>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* ——— Main column ——— */}
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader title="Project details" description="Only the title and category are needed for a draft." />
            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <Field label="Title" htmlFor="f-title" required error={err("title")} className="sm:col-span-2">
                <input
                  id="f-title"
                  value={draft.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  onBlur={onTitleBlur}
                  maxLength={140}
                  autoComplete="off"
                  aria-invalid={Boolean(err("title"))}
                  className={inputClass}
                />
              </Field>
              <Field
                label="Category"
                htmlFor="f-category"
                required
                error={err("categoryId")}
                hint={
                  <Link href="/admin/categories" className="underline underline-offset-4">
                    Manage categories
                  </Link>
                }
              >
                <select
                  id="f-category"
                  value={draft.categoryId}
                  onChange={(e) => set("categoryId", e.target.value)}
                  aria-invalid={Boolean(err("categoryId"))}
                  className={inputClass}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Location" htmlFor="f-location" error={err("location")} hint="e.g. Rajouri Garden, New Delhi">
                <input
                  id="f-location"
                  value={draft.location}
                  onChange={(e) => set("location", e.target.value)}
                  maxLength={140}
                  className={inputClass}
                />
              </Field>
              <Field label="Year" htmlFor="f-year" error={err("year")} hint="e.g. 2025, or 2024–25">
                <input
                  id="f-year"
                  value={draft.year}
                  onChange={(e) => set("year", e.target.value)}
                  maxLength={20}
                  inputMode="numeric"
                  className={inputClass}
                />
              </Field>
              <Field label="Project status" htmlFor="f-status" error={err("projectStatus")} hint="e.g. Completed, In progress">
                <input
                  id="f-status"
                  list="project-status-options"
                  value={draft.projectStatus}
                  onChange={(e) => set("projectStatus", e.target.value)}
                  maxLength={60}
                  className={inputClass}
                />
                <datalist id="project-status-options">
                  {STATUS_SUGGESTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </Field>
              <Field
                label="Client"
                htmlFor="f-client"
                error={err("clientName")}
                hint="Leave empty unless the client has agreed to be named."
                className="sm:col-span-2"
              >
                <input
                  id="f-client"
                  value={draft.clientName}
                  onChange={(e) => set("clientName", e.target.value)}
                  maxLength={140}
                  className={inputClass}
                />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="Text" description="Shown on the project page. A description is needed to publish." />
            <div className="flex flex-col gap-5 p-5">
              <Field
                label="Summary"
                htmlFor="f-summary"
                error={err("summary")}
                hint={`One or two lines for cards and search results · ${draft.summary.length}/240`}
              >
                <textarea
                  id="f-summary"
                  rows={2}
                  value={draft.summary}
                  onChange={(e) => set("summary", e.target.value)}
                  maxLength={240}
                  className={cn(inputClass, "resize-y")}
                />
              </Field>
              <Field
                label="Description"
                htmlFor="f-description"
                error={err("description")}
                hint="Separate paragraphs with a blank line."
              >
                <textarea
                  id="f-description"
                  rows={7}
                  value={draft.description}
                  onChange={(e) => set("description", e.target.value)}
                  maxLength={8000}
                  aria-invalid={Boolean(err("description"))}
                  className={cn(inputClass, "resize-y")}
                />
              </Field>
              <Field
                label="Design approach"
                htmlFor="f-approach"
                error={err("designApproach")}
                hint={
                  <>
                    Optional. To show numbered points, start each paragraph with a short title and a dash — e.g.{" "}
                    <em>“Light — The rooms open to the north…”</em>
                  </>
                }
              >
                <textarea
                  id="f-approach"
                  rows={5}
                  value={draft.designApproach}
                  onChange={(e) => set("designApproach", e.target.value)}
                  maxLength={8000}
                  className={cn(inputClass, "resize-y")}
                />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Cover image"
              description="The main image on cards and at the top of the project page. Needed to publish."
            />
            <div className="grid gap-5 p-5 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <ImageSlot
                id="f-cover"
                url={draft.coverUrl}
                upload={slotUpload("cover")}
                accept={IMAGE_ACCEPT}
                invalid={Boolean(err("coverUrl"))}
                hint="JPEG, PNG or WebP · landscape works best"
                onFile={uploadCover}
                onRemove={() => setDraft((d) => ({ ...d, coverUrl: null, coverPath: null }))}
              />
              <div className="flex flex-col gap-4">
                {err("coverUrl") && (
                  <p role="alert" className="text-[0.8125rem] text-terra">
                    {err("coverUrl")}
                  </p>
                )}
                <Field
                  label="Image description"
                  htmlFor="f-cover-alt"
                  error={err("coverAlt")}
                  hint="Describes the image for visually impaired visitors and search engines."
                >
                  <textarea
                    id="f-cover-alt"
                    rows={3}
                    value={draft.coverAlt}
                    onChange={(e) => set("coverAlt", e.target.value)}
                    maxLength={300}
                    placeholder="e.g. Double-height living room with a timber ceiling"
                    className={cn(inputClass, "resize-y")}
                  />
                </Field>
                <p className="text-[0.8125rem] leading-relaxed text-ink/50">
                  Images are resized to 2560 px and converted to WebP in your browser before upload.
                </p>
              </div>
            </div>
          </Card>

          <Card id="f-gallery" tabIndex={-1} className="focus:outline-none">
            <CardHeader
              title="Gallery"
              description={`Photographs, drawings and visualizations · ${draft.media.length}/${MAX_GALLERY_ITEMS}`}
            />
            <div className="flex flex-col gap-5 p-5">
              <DropZone
                id="f-gallery-input"
                accept={IMAGE_ACCEPT}
                multiple
                disabled={draft.media.length >= MAX_GALLERY_ITEMS}
                invalid={galleryErrors.length > 0}
                onFiles={uploadGallery}
                className="py-7"
              >
                <ImagePlus className="size-6 text-ink/40" aria-hidden />
                <span className="font-medium">Drop images here, or choose files</span>
                <span className="text-[0.8125rem] text-ink/50">You can select several at once · drag cards to reorder</span>
              </DropZone>

              {galleryErrors.length > 0 && (
                <Notice tone="error">
                  {galleryErrors.map(([k, message]) => {
                    const n = Number(k.split(".")[1]);
                    return <p key={k}>{Number.isFinite(n) ? `Image ${n + 1}: ${message}` : message}</p>;
                  })}
                </Notice>
              )}

              {(draft.media.length > 0 || galleryUploads.length > 0) && (
                <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {draft.media.map((m, i) => (
                    <li
                      key={m.key}
                      draggable
                      onDragStart={(e) => {
                        setDragKey(m.key);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => setDragKey(null)}
                      onDragOver={(e) => {
                        if (!dragKey) return;
                        e.preventDefault();
                        if (dragKey !== m.key) moveItem(dragKey, i);
                      }}
                      onDrop={(e) => dragKey && e.preventDefault()}
                      className={cn(
                        "flex flex-col overflow-hidden rounded-[4px] border bg-white transition-shadow",
                        dragKey === m.key ? "border-ink opacity-60" : "border-ink/12",
                        errors[`media.${i}`] && "border-terra",
                      )}
                    >
                      <div className="relative">
                        <Thumb src={m.url} alt={m.alt} className="aspect-[4/3] w-full" />
                        <span className="label absolute left-2 top-2 flex items-center gap-1 rounded-[2px] bg-ink/75 px-1.5 py-0.5 text-bone">
                          <GripVertical className="size-3" aria-hidden />
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {draft.coverPath && m.storagePath === draft.coverPath && (
                          <span className="label absolute right-2 top-2 rounded-[2px] bg-bone px-1.5 py-0.5 text-ink">Cover</span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-2.5 p-3">
                        <label className="sr-only" htmlFor={`f-kind-${m.key}`}>
                          Type of image {i + 1}
                        </label>
                        <select
                          id={`f-kind-${m.key}`}
                          value={m.kind}
                          onChange={(e) => updateItem(m.key, { kind: e.target.value as MediaKind })}
                          className={cn(inputClass, "py-2 text-sm")}
                        >
                          {(Object.keys(KIND_LABELS) as MediaKind[]).map((k) => (
                            <option key={k} value={k}>
                              {KIND_LABELS[k]}
                            </option>
                          ))}
                        </select>
                        <label className="sr-only" htmlFor={`f-caption-${m.key}`}>
                          Caption for image {i + 1}
                        </label>
                        <input
                          id={`f-caption-${m.key}`}
                          value={m.caption}
                          onChange={(e) => updateItem(m.key, { caption: e.target.value })}
                          maxLength={200}
                          placeholder="Caption (optional)"
                          className={cn(inputClass, "py-2 text-sm")}
                        />
                        <label className="sr-only" htmlFor={`f-alt-${m.key}`}>
                          Description of image {i + 1}
                        </label>
                        <input
                          id={`f-alt-${m.key}`}
                          value={m.alt}
                          onChange={(e) => updateItem(m.key, { alt: e.target.value })}
                          maxLength={300}
                          placeholder="Image description (accessibility)"
                          className={cn(inputClass, "py-2 text-sm")}
                        />
                        <div className="mt-auto flex items-center gap-1 pt-1">
                          <IconButton label={`Move image ${i + 1} earlier`} disabled={i === 0} onClick={() => moveItem(m.key, i - 1)}>
                            <ArrowUp className="size-4" aria-hidden />
                          </IconButton>
                          <IconButton
                            label={`Move image ${i + 1} later`}
                            disabled={i === draft.media.length - 1}
                            onClick={() => moveItem(m.key, i + 1)}
                          >
                            <ArrowDown className="size-4" aria-hidden />
                          </IconButton>
                          <IconButton
                            label={`Use image ${i + 1} as the cover`}
                            disabled={Boolean(draft.coverPath && draft.coverPath === m.storagePath) || draft.coverUrl === m.url}
                            onClick={() => {
                              setDraft((d) => ({
                                ...d,
                                coverUrl: m.url,
                                coverPath: m.storagePath,
                                coverAlt: d.coverAlt || m.alt,
                              }));
                              clearError("coverUrl");
                              toast("Cover image updated.");
                            }}
                          >
                            <Star className="size-4" aria-hidden />
                          </IconButton>
                          <IconButton
                            label={`Remove image ${i + 1}`}
                            danger
                            className="ml-auto"
                            onClick={() => setDraft((d) => ({ ...d, media: d.media.filter((x) => x.key !== m.key) }))}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </IconButton>
                        </div>
                      </div>
                    </li>
                  ))}
                  {galleryUploads.map((u) =>
                    u.error ? (
                      <li key={u.id} className="flex flex-col justify-between gap-3 rounded-[4px] border border-terra/40 bg-[#fbf1ee] p-4">
                        <p className="text-[0.8125rem] text-[#6e2b19]">
                          <span className="block truncate font-medium">{u.name}</span>
                          {u.error}
                        </p>
                        <Button size="sm" onClick={() => dismissUpload(u.id)}>
                          Dismiss
                        </Button>
                      </li>
                    ) : (
                      <li key={u.id}>
                        <UploadingTile upload={u} className="aspect-[4/3] h-full" />
                      </li>
                    ),
                  )}
                </ol>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Film"
              description="Optional. Upload a short clip, or link a YouTube or Vimeo video. It plays only when a visitor presses play."
            />
            <div className="flex flex-col gap-5 p-5">
              <div role="radiogroup" aria-label="Video source" className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ["none", "No video"],
                    ["file", "Upload a file"],
                    ["link", "YouTube or Vimeo link"],
                  ] as const
                ).map(([mode, label]) => (
                  <label
                    key={mode}
                    className={cn(
                      "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-[3px] border px-3 text-sm transition-colors focus-within:outline focus-within:outline-1 focus-within:outline-offset-2",
                      draft.videoMode === mode ? "border-ink bg-ink/4" : "border-ink/20 hover:border-ink/50",
                    )}
                  >
                    <input
                      type="radio"
                      name="video-mode"
                      value={mode}
                      checked={draft.videoMode === mode}
                      onChange={() => {
                        set("videoMode", mode);
                        clearError("videoUrl");
                      }}
                      className="accent-ink"
                    />
                    {label}
                  </label>
                ))}
              </div>

              {draft.videoMode === "file" && (
                <div id="f-video" tabIndex={-1} className="focus:outline-none">
                  <VideoFileSlot
                    id="f-video-input"
                    url={draft.videoFileUrl}
                    upload={slotUpload("video")}
                    accept={VIDEO_ACCEPT}
                    invalid={Boolean(err("videoUrl"))}
                    hint={`MP4, WebM or MOV · up to ${formatBytes(VIDEO_MAX_BYTES)}. Longer films: use YouTube or Vimeo.`}
                    onFile={uploadVideo}
                    onRemove={() => setDraft((d) => ({ ...d, videoFileUrl: null, videoFilePath: null }))}
                  />
                  {err("videoUrl") && (
                    <p role="alert" className="mt-2 text-[0.8125rem] text-terra">
                      {err("videoUrl")}
                    </p>
                  )}
                </div>
              )}

              {draft.videoMode === "link" && (
                <Field
                  label="Video link"
                  htmlFor="f-video"
                  error={err("videoUrl") ?? (draft.videoLink.trim() && !video ? "This link is not a YouTube or Vimeo video." : null)}
                  hint={
                    video && video.kind !== "file" ? (
                      <span className="inline-flex items-center gap-1.5 text-[#2f5a2c]">
                        <CheckCircle2 className="size-3.5" aria-hidden />
                        {video.kind === "youtube" ? "YouTube" : "Vimeo"} video recognised
                      </span>
                    ) : (
                      "Paste the address of the video page, e.g. https://www.youtube.com/watch?v=…"
                    )
                  }
                >
                  <input
                    id="f-video"
                    type="url"
                    inputMode="url"
                    value={draft.videoLink}
                    onChange={(e) => set("videoLink", e.target.value)}
                    placeholder="https://"
                    aria-invalid={Boolean(err("videoUrl") || (draft.videoLink.trim() && !video))}
                    className={inputClass}
                  />
                </Field>
              )}

              {draft.videoMode !== "none" && (
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <div>
                    <p className="mb-1.5 text-sm font-medium">Poster image</p>
                    <ImageSlot
                      id="f-poster"
                      url={draft.posterUrl}
                      upload={slotUpload("poster")}
                      accept={IMAGE_ACCEPT}
                      invalid={Boolean(err("videoPosterUrl"))}
                      hint="Optional · shown before the video plays"
                      aspect="aspect-video"
                      onFile={uploadPoster}
                      onRemove={() => setDraft((d) => ({ ...d, posterUrl: null, posterPath: null }))}
                    />
                  </div>
                  <p className="self-end text-[0.8125rem] leading-relaxed text-ink/50">
                    Without a poster, the cover image is used. Videos never autoplay with sound, and YouTube/Vimeo players
                    load only after a visitor presses play.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ——— Side column ——— */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Publishing" />
            <div className="flex flex-col gap-4 p-5">
              <div role="radiogroup" aria-label="Visibility" className="flex flex-col gap-2">
                {(
                  [
                    ["draft", "Draft", "Only visible here in the admin."],
                    ["published", "Published", "Visible on the website."],
                  ] as const
                ).map(([value, label, text]) => (
                  <label
                    key={value}
                    className={cn(
                      "flex cursor-pointer gap-3 rounded-[3px] border p-3 transition-colors focus-within:outline focus-within:outline-1 focus-within:outline-offset-2",
                      draft.visibility === value ? "border-ink bg-ink/4" : "border-ink/20 hover:border-ink/50",
                    )}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={value}
                      checked={draft.visibility === value}
                      onChange={() => set("visibility", value)}
                      className="mt-0.5 accent-ink"
                    />
                    <span>
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="block text-[0.8125rem] text-ink/55">{text}</span>
                    </span>
                  </label>
                ))}
              </div>

              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                  className="mt-0.5 size-4 accent-ink"
                />
                <span>
                  <span className="block font-medium">Featured</span>
                  <span className="block text-[0.8125rem] text-ink/55">Shown first in the home page selection.</span>
                </span>
              </label>

              <Field label="Display order" htmlFor="f-order" error={err("sortOrder")} hint="Lower numbers appear first.">
                <input
                  id="f-order"
                  type="number"
                  inputMode="numeric"
                  value={draft.sortOrder}
                  onChange={(e) => set("sortOrder", e.target.value)}
                  min={-10000}
                  max={10000}
                  step={1}
                  className={cn(inputClass, "w-28")}
                />
              </Field>

              <label className="flex cursor-pointer items-start gap-3 border-t border-ink/10 pt-4 text-sm">
                <input
                  type="checkbox"
                  checked={draft.isPlaceholder}
                  onChange={(e) => set("isPlaceholder", e.target.checked)}
                  className="mt-0.5 size-4 accent-ink"
                />
                <span>
                  <span className="block font-medium">Demo entry</span>
                  <span className="block text-[0.8125rem] text-ink/55">
                    Labelled as demonstration content on the site and left out of search-engine data. Untick for real
                    projects.
                  </span>
                </span>
              </label>
            </div>
          </Card>

          <Card>
            <CardHeader title="Web address" />
            <div className="p-5">
              <Field
                label="Address"
                htmlFor="f-slug"
                required
                error={err("slug")}
                hint={
                  isLive
                    ? "Changing this breaks links that have already been shared."
                    : slugAuto
                      ? "Filled in from the title."
                      : "Lowercase letters, numbers and hyphens."
                }
              >
                <div className="flex items-stretch overflow-hidden rounded-[3px] border border-ink/20 bg-white focus-within:border-ink">
                  <span className="flex items-center border-r border-ink/10 bg-bone px-2.5 font-mono text-[0.75rem] text-ink/50">
                    /projects/
                  </span>
                  <input
                    id="f-slug"
                    value={draft.slug}
                    onChange={(e) => {
                      setSlugAuto(false);
                      set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }}
                    onBlur={() => draft.slug && set("slug", slugify(draft.slug))}
                    maxLength={80}
                    spellCheck={false}
                    autoCapitalize="off"
                    aria-invalid={Boolean(err("slug"))}
                    className="min-w-0 flex-1 px-2.5 py-2.5 font-mono text-[0.8125rem] focus:outline-none"
                  />
                </div>
              </Field>
              {saved && isLive && (
                <a
                  href={`/projects/${saved.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
                >
                  View on the website
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              )}
            </div>
          </Card>

          {projectId && (
            <Card>
              <CardHeader title="Delete project" />
              <div className="flex flex-col gap-3 p-5 text-[0.8125rem] text-ink/60">
                <p>Removes the project and its uploaded files permanently.</p>
                <Button tone="secondary" size="sm" className="self-start hover:border-terra hover:text-terra" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="size-3.5" aria-hidden />
                  Delete project
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ——— Save bar ——— */}
      <div className="sticky bottom-0 z-30 -mx-5 mt-8 flex items-center justify-between gap-3 border-t border-ink/10 bg-bone/95 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:-mx-10 md:px-10">
        <p className="min-w-0 truncate text-[0.8125rem] text-ink/60" aria-live="polite">
          {uploading
            ? `Uploading ${uploading} file${uploading === 1 ? "" : "s"}…`
            : dirty
              ? "Unsaved changes"
              : projectId
                ? "All changes saved"
                : "New project"}
        </p>
        <div className="flex shrink-0 gap-2">
          <Button tone="ghost" onClick={leave}>
            {dirty ? "Cancel" : "Back"}
          </Button>
          <button type="submit" disabled={isSaving || uploading > 0 || (!dirty && Boolean(projectId))} className={buttonClass("primary")}>
            {isSaving ? "Saving…" : saveLabel}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this project?"
        confirmLabel="Delete project"
        busy={isDeleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={remove}
      >
        <strong className="text-ink">{draft.title || "This project"}</strong> and all of its uploaded photos and video will be
        removed permanently. This cannot be undone.
      </ConfirmDialog>
    </form>
  );
}

function IconButton({
  label,
  danger,
  className,
  children,
  ...props
}: ComponentProps<"button"> & { label: string; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "flex size-9 items-center justify-center rounded-[3px] text-ink/55 transition-colors hover:bg-ink/5 disabled:pointer-events-none disabled:opacity-30",
        danger ? "hover:text-terra" : "hover:text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
