"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type MouseEvent } from "react";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { Coordinates, DelhiClock } from "@/components/ui/Annotations";
import { site } from "@/config/site";
import { about } from "@/content/about";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { ease } from "@/lib/motion";
import { PlanDrawing } from "./PlanDrawing";

/**
 * 00 — Opening sheet. The studio's name set like the title of a drawing set,
 * over a generic plan that draws itself in. Typographic by intent: no stock
 * photograph stands in for the studio here.
 */
export function AboutHero() {
  const { hero } = about;
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollTo } = useSmoothScroll();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const drawingY = useTransform(scrollYProgress, [0, 1], ["0%", "-16%"]);
  const typeY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);

  const readOn = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("studio-profile");
    if (!target) return;
    e.preventDefault();
    scrollTo(target);
  };

  return (
    <section
      ref={ref}
      id="about"
      aria-labelledby="about-title"
      data-theme="dark"
      data-section-index="00"
      data-section-label="About"
      className="ink-grid relative flex min-h-[100svh] flex-col overflow-hidden bg-ink text-paper"
    >
      {/* — Drawing ——————————————————————————— */}
      {/* On wide screens its width is also capped by the viewport height, so it stays clear of the intro. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)+8rem)]">
        <div className="frame grid-12">
          <div className="col-span-12 sm:col-span-10 sm:col-start-3 md:col-span-7 md:col-start-6 xl:col-span-5 xl:col-start-8">
            <motion.div
              className="text-paper opacity-50 md:ml-auto md:w-[min(100%,calc((100svh_-_var(--header-h)_-_24rem)*1.375))] md:opacity-80"
              style={{ y: reduced ? 0 : drawingY }}
            >
              <PlanDrawing />
            </motion.div>
          </div>
        </div>
      </div>

      {/* — Top annotations ———————————————————— */}
      <div className="frame grid-12 relative pt-[calc(var(--header-h)+1.75rem)] md:pt-[calc(var(--header-h)+3rem)]">
        <div className="col-span-6 md:col-span-4">
          <motion.p
            className="label flex items-center gap-3 text-paper/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            <span aria-hidden className="h-px w-6 bg-terra" />
            {hero.kicker}
          </motion.p>
          <ul className="caps mt-4 space-y-1 text-paper/85">
            {hero.disciplines.map((d, i) => (
              <li key={d} className="line-mask">
                <motion.span
                  className="block"
                  initial={{ y: "125%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.2, ease: ease.out, delay: 1 + i * 0.08 }}
                >
                  {d}
                </motion.span>
              </li>
            ))}
          </ul>
        </div>
        <motion.div
          className="col-span-6 text-right md:col-span-3 md:col-start-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          <p className="label text-paper/60">Studio profile</p>
          <p className="mt-1 font-serif text-xl italic sm:text-2xl md:text-3xl">{site.tagline}</p>
        </motion.div>
      </div>

      {/* Keeps room for the drawing on short screens. */}
      <div className="min-h-[12rem] flex-1 md:min-h-[8rem]" />

      {/* — Title ———————————————————————————— */}
      <motion.div className="relative" style={{ y: reduced ? 0 : typeY }}>
        <div className="frame">
          <h1
            id="about-title"
            className="text-[min(16vw,24svh)] font-medium uppercase leading-[0.8] tracking-[-0.02em] condensed"
          >
            <span className="sr-only">About {site.name} — architecture and interior design studio, New Delhi</span>
            <span aria-hidden className="block">
              <span className="line-mask">
                <motion.span
                  className="block"
                  initial={{ y: "125%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.5, ease: ease.out, delay: 0.25 }}
                >
                  {hero.title[0]}
                </motion.span>
              </span>
              <span className="line-mask">
                <motion.span
                  className="block pl-[16.66%] font-serif font-normal normal-case italic tracking-[-0.01em] text-paper/85"
                  initial={{ y: "125%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.5, ease: ease.out, delay: 0.37 }}
                >
                  {hero.title[1]}
                </motion.span>
              </span>
            </span>
          </h1>
        </div>

        <div className="frame grid-12 mt-8 md:mt-6">
          <motion.p
            className="col-span-12 max-w-[34rem] text-pretty text-paper/75 sm:col-span-9 md:col-span-5 md:col-start-8 md:text-lg lg:col-span-4 lg:col-start-9"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: ease.out, delay: 0.9 }}
          >
            {hero.intro}
          </motion.p>
        </div>
      </motion.div>

      {/* — Foot of the sheet ————————————————————— */}
      <div className="frame relative pb-5 pt-8 md:pb-7 md:pt-10">
        <motion.span
          aria-hidden
          className="block h-px origin-left bg-paper/35"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.8, ease: ease.inOut, delay: 0.6 }}
        />
        <motion.div
          className="grid-12 label items-center pt-4 text-paper/75"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
        >
          <a href="#studio-profile" onClick={readOn} className="col-span-5 flex items-center gap-2 md:col-span-3">
            Read on
            <motion.span
              aria-hidden
              animate={reduced ? undefined : { y: [0, 4, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              ↓
            </motion.span>
          </a>
          <span className="col-span-7 text-right md:col-span-3 md:text-left">
            {site.city} / {site.country}
          </span>
          <Coordinates className="hidden md:col-span-3 md:block" />
          <DelhiClock className="hidden text-right md:col-span-3 md:block" />
        </motion.div>
      </div>
    </section>
  );
}
