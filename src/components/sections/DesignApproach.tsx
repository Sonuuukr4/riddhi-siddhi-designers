"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { SectionHead } from "@/components/ui/Annotations";
import { Img } from "@/components/ui/Img";
import { FadeIn } from "@/components/ui/Reveal";
import { principles } from "@/content/studio";
import { ease } from "@/lib/motion";
import { cn, pad } from "@/lib/utils";

/**
 * 04 — What we look for. Six words, set as outlines, fill with ink as they
 * reach the centre of the screen; a small image opens inside the line like
 * a figure set into a column of text.
 */
export function DesignApproach() {
  const [active, setActive] = useState(-1);
  const rows = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    rows.current.forEach((r) => r && observer.observe(r));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="approach"
      aria-labelledby="approach-title"
      data-theme="light"
      data-section-index="04"
      data-section-label="Approach"
      className="paper-grid relative bg-paper-deep pb-28 pt-20 text-ink md:pb-40 md:pt-28"
    >
      <SectionHead index={4} label="Design approach" meta="What we look for" />

      <div className="frame grid-12 mt-14 gap-y-6 md:mt-20">
        <h2 id="approach-title" className="col-span-12 font-serif text-headline italic md:col-span-6">
          What we look for
        </h2>
        <FadeIn className="col-span-12 self-end text-concrete md:col-span-4 md:col-start-9">
          Six qualities that every brief is measured against — whether the project is a home, a workplace or a
          warehouse.
        </FadeIn>
      </div>

      <ol className="frame mt-14 md:mt-24">
        {principles.map((p, i) => {
          const on = i === active;
          return (
            <li
              key={p.id}
              ref={(el) => {
                rows.current[i] = el;
              }}
              data-i={i}
              onMouseEnter={() => setActive(i)}
              className="grid-12 items-center border-t border-ink/15 py-4 last:border-b md:py-6"
            >
              <span className="label col-span-2 flex items-center gap-3 text-concrete md:col-span-1">{pad(i + 1)}</span>
              <div className="col-span-10 flex items-center gap-[0.25em] md:col-span-8">
                <span
                  className={cn(
                    "text-display font-medium uppercase leading-[0.88] transition-[color,-webkit-text-stroke-color] duration-700 condensed",
                    on ? "text-ink" : "text-outline",
                  )}
                  style={{ "--outline-color": "rgb(15 15 14 / 0.38)" } as CSSProperties}
                >
                  {p.word}
                </span>
                <motion.span
                  aria-hidden
                  className="relative hidden h-[0.62em] shrink-0 overflow-hidden text-display sm:block"
                  initial={false}
                  animate={{ width: on ? "1.9em" : "0em", opacity: on ? 1 : 0 }}
                  transition={{ duration: 0.9, ease: ease.inOut }}
                >
                  <Img asset={p.image} alt="" fill sizes="20vw" className="tone object-cover" />
                </motion.span>
              </div>
              <div className="col-span-12 mt-2 flex items-center justify-between gap-6 md:col-span-3 md:mt-0">
                <p
                  className={cn(
                    "max-w-[17rem] text-pretty transition-colors duration-700",
                    on ? "text-ink" : "text-concrete",
                  )}
                >
                  {p.line}
                </p>
                <PrincipleGlyph id={p.id} active={on} />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Rounded so server and browser trigonometry produce identical markup. */
const round = (n: number) => Math.round(n * 100) / 100;

/** A small drawing for each quality, drawn with the pen when the row is active. */
function PrincipleGlyph({ id, active }: { id: string; active: boolean }) {
  const reduced = usePrefersReducedMotion();
  const draw = {
    initial: { pathLength: reduced ? 1 : 0 },
    animate: { pathLength: active || reduced ? 1 : 0, opacity: active ? 1 : 0.35 },
    transition: { duration: 1.2, ease: ease.inOut },
  };
  const paths: Record<string, ReactNode> = {
    light: (
      <>
        <motion.circle cx="24" cy="24" r="7" {...draw} />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <motion.line
              key={i}
              x1={round(24 + Math.cos(a) * 12)}
              y1={round(24 + Math.sin(a) * 12)}
              x2={round(24 + Math.cos(a) * 19)}
              y2={round(24 + Math.sin(a) * 19)}
              {...draw}
            />
          );
        })}
      </>
    ),
    proportion: (
      <>
        <motion.rect x="4" y="12" width="40" height="24.7" {...draw} />
        <motion.line x1="28.7" y1="12" x2="28.7" y2="36.7" {...draw} />
        <motion.path d="M28.7 36.7 A24.7 24.7 0 0 1 4 12" {...draw} />
      </>
    ),
    material: (
      <>
        <motion.rect x="6" y="6" width="36" height="36" {...draw} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.line key={i} x1={6 + i * 7.2} y1="42" x2="6" y2={42 - i * 7.2} {...draw} />
        ))}
      </>
    ),
    function: (
      <>
        <motion.path d="M6 40 H20 V14 H40" {...draw} />
        <motion.path d="M35 9 L40 14 L35 19" {...draw} />
        <motion.circle cx="6" cy="40" r="2" {...draw} />
      </>
    ),
    context: (
      <>
        <motion.circle cx="24" cy="24" r="17" {...draw} />
        <motion.path d="M24 10 L29 30 L24 26 L19 30 Z" {...draw} />
        <motion.line x1="24" y1="2" x2="24" y2="7" {...draw} />
      </>
    ),
    detail: (
      <>
        <motion.circle cx="24" cy="24" r="16" {...draw} />
        <motion.line x1="8" y1="24" x2="40" y2="24" {...draw} />
        <motion.line x1="36" y1="36" x2="46" y2="46" {...draw} />
      </>
    ),
  };

  return (
    <svg
      aria-hidden
      viewBox="0 0 48 48"
      className="size-10 shrink-0 md:size-12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      {paths[id]}
    </svg>
  );
}
