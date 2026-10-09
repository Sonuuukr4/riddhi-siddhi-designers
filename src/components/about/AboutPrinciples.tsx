"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { RegMark, SectionHead } from "@/components/ui/Annotations";
import { FadeIn, RevealLines } from "@/components/ui/Reveal";
import { about, type AboutPrinciple } from "@/content/about";
import { ease } from "@/lib/motion";
import { cn, pad } from "@/lib/utils";
import { PrincipleDiagram } from "./PrincipleDiagram";
import { ABOUT_SECTION_TOTAL } from "./sheet";

/**
 * 05 — The way we think. Seven words in a numbered schedule beside a single
 * drawing plate. The word at the centre of the screen — or the one pointed
 * at, focused or tapped — draws its diagram on the plate, with the question
 * the studio asks of a project under that heading. Without the plate (small
 * screens) each row carries its own small drawing and question.
 */
export function AboutPrinciples() {
  const { thinking } = about;
  const { principles } = thinking;
  const [active, setActive] = useState(0);
  const rows = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    rows.current.forEach((r) => r && observer.observe(r));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="thinking"
      aria-labelledby="thinking-title"
      data-theme="dark"
      data-section-index="05"
      data-section-label="Thinking"
      className="ink-grid relative bg-carbon pb-28 pt-20 text-paper md:pb-40 md:pt-28"
    >
      <SectionHead
        index={5}
        total={ABOUT_SECTION_TOTAL}
        label={thinking.label}
        meta={`${pad(principles.length)} considerations`}
      />

      <div className="frame grid-12 mt-14 gap-y-8 md:mt-20">
        <h2 id="thinking-title" className="col-span-12 text-display font-medium uppercase condensed md:col-span-8">
          <RevealLines
            lines={[
              thinking.heading[0],
              <span key="s" className="pl-[12%] font-serif font-normal normal-case italic text-paper/80">
                {thinking.heading[1]}
              </span>,
            ]}
          />
        </h2>
        <FadeIn className="col-span-12 self-end text-pretty text-paper/65 md:col-span-4">{thinking.intro}</FadeIn>
      </div>

      <div className="frame grid-12 mt-16 md:mt-24">
        <ol className="col-span-12 border-t border-paper/15 lg:col-span-7">
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
                className="border-b border-paper/15"
              >
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="grid w-full grid-cols-[2.25rem_1fr] items-center gap-x-4 pt-5 text-left md:grid-cols-[3.5rem_1fr] md:pt-7"
                >
                  <span className={cn("label transition-colors duration-700", on ? "text-paper" : "text-paper/60")}>
                    {pad(i + 1)}
                  </span>
                  <span className="flex min-w-0 items-center gap-5">
                    <span
                      className={cn(
                        "text-display font-medium uppercase leading-[0.88] transition-colors duration-700 condensed lg:text-[min(7.6vw,9.5rem)]",
                        on ? "text-paper" : "text-paper/25",
                      )}
                    >
                      {p.word}
                    </span>
                    {/* Leader line — the callout from the word to its drawing. */}
                    <span aria-hidden className="relative hidden h-px min-w-6 flex-1 sm:block">
                      <motion.span
                        className="absolute inset-0 origin-left bg-paper/40"
                        initial={false}
                        animate={{ scaleX: on ? 1 : 0 }}
                        transition={{ duration: 0.9, ease: ease.inOut }}
                      />
                      <motion.span
                        className="absolute -right-1 -top-1 size-2 rounded-full border border-terra"
                        initial={false}
                        animate={{ opacity: on ? 1 : 0 }}
                        transition={{ duration: 0.4, delay: on ? 0.6 : 0 }}
                      />
                    </span>
                  </span>
                </button>

                <div className="grid grid-cols-[2.25rem_1fr] gap-x-4 pb-5 md:grid-cols-[3.5rem_1fr] md:pb-7">
                  <div className="col-start-2 flex items-start justify-between gap-5 pt-3">
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "max-w-md text-pretty transition-colors duration-700",
                          on ? "text-paper/85" : "text-paper/60",
                        )}
                      >
                        {p.line}
                      </p>
                      <p className="mt-2 font-serif text-lg italic leading-snug text-paper/60 lg:sr-only">
                        {p.question}
                      </p>
                    </div>
                    <PrincipleDiagram id={p.id} active={on} weight={1.8} className="size-16 shrink-0 lg:hidden" />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Drawing plate (wide screens) */}
        <div className="relative col-span-5 col-start-8 hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+3rem)]">
            <Plate principle={principles[active]} index={active} total={principles.length} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** A square drawing sheet with title-block annotations. Decorative: the same words are in the list. */
function Plate({ principle, index, total }: { principle: AboutPrinciple; index: number; total: number }) {
  return (
    <figure aria-hidden className="w-[min(100%,calc(100svh_-_var(--header-h)_-_15rem))]">
      <div className="relative aspect-square w-full border border-paper/15 bg-ink/40">
        <RegMark className="absolute -left-2 -top-2 text-paper/50" />
        <RegMark className="absolute -right-2 -top-2 text-paper/50" />
        <RegMark className="absolute -bottom-2 -left-2 text-paper/50" />
        <RegMark className="absolute -bottom-2 -right-2 text-paper/50" />

        <div className="label absolute inset-x-0 top-0 flex justify-between p-4 text-paper/60">
          <span>Fig. 05.{pad(index + 1)}</span>
          <span>{principle.word}</span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={principle.id}
            className="absolute inset-[15%] text-paper"
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <PrincipleDiagram id={principle.id} active weight={0.4} className="h-full w-full" />
          </motion.div>
        </AnimatePresence>

        <div className="label absolute inset-x-0 bottom-0 flex justify-between p-4 text-paper/60">
          <span>Scale — NTS</span>
          <span>
            {pad(index + 1)} / {pad(total)}
          </span>
        </div>
      </div>

      <figcaption className="mt-6 min-h-[5.5rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={principle.id}
            className="font-serif text-title italic leading-[1.1] text-paper/90"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: ease.out }}
          >
            {principle.question}
          </motion.p>
        </AnimatePresence>
      </figcaption>
    </figure>
  );
}
