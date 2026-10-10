"use client";

import { AnimatePresence, motion } from "motion/react";
import { Fragment, useState } from "react";
import { SectionHead } from "@/components/ui/Annotations";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { FadeIn, RevealLines } from "@/components/ui/Reveal";
import { disciplines, studio } from "@/content/studio";
import { ease } from "@/lib/motion";
import { cn, pad } from "@/lib/utils";

/**
 * 07 — The Studio. The statement, the practice in two paragraphs, and its
 * disciplines set as one continuous line of type: point at (or tap) a word
 * to read what it covers.
 */
export function Studio() {
  const [active, setActive] = useState<string | null>(null);
  const current = disciplines.find((d) => d.id === active);

  return (
    <section
      id="studio"
      aria-labelledby="studio-title"
      data-theme="light"
      data-section-index="07"
      data-section-label="Studio"
      className="relative overflow-hidden bg-paper pb-28 pt-20 text-ink md:pb-40 md:pt-28"
    >
      <SectionHead index={7} label="The Studio" meta="East Patel Nagar — New Delhi" />

      <div className="frame mt-14 md:mt-24">
        <h2 id="studio-title" className="sr-only">
          The Studio
        </h2>
        <blockquote className="text-[clamp(2.6rem,7.6vw,8.75rem)] font-medium uppercase leading-[0.9] tracking-[-0.015em] condensed">
          <RevealLines
            lines={[
              "We design spaces",
              <>
                that <span className="font-serif font-normal normal-case italic">belong</span> to the
              </>,
              <>
                people who <span className="font-serif font-normal normal-case italic">inhabit</span> them.
              </>,
            ]}
          />
        </blockquote>
      </div>

      <div className="frame grid-12 mt-16 gap-y-12 md:mt-28">
        <div className="relative col-span-12 md:col-span-5">
          <ParallaxImage
            asset={studio.image}
            sizes="(min-width: 768px) 40vw, 100vw"
            className="aspect-[4/5] w-[82%] md:w-full"
            notePlacement="bottom-2 left-2"
          />
          <div className="absolute -bottom-12 right-0 w-[44%] shadow-[0_0_0_10px_var(--color-paper)] md:-right-[22%] md:w-[46%]">
            <ParallaxImage
              asset={studio.imageSecondary}
              sizes="(min-width: 768px) 20vw, 45vw"
              strength={0.04}
              className="aspect-square"
            />
          </div>
        </div>

        {/* Extra room on phones: the inset photo hangs below the main image. */}
        <div className="col-span-12 mt-10 flex flex-col justify-end gap-6 md:col-span-5 md:col-start-8 md:mt-0">
          {studio.about.map((p, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <p className={i === 0 ? "text-lede text-pretty" : "text-pretty text-concrete"}>{p}</p>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Disciplines */}
      <div className="frame mt-28 md:mt-40">
        <p className="label mb-6 flex justify-between border-b border-ink/15 pb-3 text-concrete">
          <span>Disciplines</span>
          <span className="hidden sm:inline">Point or tap a word</span>
        </p>
        <ul
          className="flex flex-wrap items-baseline gap-x-[0.3em] text-headline font-medium uppercase leading-[1.02] condensed"
          onMouseLeave={() => setActive(null)}
        >
          {disciplines.map((d, i) => (
            <Fragment key={d.id}>
              <li className="whitespace-nowrap">
                <button
                  type="button"
                  aria-pressed={active === d.id}
                  aria-describedby="discipline-note"
                  onMouseEnter={() => setActive(d.id)}
                  onFocus={() => setActive(d.id)}
                  onClick={() => setActive((a) => (a === d.id ? null : d.id))}
                  className={cn(
                    "text-left uppercase transition-colors duration-500",
                    active && active !== d.id ? "text-ink/20" : "text-ink",
                  )}
                >
                  <sup className="label mr-1 align-top text-[0.625rem] font-normal leading-none tracking-normal text-concrete">
                    {pad(i + 1)}
                  </sup>
                  {d.label}
                </button>
                {/* The separator belongs to the word before it, so no line can start with a slash. */}
                {i < disciplines.length - 1 && (
                  <span aria-hidden className="ml-[0.3em] font-serif font-normal text-stone">
                    /
                  </span>
                )}
              </li>
            </Fragment>
          ))}
        </ul>
        <div id="discipline-note" aria-live="polite" className="mt-8 min-h-[4.5rem] max-w-xl">
          <AnimatePresence mode="wait">
            <motion.p
              key={current?.id ?? "none"}
              className={cn("text-lede text-pretty", !current && "text-concrete")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: ease.out }}
            >
              {current
                ? current.description
                : "Six disciplines, one studio — from the first drawing to the final approval."}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
