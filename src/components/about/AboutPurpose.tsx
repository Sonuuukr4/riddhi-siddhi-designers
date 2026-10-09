"use client";

import { motion } from "motion/react";
import { SectionHead } from "@/components/ui/Annotations";
import { FadeIn, RevealLines } from "@/components/ui/Reveal";
import { about } from "@/content/about";
import { drawX, inView } from "@/lib/motion";
import { cn, pad } from "@/lib/utils";
import { ABOUT_SECTION_TOTAL } from "./sheet";

/**
 * 04 — Purpose. Read as a set of transformations: what the studio is given
 * (set in condensed capitals) is drawn across into what it returns (set in
 * italic). The heading stays in view while the list passes on wide screens.
 */
export function AboutPurpose() {
  const { purpose } = about;
  const last = purpose.heading.length - 1;

  return (
    <section
      id="purpose"
      aria-labelledby="purpose-title"
      data-theme="light"
      data-section-index="04"
      data-section-label="Purpose"
      className="relative bg-bone pb-28 pt-20 text-ink md:pb-40 md:pt-28"
    >
      <SectionHead index={4} total={ABOUT_SECTION_TOTAL} label={purpose.label} meta="Requirement → Space" />

      <div className="frame grid-12 mt-14 gap-y-14 md:mt-20">
        <div className="col-span-12 lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
            <h2 id="purpose-title" className="text-headline font-medium uppercase condensed">
              <span className="sr-only">{purpose.label}: </span>
              <RevealLines
                lines={purpose.heading.map((line, i) => (
                  <span
                    key={i}
                    className={cn(
                      "block",
                      i === last && "font-serif font-normal normal-case italic tracking-[-0.01em]",
                    )}
                  >
                    {line}
                  </span>
                ))}
              />
            </h2>
            <FadeIn className="mt-8 max-w-md text-pretty text-concrete" delay={0.2}>
              {purpose.intro}
            </FadeIn>
          </div>
        </div>

        <ol className="col-span-12 border-t border-ink/15 lg:col-span-6 lg:col-start-7">
          {purpose.points.map((p, i) => (
            <li key={p.to} className="group border-b border-ink/15 py-7 md:py-9">
              <div className="grid grid-cols-[2.25rem_1fr] gap-x-4 md:grid-cols-[3.5rem_1fr]">
                <span className="label pt-[0.45em] text-concrete">{pad(i + 1)}</span>
                <div className="min-w-0">
                  <h3 className="flex flex-wrap items-center gap-x-4 gap-y-2 text-title leading-none">
                    <span className="font-medium uppercase text-concrete condensed">{p.from}</span>
                    <span className="sr-only"> into </span>
                    <DrawnArrow />
                    <span className="font-serif italic">{p.to}</span>
                  </h3>
                  <FadeIn className="mt-4 max-w-md text-pretty text-concrete" delay={0.1}>
                    {p.text}
                  </FadeIn>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** A thin arrow that draws across when it enters view; red pencil on hover. */
function DrawnArrow() {
  return (
    <span
      aria-hidden
      className="relative flex h-3 w-12 shrink-0 items-center text-ink/45 transition-colors duration-500 group-hover:text-terra md:w-20"
    >
      <motion.span
        className="block h-px w-full origin-left bg-current"
        variants={drawX}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        custom={2}
      />
      <svg
        viewBox="0 0 6 10"
        className="absolute right-0 h-2.5 w-1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M0.5 0.5 L5.5 5 L0.5 9.5" />
      </svg>
    </span>
  );
}
