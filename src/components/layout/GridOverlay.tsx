"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The site's structural grid, drawn as faint full-height lines aligned to the
 * 12-column layout. Difference blending keeps the lines equally subtle over
 * paper, ink and photography. Mobile shows halves; md+ shows quarters.
 */
export function GridOverlay() {
  const reduced = usePrefersReducedMotion();

  const line = (key: string, side: "left" | "right", delay: number, className?: string) => (
    <motion.span
      key={key}
      className={cn(
        "absolute inset-y-0 w-px origin-top bg-white/[0.075]",
        side === "left" ? "left-0" : "right-0",
        className,
      )}
      initial={reduced ? false : { scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 2.4, ease: ease.inOut, delay }}
    />
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[40] mix-blend-difference">
      <div className="frame grid-12 h-full">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="relative h-full">
            {(i === 0 || i === 6) && line("l", "left", 0.2 + i * 0.05)}
            {(i === 3 || i === 9) && line("l", "left", 0.2 + i * 0.05, "hidden md:block")}
            {i === 11 && line("r", "right", 0.8)}
          </div>
        ))}
      </div>
    </div>
  );
}
