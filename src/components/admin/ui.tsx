import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Admin interface primitives. Deliberately plain — the admin is a working
 * tool, so it borrows the site's palette and type but none of its motion.
 */

export const inputClass =
  "block w-full rounded-[3px] border border-ink/20 bg-white px-3 py-2.5 text-[0.9375rem] text-ink placeholder:text-ink/35 transition-colors focus:border-ink focus:outline-none focus-visible:outline-none disabled:bg-paper disabled:text-ink/50 aria-[invalid=true]:border-terra";

type ButtonTone = "primary" | "secondary" | "ghost" | "danger";

const tones: Record<ButtonTone, string> = {
  primary: "bg-ink text-bone hover:bg-graphite border border-ink",
  secondary: "bg-white text-ink border border-ink/20 hover:border-ink",
  ghost: "text-ink/70 hover:text-ink hover:bg-ink/5 border border-transparent",
  danger: "bg-terra text-bone border border-terra hover:bg-[#8c3a24]",
};

export function buttonClass(tone: ButtonTone = "secondary", size: "sm" | "md" = "md") {
  return cn(
    "inline-flex shrink-0 select-none items-center justify-center gap-2 rounded-[3px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    size === "md" ? "min-h-11 px-4 text-sm" : "min-h-9 px-3 text-[0.8125rem]",
    tones[tone],
  );
}

export function Button({
  tone = "secondary",
  size = "md",
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { tone?: ButtonTone; size?: "sm" | "md" }) {
  return <button type={type} className={cn(buttonClass(tone, size), className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
        {required && (
          <span className="ml-1 text-terra" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={hintId} role="alert" className="text-[0.8125rem] text-terra">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[0.8125rem] text-ink/55">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Card({ className, children, ...props }: ComponentProps<"section">) {
  return (
    <section className={cn("rounded-[4px] border border-ink/10 bg-white", className)} {...props}>
      {children}
    </section>
  );
}

export function CardHeader({ title, description, action }: { title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-[0.9375rem] font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-[0.8125rem] text-ink/55">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        {eyebrow && <p className="label mb-2 text-ink/50">{eyebrow}</p>}
        <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.01em] md:text-[2rem]">{title}</h1>
        {description && <div className="mt-1.5 max-w-2xl text-[0.9375rem] text-ink/60">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

const badgeTones = {
  published: "bg-[#e3eee2] text-[#2f5a2c]",
  draft: "bg-paper-deep text-ink/70",
  featured: "bg-[#f1e6d6] text-[#7a5a26]",
  demo: "bg-[#f3e1db] text-terra",
  neutral: "bg-ink/5 text-ink/70",
} as const;

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof badgeTones; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.06em]",
        badgeTones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Notice({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: "info" | "warning" | "error" | "success";
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const styles = {
    info: "border-ink/15 bg-paper/60",
    warning: "border-[#d9b98a] bg-[#faf1e2]",
    error: "border-terra/40 bg-[#f8e8e3] text-[#6e2b19]",
    success: "border-[#9cc29a] bg-[#eaf3e9] text-[#24461f]",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : undefined} className={cn("rounded-[4px] border px-4 py-3 text-sm", styles, className)}>
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className={cn(Boolean(title) && "mt-1", "leading-relaxed")}>{children}</div>}
    </div>
  );
}

/** Plain <img> for admin previews: uploaded files and external placeholders alike, no optimisation needed. */
export function Thumb({ src, alt = "", className }: { src: string | null | undefined; alt?: string; className?: string }) {
  if (!src) return <div className={cn("bg-paper-deep", className)} aria-hidden />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" decoding="async" className={cn("bg-paper-deep object-cover", className)} />
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "9 Oct 2026", in India time. Formatted by hand so server and browser always agree. */
export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const ist = new Date(t + 330 * 60_000);
  return `${ist.getUTCDate()} ${MONTHS[ist.getUTCMonth()]} ${ist.getUTCFullYear()}`;
}
