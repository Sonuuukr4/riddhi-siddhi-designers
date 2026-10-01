/** Join class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Zero-pad a number: pad(3) → "03". */
export function pad(n: number, width = 2) {
  return String(n).padStart(width, "0");
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Renders a missing fact as an em dash rather than inventing one. */
export function orDash(value: string | null | undefined) {
  return value && value.trim() ? value : "—";
}
