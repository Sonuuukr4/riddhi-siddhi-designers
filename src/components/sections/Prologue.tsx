"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useRef } from "react";
import { SectionHead } from "@/components/ui/Annotations";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { FadeIn } from "@/components/ui/Reveal";
import { ScrollWords } from "@/components/ui/ScrollWords";
import { img } from "@/content/images";
import { site } from "@/config/site";
import { studio } from "@/content/studio";

/**
 * 01 — Prologue. The concept of the site in one statement, then the
 * studio's facts set quietly beside a single image.
 */
export function Prologue() {
  const bandRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: bandRef, offset: ["start end", "end start"] });
  const left = useTransform(scrollYProgress, [0, 1], ["6%", "-14%"]);
  const right = useTransform(scrollYProgress, [0, 1], ["-10%", "8%"]);

  return (
    <section
      id="prologue"
      data-theme="light"
      data-section-index="01"
      data-section-label="Prologue"
      className="relative overflow-hidden bg-paper pb-24 pt-20 text-ink md:pb-36 md:pt-28"
    >
      <SectionHead index={1} label="Prologue" meta={studio.prologue.kicker} />
      <h2 className="sr-only">Prologue — space, form and light</h2>

      <div className="frame grid-12 mt-16 gap-y-14 md:mt-24">
        <div className="col-span-12 lg:col-span-9">
          <ScrollWords
            text={studio.prologue.lines.join(" ")}
            emphasis={["space", "light", "experience"]}
            className="font-serif text-headline leading-[1.02] tracking-[-0.01em]"
          />
        </div>

        <div className="col-span-12 grid grid-cols-12 gap-x-[var(--col-gap)] gap-y-10 lg:mt-10">
          <ParallaxImage
            asset={img.shadowPalm}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 40vw, 80vw"
            className="col-span-8 aspect-[4/5] md:col-span-5 lg:col-span-3"
          />
          <div className="col-span-12 flex flex-col justify-end gap-8 md:col-span-6 md:col-start-7 lg:col-span-4 lg:col-start-6">
            {studio.intro.map((p, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <p className={i === 0 ? "text-lede text-pretty" : "max-w-[34rem] text-pretty text-concrete"}>{p}</p>
              </FadeIn>
            ))}
          </div>
          <FadeIn
            delay={0.2}
            className="col-span-12 flex flex-row justify-between gap-6 self-end border-t border-ink/15 pt-4 md:col-span-6 md:col-start-7 lg:col-span-3 lg:col-start-10 lg:flex-col lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"
          >
            <div>
              <p className="label text-concrete">Rating</p>
              <p className="mt-1 text-title font-light">
                {site.rating.value}
                <span className="text-lede text-concrete"> / {site.rating.scale}</span>
              </p>
              <p className="label mt-1 text-concrete">{site.rating.source}</p>
            </div>
            <div className="text-right lg:text-left">
              <p className="label text-concrete">Studio</p>
              <p className="label mt-2 leading-relaxed">
                {site.address.short.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </p>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* SPACE / FORM / LIGHT — two lines drifting in opposite directions. */}
      <div ref={bandRef} aria-hidden className="mt-24 select-none whitespace-nowrap md:mt-36">
        <motion.p
          className="text-display font-medium uppercase leading-[0.86] condensed"
          style={{ x: reduced ? 0 : left }}
        >
          Space <span className="font-serif font-normal normal-case italic text-concrete">/</span> Form{" "}
          <span className="font-serif font-normal normal-case italic text-concrete">/</span> Light{" "}
          <span className="font-serif font-normal normal-case italic text-concrete">/</span> Material
        </motion.p>
        <motion.p
          className="text-display font-serif italic leading-[0.95] text-concrete/80"
          style={{ x: reduced ? 0 : right }}
        >
          function — experience — space — form — light
        </motion.p>
      </div>
    </section>
  );
}
