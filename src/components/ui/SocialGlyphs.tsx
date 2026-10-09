import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type GlyphProps = { className?: string };

/**
 * Contact glyphs drawn in the same hairline as the logo mark: a 20-unit
 * sheet, one stroke weight, no fills except where a form needs a solid.
 * Monochrome by design — they take the colour of the text around them.
 */
function Glyph({ className, children }: GlyphProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 20 20"
      className={cn("shrink-0", className ?? "size-4")}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/** A handset in elevation — earpiece and mouthpiece joined by a single arc. */
export function PhoneGlyph({ className }: GlyphProps) {
  return (
    <Glyph className={className}>
      <path d="M3.5 2.5h3l1.2 3.6-1.9 1.4a9 9 0 0 0 6.7 6.7l1.4-1.9 3.6 1.2v3a1 1 0 0 1-1 1A15.5 15.5 0 0 1 2.5 3.5a1 1 0 0 1 1-1Z" />
    </Glyph>
  );
}

/** Speech bubble with its tail, and a small solid handset set inside. */
export function WhatsAppGlyph({ className }: GlyphProps) {
  return (
    <Glyph className={className}>
      <path d="M3 17l1.1-3.6A7.5 7.5 0 1 1 6.6 15.9Z" />
      <path
        d="M7.25 5.75h1.5l.6 1.8-.95.7a4.5 4.5 0 0 0 3.35 3.35l.7-.95 1.8.6v1.5a.5.5 0 0 1-.5.5A7.75 7.75 0 0 1 6.75 6.25a.5.5 0 0 1 .5-.5Z"
        fill="currentColor"
        stroke="none"
      />
    </Glyph>
  );
}

/** Rounded square, lens and viewfinder point. */
export function InstagramGlyph({ className }: GlyphProps) {
  return (
    <Glyph className={className}>
      <rect x="2.75" y="2.75" width="14.5" height="14.5" rx="4.25" />
      <circle cx="10" cy="10" r="3.4" />
      <circle cx="14.25" cy="5.75" r="0.6" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

/** A single-stroke “f” rising through a circle. */
export function FacebookGlyph({ className }: GlyphProps) {
  return (
    <Glyph className={className}>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M12.75 6.25h-1.25a2 2 0 0 0-2 2v9M7.5 10.5h4.75" />
    </Glyph>
  );
}
