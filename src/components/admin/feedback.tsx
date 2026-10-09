"use client";

import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui";

/* ——— Toasts ———————————————————————————————————————————————————— */

type Toast = { id: number; message: string; tone: "success" | "error" };
const ToastContext = createContext<(message: string, tone?: Toast["tone"]) => void>(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);
  const toast = useCallback(
    (message: string, tone: Toast["tone"] = "success") => {
      const id = next.current++;
      setToasts((all) => [...all.slice(-2), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), tone === "error" ? 8000 : 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-16 z-[60] flex flex-col items-center gap-2 p-4 md:bottom-auto md:top-0 md:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[4px] px-4 py-3 text-sm shadow-[0_12px_32px_-12px_rgba(15,15,14,0.45)]",
              t.tone === "error" ? "bg-terra text-bone" : "bg-ink text-bone",
            )}
          >
            {t.tone === "error" ? (
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            ) : (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            )}
            <p className="flex-1 leading-snug">{t.message}</p>
            <button type="button" onClick={() => dismiss(t.id)} className="-m-1 p-1 opacity-70 hover:opacity-100" aria-label="Dismiss">
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ——— Confirmation dialog ———————————————————————————————————————— */

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Confirm",
  tone = "danger",
  busy = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(e) => {
        // Clicking the backdrop (outside the panel) cancels.
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-[6px] bg-white p-0 text-ink backdrop:bg-ink/50"
    >
      <div className="p-6">
        <h2 id="confirm-title" className="text-lg font-semibold">
          {title}
        </h2>
        {children && <div className="mt-2 text-sm leading-relaxed text-ink/70">{children}</div>}
      </div>
      <div className="flex justify-end gap-2 border-t border-ink/10 bg-bone px-6 py-4">
        <Button tone="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button tone={tone} onClick={onConfirm} disabled={busy || confirmDisabled} autoFocus={tone === "primary"}>
          {busy ? "Working…" : confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
