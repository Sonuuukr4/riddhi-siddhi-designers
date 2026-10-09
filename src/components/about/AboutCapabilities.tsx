"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { RegMark, SectionHead } from "@/components/ui/Annotations";
import { Img } from "@/components/ui/Img";
import { PlaceholderNote } from "@/components/ui/ParallaxImage";
import { FadeIn, RevealLines } from "@/components/ui/Reveal";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { about } from "@/content/about";
import { ease } from "@/lib/motion";
import type { ImageAsset } from "@/lib/types";
import { cn, pad } from "@/lib/utils";
import { ABOUT_SECTION_TOTAL } from "./sheet";

/**
 * 06 — Studio capabilities. The home page's Expertise index, set on paper:
 * the row at the centre of the viewport (or under the pointer) comes into
 * full ink and its image opens in the fixed frame alongside.
 */
export function AboutCapabilities() {
  const { capabilities } = about;
  const { items, more } = capabilities;
  const [active, setActive] = useState(0);
  const rows = useRef<Array<HTMLLIElement | null>>([]);
  const current = items[active];

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
      id="capabilities"
      aria-labelledby="capabilities-title"
      data-theme="light"
      data-section-index="06"
      data-section-label="Capabilities"
      className="paper-grid relative bg-paper pb-28 pt-20 text-ink md:pb-40 md:pt-28"
    >
      <SectionHead
        index={6}
        total={ABOUT_SECTION_TOTAL}
        label={capabilities.label}
        meta={`${pad(items.length)} capabilities`}
      />

      <div className="frame grid-12 mt-14 gap-y-8 md:mt-20">
        <h2 id="capabilities-title" className="col-span-12 text-display font-medium uppercase condensed md:col-span-9">
          <RevealLines
            lines={[
              capabilities.heading[0],
              <span key="s" className="font-serif font-normal normal-case italic text-ink/80">
                {capabilities.heading[1]}
              </span>,
            ]}
          />
        </h2>
        <FadeIn className="col-span-12 self-end text-pretty text-concrete md:col-span-3">{capabilities.intro}</FadeIn>
      </div>

      <div className="frame grid-12 mt-16 md:mt-24">
        {/* Index */}
        <ol className="col-span-12 border-t border-ink/15 lg:col-span-7">
          {items.map((item, i) => {
            const on = i === active;
            return (
              <li
                key={item.id}
                ref={(el) => {
                  rows.current[i] = el;
                }}
                data-i={i}
                onMouseEnter={() => setActive(i)}
                className="border-b border-ink/15"
              >
                {/* Phones give the title the full measure; the group and thumbnail sit beneath it. */}
                <div className="grid grid-cols-[2.25rem_1fr] gap-x-4 py-5 md:grid-cols-[3.5rem_1fr_auto] md:py-7">
                  <span className={cn("label pt-2 transition-colors duration-700", on ? "text-ink" : "text-concrete")}>
                    {pad(i + 1)}
                  </span>
                  <div className="min-w-0">
                    <h3
                      className={cn(
                        "text-headline font-medium uppercase leading-[0.9] transition-colors duration-700 condensed",
                        on ? "text-ink" : "text-ink/30",
                      )}
                    >
                      {item.title}
                    </h3>
                    <div className="mt-3 flex items-start justify-between gap-5">
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "max-w-lg text-pretty transition-colors duration-700",
                            on ? "text-ink/80" : "text-concrete",
                          )}
                        >
                          {item.description}
                        </p>
                        <span className="label mt-3 block text-concrete md:hidden">{item.group}</span>
                      </div>
                      <Thumb asset={item.image} className="md:hidden" />
                    </div>
                  </div>
                  <div className="hidden flex-col items-end gap-3 md:flex">
                    <span className="label text-concrete">{item.group}</span>
                    <Thumb asset={item.image} className="lg:hidden" />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Fixed frame (desktop) */}
        <div className="relative col-span-4 col-start-9 hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+3rem)]">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper-deep">
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
                    <Img asset={current.image} fill sizes="30vw" className="tone object-cover" />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
              <PlaceholderNote asset={current.image} />
              <RegMark className="absolute left-2 top-2 text-paper/70" />
              <RegMark className="absolute right-2 top-2 text-paper/70" />
            </div>
            <div className="label mt-3 flex justify-between gap-4 text-concrete">
              <span>
                Fig. 06.{pad(active + 1)} — {current.title}
              </span>
              <span>{current.group}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="frame mt-12 flex justify-start md:mt-16 lg:justify-end">
        <TransitionLink
          href={more.href}
          transitionLabel={more.transitionLabel}
          className="caps group inline-flex items-center gap-2 border-b border-ink/40 pb-1 transition-colors hover:border-ink"
        >
          {more.label}
          <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
            →
          </span>
        </TransitionLink>
      </div>
    </section>
  );
}

/** Small image beside a row where the fixed frame is not shown. */
function Thumb({ asset, className }: { asset: ImageAsset; className?: string }) {
  return (
    <span className={cn("relative block aspect-square w-14 shrink-0 overflow-hidden bg-paper-deep", className)}>
      <Img asset={asset} alt="" fill sizes="56px" className="tone object-cover" />
    </span>
  );
}
