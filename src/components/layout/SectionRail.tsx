"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ease } from "@/lib/motion";

type Current = { index: string; label: string } | null;

/**
 * A vertical annotation in the left margin naming the section in view, with a
 * page-progress line in the right margin. Sections opt in with
 * data-section-index / data-section-label. Desktop only.
 */
export function SectionRail() {
  const pathname = usePathname();
  const [current, setCurrent] = useState<Current>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section-index]"));
    if (!sections.length) {
      const t = setTimeout(() => setCurrent(null), 0);
      return () => clearTimeout(t);
    }
    // The observer only fires as sections cross the viewport's centre line.
    const observer = new IntersectionObserver(
      () => {
        const mid = window.innerHeight / 2;
        const hit = sections.find((s) => {
          const r = s.getBoundingClientRect();
          return r.top <= mid && r.bottom > mid;
        });
        setCurrent(hit ? { index: hit.dataset.sectionIndex!, label: hit.dataset.sectionLabel ?? "" } : null);
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-y-0 left-0 right-0 z-[41] hidden text-white mix-blend-difference lg:block"
    >
      <div className="absolute left-[calc(var(--gutter)/2)] top-1/2 -translate-x-1/2 -translate-y-1/2">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.index}
              className="label flex origin-center -rotate-90 items-center gap-3 whitespace-nowrap text-[0.625rem] opacity-70"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 0.7, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.6, ease: ease.out }}
            >
              <span>{current.index}</span>
              <span className="h-px w-6 bg-current" />
              <span>{current.label}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="absolute bottom-10 right-[calc(var(--gutter)/2)] top-[calc(var(--header-h)+2rem)] w-px translate-x-1/2 bg-white/15">
        <motion.span className="absolute inset-0 origin-top bg-white/70" style={{ scaleY: progress }} />
      </div>
    </div>
  );
}
