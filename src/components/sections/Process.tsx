"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ProcessDrawing } from "@/components/process/ProcessDrawing";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { RegMark, SectionHead } from "@/components/ui/Annotations";
import { RevealLines } from "@/components/ui/Reveal";
import { process } from "@/content/studio";
import { site } from "@/content/site";
import { ease } from "@/lib/motion";
import { cn, pad } from "@/lib/utils";

/**
 * 05 — Process. Six stages beside a single drawing sheet. As each stage is
 * reached the sheet gains a layer — the current one drawn in red pencil,
 * earlier ones settling back into graphite.
 */
export function Process() {
  const [step, setStep] = useState(0);
  const rows = useRef<Array<HTMLLIElement | null>>([]);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setStep(Number((e.target as HTMLElement).dataset.i));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    rows.current.forEach((r) => r && observer.observe(r));
    return () => observer.disconnect();
  }, []);

  const current = process[step];

  return (
    <section
      id="process"
      aria-labelledby="process-title"
      data-theme="light"
      data-section-index="05"
      data-section-label="Process"
      className="relative bg-bone pb-28 pt-20 text-ink md:pb-40 md:pt-28"
    >
      <SectionHead index={5} label="Process" meta="Six stages" />

      <div className="frame grid-12 mt-14 md:mt-20">
        <h2 id="process-title" className="col-span-12 text-display font-medium uppercase condensed md:col-span-8">
          <RevealLines
            lines={[
              "From idea",
              <span key="s" className="pl-[12%] font-serif font-normal normal-case italic">
                to space
              </span>,
            ]}
          />
        </h2>
      </div>

      <div className="frame grid-12 mt-14 gap-y-10 md:mt-24">
        {/* Stage selector — touch / small screens */}
        <div className="col-span-12 lg:hidden" role="tablist" aria-label="Process stages">
          <div className="no-scrollbar -mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)]">
            {process.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                type="button"
                aria-selected={i === step}
                onClick={() => setStep(i)}
                className={cn(
                  "label shrink-0 border px-3 py-2.5 transition-colors",
                  i === step ? "border-ink bg-ink text-paper" : "border-ink/20 text-concrete",
                )}
              >
                {pad(i + 1)} {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Steps — desktop scroll sequence */}
        <ol className="col-span-5 hidden lg:block">
          {process.map((s, i) => {
            const on = i === step;
            return (
              <li
                key={s.id}
                ref={(el) => {
                  rows.current[i] = el;
                }}
                data-i={i}
                className="flex min-h-[62vh] flex-col justify-center border-t border-ink/15 first:min-h-[48vh] first:justify-start first:pt-10 last:min-h-[70vh]"
              >
                <button
                  type="button"
                  onClick={() => scrollTo(rows.current[i]!, { offset: -window.innerHeight * 0.35 })}
                  onMouseEnter={() => setStep(i)}
                  className="group text-left"
                  aria-current={on ? "step" : undefined}
                >
                  <span
                    className={cn("label block transition-colors duration-700", on ? "text-terra" : "text-concrete")}
                  >
                    Stage {pad(i + 1)} / {pad(process.length)}
                  </span>
                  <span
                    className={cn(
                      "mt-3 block text-headline font-medium uppercase leading-[0.9] transition-colors duration-700 condensed",
                      on ? "text-ink" : "text-ink/20",
                    )}
                  >
                    {s.title}
                  </span>
                  <span
                    className={cn(
                      "mt-2 block font-serif text-title italic transition-colors duration-700",
                      on ? "text-ink" : "text-ink/20",
                    )}
                  >
                    {s.summary}
                  </span>
                </button>
                <p
                  className={cn(
                    "mt-6 max-w-md text-pretty transition-colors duration-700",
                    on ? "text-ink" : "text-concrete",
                  )}
                >
                  {s.detail}
                </p>
              </li>
            );
          })}
        </ol>

        {/* Drawing sheet */}
        <div className="col-span-12 lg:col-span-7 lg:col-start-6">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <figure className="relative border border-ink/25 bg-paper p-3 md:p-5">
              <RegMark className="absolute -left-2 -top-2 bg-bone text-ink/50" />
              <RegMark className="absolute -right-2 -top-2 bg-bone text-ink/50" />
              <RegMark className="absolute -bottom-2 -left-2 bg-bone text-ink/50" />
              <RegMark className="absolute -bottom-2 -right-2 bg-bone text-ink/50" />
              <div className="paper-grid aspect-[640/520] w-full">
                <ProcessDrawing step={step} />
              </div>
              {/* Title block */}
              <figcaption className="label mt-3 grid grid-cols-2 border border-ink/25 text-[0.625rem] md:grid-cols-4">
                <span className="border-b border-r border-ink/25 p-2 md:border-b-0">
                  <span className="block text-concrete">Sheet</span>P-{pad(step + 1)} / {pad(process.length)}
                </span>
                <span className="border-b border-ink/25 p-2 md:border-b-0 md:border-r">
                  <span className="block text-concrete">Stage</span>
                  <span className="text-terra">{current.title}</span>
                </span>
                <span className="border-r border-ink/25 p-2">
                  <span className="block text-concrete">Scale</span>Illustrative
                </span>
                <span className="p-2">
                  <span className="block text-concrete">Studio</span>
                  {site.shortName}
                </span>
              </figcaption>
            </figure>

            <div className="mt-6 flex min-h-[5.5rem] items-start justify-between gap-6">
              <AnimatePresence mode="wait">
                <motion.ul
                  key={current.id}
                  className="flex flex-wrap gap-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5, ease: ease.out }}
                >
                  {current.notes.map((n) => (
                    <li key={n} className="label border border-ink/20 px-2 py-1 text-concrete">
                      {n}
                    </li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </div>

            {/* Small-screen stage copy */}
            <div className="lg:hidden" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="label text-terra">Stage {pad(step + 1)}</p>
                  <h3 className="mt-2 text-headline font-medium uppercase leading-[0.9] condensed">{current.title}</h3>
                  <p className="mt-2 font-serif text-title italic">{current.summary}</p>
                  <p className="mt-4 text-concrete">{current.detail}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
