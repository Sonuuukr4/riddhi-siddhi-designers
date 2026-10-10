"use client";

import { useRef, type ReactNode } from "react";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { FadeIn, RevealLines, Rule } from "@/components/ui/Reveal";
import { TransitionLink } from "@/components/ui/TransitionLink";
import type { ImageAsset, Project } from "@/lib/types";
import { cn, pad } from "@/lib/utils";
import { ProjectMeta } from "./ProjectMeta";

export type SpreadVariant = "full" | "split" | "bleed" | "diptych";

type SpreadProps = { project: Project; number: number; variant: SpreadVariant };

/**
 * One project, composed like a magazine spread. Four compositions rotate
 * through the list so the rhythm never settles into a grid.
 */
export function ProjectSpread({ project, number, variant }: SpreadProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const href = `/projects/${project.slug}`;
  const secondary = project.gallery[0] as ImageAsset | undefined;

  /** The hero image, clickable, expanding into the project page. */
  const heroImage = (className: string, sizes: string, strength?: number, imageClassName?: string, notePlacement?: string) => (
    <TransitionLink
      href={href}
      imageRef={heroRef}
      image={project.heroImage}
      transitionLabel={project.category}
      tabIndex={-1}
      aria-hidden
      data-cursor="project"
      data-cursor-label={project.category}
      className="block"
    >
      <ParallaxImage
        ref={heroRef}
        asset={project.heroImage}
        sizes={sizes}
        className={className}
        imageClassName={imageClassName}
        strength={strength}
        notePlacement={notePlacement}
      />
    </TransitionLink>
  );

  const kicker = (
    <p className="label flex items-center gap-3">
      <span>Project {pad(number)}</span>
      <span className="h-px w-8 bg-current opacity-40" />
      <span>{project.category}</span>
    </p>
  );

  const title = (className?: string) => (
    <h3 className={cn("font-serif text-display leading-[0.9] tracking-[-0.02em]", className)}>
      <TransitionLink
        href={href}
        transitionLabel={project.category}
        className="group inline-block focus-visible:outline-offset-8"
      >
        <RevealLines lines={[project.title]} lineClassName="transition-[font-style] group-hover:italic" />
      </TransitionLink>
    </h3>
  );

  const more = (
    <TransitionLink
      href={href}
      imageRef={heroRef}
      image={project.heroImage}
      transitionLabel={project.category}
      className="caps group inline-flex items-center gap-3 border-b border-current pb-1"
    >
      View project
      <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
        →
      </span>
    </TransitionLink>
  );

  const layouts: Record<SpreadVariant, ReactNode> = {
    /* 01 — Edge-to-edge image, title and facts set beneath on the grid. */
    full: (
      <>
        <div className="frame mb-5">{kicker}</div>
        {heroImage("h-[68svh] md:h-[88svh]", "100vw", 0.1)}
        <div className="frame grid-12 mt-8 gap-y-8 md:mt-10">
          <span
            aria-hidden
            className="col-span-2 hidden text-headline font-light leading-none text-stone condensed md:block"
          >
            {pad(number)}
          </span>
          <div className="col-span-12 md:col-span-6 md:col-start-4">
            {title()}
            <FadeIn className="mt-5 max-w-md text-lede text-concrete">{project.summary}</FadeIn>
          </div>
          <FadeIn className="col-span-12 flex flex-col gap-8 md:col-span-3 md:col-start-10 md:pt-3" delay={0.15}>
            <ProjectMeta project={project} />
            <div>{more}</div>
          </FadeIn>
        </div>
      </>
    ),

    /* 02 — Text left, tall portrait right, a second image overlapping the seam. */
    split: (
      <div className="frame grid-12 gap-y-10">
        <div className="relative z-10 col-span-12 flex flex-col justify-between gap-10 md:col-span-5 md:pb-16">
          <div>
            {kicker}
            <div className="mt-6">{title()}</div>
          </div>
          <FadeIn className="flex flex-col gap-8">
            <p className="max-w-sm text-lede text-concrete">{project.summary}</p>
            <ProjectMeta project={project} />
            <div>{more}</div>
          </FadeIn>
        </div>
        <div className="relative col-span-12 md:col-span-6 md:col-start-7">
          {heroImage("aspect-[4/5] w-full", "(min-width: 768px) 50vw, 100vw", 0.08)}
          {secondary && (
            <div className="absolute -bottom-16 -left-[22%] hidden w-[48%] shadow-[0_0_0_10px_var(--color-paper)] md:block">
              <ParallaxImage
                asset={secondary}
                sizes="(min-width: 768px) 25vw, 50vw"
                strength={0.04}
                className="aspect-[4/3]"
              />
            </div>
          )}
        </div>
      </div>
    ),

    /* 03 — Image bleeding off the left edge; title crosses its boundary. */
    bleed: (
      <div className="grid-12 relative gap-y-8 pr-[var(--gutter)]">
        <div className="order-1 col-span-12 md:order-none md:col-span-8">
          {heroImage("aspect-[4/3] md:aspect-[16/11] w-full", "(min-width: 768px) 70vw, 100vw", 0.1, "tone-mute", "top-2 right-2")}
        </div>
        <div className="order-3 col-span-12 flex flex-col gap-8 pl-[var(--gutter)] md:order-none md:col-span-4 md:pl-0">
          <FadeIn className="flex flex-col gap-6">
            {kicker}
            <ProjectMeta project={project} />
          </FadeIn>
          <FadeIn className="flex flex-col gap-6" delay={0.1}>
            <p className="max-w-xs text-lede text-concrete">{project.summary}</p>
            <div>{more}</div>
          </FadeIn>
        </div>
        {/* The title straddles the image edge; difference blending keeps it legible on both. */}
        <div className="pointer-events-none order-2 col-span-12 pl-[var(--gutter)] md:absolute md:bottom-[4%] md:left-[38%] md:order-none md:pl-0 md:text-paper md:mix-blend-difference">
          <div className="pointer-events-auto">{title("md:text-mega md:leading-[0.8]")}</div>
        </div>
      </div>
    ),

    /* 04 — Diptych: portrait and landscape at different heights. */
    diptych: (
      <div className="frame">
        <div className="mb-8 flex items-end justify-between gap-6">
          {kicker}
          <span className="label hidden text-concrete md:block">{project.typology}</span>
        </div>
        <div className="grid-12 items-end gap-y-6">
          <div className="col-span-12 md:col-span-5 md:col-start-2">
            {heroImage("aspect-[3/4] w-full", "(min-width: 768px) 40vw, 100vw", 0.06)}
          </div>
          {secondary && (
            <div className="col-span-8 col-start-5 md:col-span-4 md:col-start-8 md:mb-24">
              <ParallaxImage
                asset={secondary}
                sizes="(min-width: 768px) 33vw, 66vw"
                className="aspect-[4/3] w-full"
                strength={0.05}
              />
            </div>
          )}
        </div>
        <Rule className="mt-10" />
        <div className="grid-12 mt-8 gap-y-8">
          <div className="col-span-12 md:col-span-7">{title()}</div>
          <FadeIn className="col-span-12 flex flex-col gap-8 md:col-span-4 md:col-start-9">
            <p className="text-lede text-concrete">{project.summary}</p>
            <ProjectMeta project={project} />
            <div>{more}</div>
          </FadeIn>
        </div>
      </div>
    ),
  };

  return (
    <article aria-labelledby={`project-${project.slug}`} className="relative">
      <span id={`project-${project.slug}`} className="sr-only">
        Project {pad(number)}: {project.title}, {project.category}
      </span>
      {layouts[variant]}
    </article>
  );
}
