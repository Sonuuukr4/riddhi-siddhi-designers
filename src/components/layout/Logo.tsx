import { cn } from "@/lib/utils";

/**
 * Mark: a door swing drawn inside a square — the plan symbol for an opening.
 * Paired with a restrained wordmark; never set large.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className={cn("size-[1.125rem]", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
    >
      <rect x="0.55" y="0.55" width="18.9" height="18.9" />
      <path d="M0.55 19.45V6.45" strokeWidth="1.6" />
      <path d="M0.55 6.45a13 13 0 0 1 13 13" strokeDasharray="1.4 1.4" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-[0.8125rem] font-semibold uppercase leading-none tracking-[0.2em] expanded">
        Riddhi Siddhi
      </span>
    </span>
  );
}
