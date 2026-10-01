"use client";

import { useRef } from "react";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { TransitionLink } from "@/components/ui/TransitionLink";
import type { Project } from "@/lib/types";
import { pad } from "@/lib/utils";

/**
 * Previous / next. The next project's image sits large at the foot of the
 * page; following it expands that image into the next project's hero.
 */
export function ProjectNav({
  previous,
  next,
  nextNumber,
  previousNumber,
}: {
  previous: Project;
  next: Project;
  nextNumber: number;
  previousNumber: number;
}) {
  const nextImage = useRef<HTMLDivElement>(null);

  return (
    <nav aria-label="More projects" data-theme="dark" className="bg-ink pb-10 pt-16 text-paper md:pt-24">
      <div className="frame label flex items-center justify-between border-b border-paper/15 pb-4 text-paper/60">
        <TransitionLink
          href={`/projects/${previous.slug}`}
          transitionLabel={previous.category}
          className="group flex items-center gap-3 hover:text-paper"
        >
          <span aria-hidden className="transition-transform duration-500 group-hover:-translate-x-1">
            ←
          </span>
          Previous project
          <span className="hidden text-paper/60 sm:inline">
            {pad(previousNumber)} {previous.title}
          </span>
        </TransitionLink>
        <TransitionLink href="/projects" transitionLabel="Index of work" className="hidden hover:text-paper md:block">
          All projects
        </TransitionLink>
      </div>

      <TransitionLink
        href={`/projects/${next.slug}`}
        imageRef={nextImage}
        image={next.heroImage}
        transitionLabel={next.category}
        data-cursor="project"
        data-cursor-label="Next"
        className="group mt-10 block"
      >
        <div className="frame flex items-end justify-between gap-6">
          <div>
            <p className="label text-paper/60">Next project — {pad(nextNumber)}</p>
            <p className="mt-3 font-serif text-display leading-[0.9] transition-[font-style] group-hover:italic">
              {next.title}
            </p>
          </div>
          <span aria-hidden className="mb-3 text-3xl transition-transform duration-500 group-hover:translate-x-2">
            →
          </span>
        </div>
        <div className="frame mt-8">
          <ParallaxImage
            ref={nextImage}
            asset={next.heroImage}
            sizes="100vw"
            className="h-[46svh] md:h-[62svh]"
            strength={0.12}
          />
        </div>
      </TransitionLink>
    </nav>
  );
}
