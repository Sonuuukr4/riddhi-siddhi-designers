"use client";

import { ImagePlus, Loader2, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { useState, type DragEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Thumb, buttonClass } from "./ui";

/** An upload in flight (or one that failed), shown in the slot it belongs to. */
export type UploadState = { id: string; name: string; progress: number; error: string | null };

const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer.types).includes("Files");

export function DropZone({
  id,
  accept,
  multiple,
  disabled,
  invalid,
  describedBy,
  onFiles,
  className,
  children,
}: {
  id: string;
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  onFiles: (files: File[]) => void;
  className?: string;
  children: ReactNode;
}) {
  const [over, setOver] = useState(false);
  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        if (!hasFiles(e) || disabled) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        if (!hasFiles(e) || disabled) return;
        e.preventDefault();
        setOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) onFiles(multiple ? files : files.slice(0, 1));
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[4px] border border-dashed px-4 py-8 text-center text-sm transition-colors focus-within:border-ink focus-within:outline focus-within:outline-1 focus-within:outline-offset-2",
        over
          ? "border-ink bg-ink/5"
          : invalid
            ? "border-terra bg-[#fbf1ee]"
            : "border-ink/25 bg-bone hover:border-ink/50",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
      {children}
    </label>
  );
}

export function Progress({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="h-1 w-full overflow-hidden rounded-full bg-ink/10"
    >
      <div className="h-full bg-ink transition-[width] duration-200" style={{ width: `${Math.max(3, pct)}%` }} />
    </div>
  );
}

export function UploadingTile({ upload, className }: { upload: UploadState; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-[4px] border border-ink/10 bg-bone p-5", className)}>
      <Loader2 className="size-5 animate-spin text-ink/50" aria-hidden />
      <p className="max-w-full truncate text-[0.8125rem] text-ink/70">
        {upload.progress > 0 ? `Uploading ${Math.round(upload.progress * 100)}%` : "Preparing image…"}
      </p>
      <Progress value={upload.progress} label={`Uploading ${upload.name}`} />
      <p className="max-w-full truncate text-[0.75rem] text-ink/45">{upload.name}</p>
    </div>
  );
}

/** Single image (cover, video poster): empty drop zone → upload progress → preview with replace/remove. */
export function ImageSlot({
  id,
  url,
  upload,
  accept,
  invalid,
  hint,
  aspect = "aspect-[4/3]",
  onFile,
  onRemove,
}: {
  id: string;
  url: string | null;
  upload: UploadState | null;
  accept: string;
  invalid?: boolean;
  hint: ReactNode;
  aspect?: string;
  onFile: (file: File) => void;
  onRemove: () => void;
}) {
  const busy = Boolean(upload && !upload.error);
  return (
    <div className="flex flex-col gap-2">
      {busy && upload ? (
        <UploadingTile upload={upload} className={aspect} />
      ) : url ? (
        <div className="group relative overflow-hidden rounded-[4px] border border-ink/10">
          <Thumb src={url} className={cn("w-full", aspect)} />
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-ink/60 to-transparent p-3">
            <label htmlFor={id} className={cn(buttonClass("secondary", "sm"), "cursor-pointer focus-within:outline focus-within:outline-1")}>
              <input
                id={id}
                type="file"
                accept={accept}
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) onFile(f);
                }}
              />
              <RefreshCw className="size-3.5" aria-hidden />
              Replace
            </label>
            <button type="button" onClick={onRemove} className={buttonClass("secondary", "sm")}>
              <Trash2 className="size-3.5" aria-hidden />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <DropZone id={id} accept={accept} invalid={invalid} onFiles={(files) => onFile(files[0])} className={aspect}>
          <ImagePlus className="size-6 text-ink/40" aria-hidden />
          <span className="font-medium">Drop an image here, or choose a file</span>
          <span className="text-[0.8125rem] text-ink/50">{hint}</span>
        </DropZone>
      )}
      {upload?.error && (
        <p role="alert" className="text-[0.8125rem] text-terra">
          {upload.name}: {upload.error}
        </p>
      )}
    </div>
  );
}

export function VideoFileSlot({
  id,
  url,
  upload,
  accept,
  invalid,
  hint,
  onFile,
  onRemove,
}: {
  id: string;
  url: string | null;
  upload: UploadState | null;
  accept: string;
  invalid?: boolean;
  hint: ReactNode;
  onFile: (file: File) => void;
  onRemove: () => void;
}) {
  const busy = Boolean(upload && !upload.error);
  return (
    <div className="flex flex-col gap-2">
      {busy && upload ? (
        <UploadingTile upload={upload} className="aspect-video" />
      ) : url ? (
        <div className="overflow-hidden rounded-[4px] border border-ink/10 bg-ink">
          <video src={url} controls preload="metadata" playsInline className="aspect-video w-full" />
          <div className="flex justify-end gap-2 bg-white p-3">
            <label htmlFor={id} className={cn(buttonClass("secondary", "sm"), "cursor-pointer")}>
              <input
                id={id}
                type="file"
                accept={accept}
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) onFile(f);
                }}
              />
              <RefreshCw className="size-3.5" aria-hidden />
              Replace video
            </label>
            <button type="button" onClick={onRemove} className={buttonClass("secondary", "sm")}>
              <Trash2 className="size-3.5" aria-hidden />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <DropZone id={id} accept={accept} invalid={invalid} onFiles={(files) => onFile(files[0])} className="aspect-video">
          <UploadCloud className="size-6 text-ink/40" aria-hidden />
          <span className="font-medium">Drop a video here, or choose a file</span>
          <span className="text-[0.8125rem] text-ink/50">{hint}</span>
        </DropZone>
      )}
      {upload?.error && (
        <p role="alert" className="text-[0.8125rem] text-terra">
          {upload.name}: {upload.error}
        </p>
      )}
    </div>
  );
}
