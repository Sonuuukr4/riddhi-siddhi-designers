"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { RegMark, SectionHead } from "@/components/ui/Annotations";
import { Img } from "@/components/ui/Img";
import { PlaceholderNote } from "@/components/ui/ParallaxImage";
import { FadeIn, RevealLines } from "@/components/ui/Reveal";
import { expertise } from "@/content/expertise";
import { ease } from "@/lib/motion";
import { cn, pad } from "@/lib/utils";

/**
 * 03 — Expertise. Eleven services set as a typographic index. The row at the
 * centre of the viewport (or under the pointer) comes into full light and its
 * image appears in the fixed frame alongside.
 */
export function Expertise() {
  const [active, setActive] = useState(0);
  const rows = useRef<Array<HTMLLIElement | null>>([]);
  const current = expertise[active];

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
      id="expertise"
      aria-labelledby="expertise-title"
      data-theme="dark"
      data-section-index="03"
      data-section-label="Expertise"
      className="ink-grid relative bg-ink pb-28 pt-20 text-paper md:pb-40 md:pt-28"
    >
      <SectionHead index={3} label="Expertise" meta={`${expertise.length} disciplines & typologies`} />

      <div className="frame grid-12 mt-14 gap-y-8 md:mt-20">
        <h2 id="expertise-title" className="col-span-12 text-display font-medium uppercase condensed md:col-span-9">
          <RevealLines
            lines={[
              "From the plan",
              <span key="s" className="font-serif font-normal normal-case italic text-paper/80">
                to the permit.
              </span>,
            ]}
          />
        </h2>
        <FadeIn className="col-span-12 self-end text-paper/65 md:col-span-3">
          Architecture and interiors across every scale — with the visualization, MCD work, licensing and Vastu
          considerations that carry a design through to reality.
        </FadeIn>
      </div>

      <div className="frame grid-12 mt-16 md:mt-24">
        {/* Fixed frame (desktop) */}
        <div className="relative col-span-4 hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+3rem)]">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-graphite">
              <AnimatePresence initial={false}>
                <motion.div
                  key={current.id}
                  className="absolute inset-0"
                  initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
                  animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                  exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.5 } }}
                  transition={{ duration: 0.9, ease: ease.inOut }}
                >
                  <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.18 }}
                    animate={{ scale: 1.02 }}
                    transition={{ duration: 1.6, ease: ease.out }}
                  >
                    <Img asset={current.image} fill sizes="34vw" className="tone object-cover" />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
              <PlaceholderNote asset={current.image} />
              <RegMark className="absolute left-2 top-2 text-paper/60" />
              <RegMark className="absolute right-2 top-2 text-paper/60" />
            </div>
            <div className="label mt-3 flex justify-between text-paper/60">
              <span>
                Fig. {pad(active + 1)} — {current.title}
              </span>
              <span>{current.group}</span>
            </div>
          </div>
        </div>

        {/* Index */}
        <ol className="col-span-12 border-t border-paper/15 lg:col-span-7 lg:col-start-6">
          {expertise.map((item, i) => {
            const on = i === active;
            return (
              <li
                key={item.id}
                ref={(el) => {
                  rows.current[i] = el;
                }}
                data-i={i}
                onMouseEnter={() => setActive(i)}
                className="group border-b border-paper/15"
              >
                <div className="grid grid-cols-[2.25rem_1fr_auto] gap-x-4 py-5 md:grid-cols-[3.5rem_1fr_auto] md:py-7">
                  <span
                    className={cn("label pt-2 transition-colors duration-700", on ? "text-paper" : "text-paper/60")}
                  >
                    {pad(i + 1)}
                  </span>
                  <div className="min-w-0">
                    <h3
                      className={cn(
                        // Scales with the screen on phones so the longest word (ARCHITECTURE) clears the tag column.
                        "text-[clamp(1.75rem,8.2vw,2.5rem)] font-medium uppercase leading-[0.9] transition-colors duration-700 condensed sm:text-headline",
                        on ? "text-paper" : "text-paper/30",
                      )}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={cn(
                        "mt-3 max-w-lg text-pretty transition-colors duration-700",
                        on ? "text-paper/80" : "text-paper/60",
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={cn("label transition-colors duration-700", on ? "text-paper/75" : "text-paper/60")}
                    >
                      {item.group}
                    </span>
                    <span className="relative block aspect-square w-14 overflow-hidden lg:hidden">
                      <Img asset={item.image} alt="" fill sizes="56px" className="tone object-cover" />
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
