"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { usePageTransition } from "@/components/providers/TransitionProvider";
import { Coordinates } from "@/components/ui/Annotations";
import { Img } from "@/components/ui/Img";
import { PlaceholderNote } from "@/components/ui/ParallaxImage";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { ease } from "@/lib/motion";
import type { Project } from "@/lib/types";
import { pad } from "@/lib/utils";

/**
 * Full-bleed opening image. It is pixel-identical to the image that expands
 * out of the project card, so the page transition lands seamlessly.
 */
export function ProjectHero({ project, number, total }: { project: Project; number: number; total: number }) {
  const ref = useRef<HTMLElement>(null);
  const { markHeroReady } = usePageTransition();
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const dim = useTransform(scrollYProgress, [0, 1], [0, 0.6]);

  return (
    <section
      ref={ref}
      data-theme="dark"
      className="relative h-[100svh] min-h-[560px] overflow-hidden bg-ink text-paper"
    >
      <motion.div className="absolute inset-0" style={{ y: reduced ? 0 : y }}>
        <Img
          asset={project.heroImage}
          fill
          priority
          sizes="100vw"
          className="tone object-cover"
          onLoad={markHeroReady}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink/60" />
        <motion.div className="absolute inset-0 bg-ink" style={{ opacity: dim }} />
      </motion.div>

      <div className="frame relative flex h-full flex-col justify-end pb-8 md:pb-12">
        <motion.p
          className="label flex items-center gap-3 text-paper/75"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <span>
            Project {pad(number)} / {pad(total)}
          </span>
          <span className="h-px w-8 bg-current opacity-50" />
          <span>{project.typology}</span>
        </motion.p>
        <h1 className="mt-4 font-serif text-[min(19vw,30svh)] leading-[0.82] tracking-[-0.02em]">
          <span className="line-mask">
            <motion.span
              className="block"
              initial={{ y: "125%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.4, ease: ease.out, delay: 0.35 }}
            >
              {project.title}
            </motion.span>
          </span>
        </h1>
        <motion.div
          className="label mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-paper/25 pt-4 text-paper/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <span>{project.category}</span>
          <Coordinates className="hidden md:inline" />
          <span>Scroll ↓</span>
        </motion.div>
      </div>
      <PlaceholderNote
        asset={project.heroImage}
        placement="right-[var(--gutter)] top-[calc(var(--header-h)+0.75rem)]"
      />
    </section>
  );
}
