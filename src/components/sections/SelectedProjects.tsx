"use client";

import { useRef } from "react";
import { ProjectSpread, type SpreadVariant } from "@/components/project/ProjectSpread";
import { useUI } from "@/components/providers/UIProvider";
import { SectionHead } from "@/components/ui/Annotations";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { FadeIn, RevealLines } from "@/components/ui/Reveal";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { projects } from "@/content/projects";
import type { Project } from "@/lib/types";
import { cn, pad } from "@/lib/utils";

const variants: SpreadVariant[] = ["full", "split", "bleed", "diptych"];

/** 02 — Projects. The heart of the site: four spreads, then the rest of the index. */
export function SelectedProjects() {
  const { open } = useUI();
  const featured = projects.slice(0, variants.length);
  const further = projects.slice(variants.length);

  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      data-theme="light"
      data-section-index="02"
      data-section-label="Projects"
      className="relative bg-paper pb-28 pt-20 text-ink md:pb-40 md:pt-28"
    >
      <SectionHead index={2} label="Projects" meta={`Selected work — ${pad(projects.length)} entries`} />

      <div className="frame grid-12 mt-14 items-end gap-y-8 md:mt-20">
        <h2 id="projects-title" className="col-span-12 text-display font-medium uppercase condensed md:col-span-8">
          <RevealLines
            lines={[
              "Spaces",
              <span key="i" className="font-serif font-normal normal-case italic">
                with intent.
              </span>,
            ]}
          />
        </h2>
        <FadeIn className="col-span-12 flex flex-col items-start gap-5 md:col-span-3 md:col-start-10 md:items-end md:text-right">
          <p className="text-concrete">
            Residential, commercial, hospitality, interior, retail and visualization — each entry structured as a full
            project record.
          </p>
          <button
            type="button"
            onClick={() => open("index")}
            className="caps flex items-center gap-2 border-b border-current pb-1"
          >
            Open index ({pad(projects.length)}) →
          </button>
        </FadeIn>
      </div>

      <div className="mt-24 flex flex-col gap-32 md:mt-36 md:gap-48">
        {featured.map((p, i) => (
          <ProjectSpread key={p.slug} project={p} number={i + 1} variant={variants[i]} />
        ))}
      </div>

      {further.length > 0 && (
        <div className="frame mt-32 md:mt-48">
          <div className="label mb-8 flex justify-between border-b border-ink/15 pb-3 text-concrete">
            <span>Further entries</span>
            <span>
              {pad(variants.length + 1)} — {pad(projects.length)}
            </span>
          </div>
          <div className="grid-12 gap-y-16">
            {further.map((p, i) => (
              <FurtherEntry key={p.slug} project={p} number={variants.length + i + 1} offset={i % 2 === 1} />
            ))}
          </div>
          <FadeIn className="mt-20 flex flex-wrap items-center justify-between gap-6 border-t border-ink/15 pt-6">
            <p className="font-serif text-title italic">The complete index of work.</p>
            <TransitionLink
              href="/projects"
              transitionLabel="Index of work"
              className="caps group flex items-center gap-3"
            >
              All projects
              <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </TransitionLink>
          </FadeIn>
        </div>
      )}
    </section>
  );
}

function FurtherEntry({ project, number, offset }: { project: Project; number: number; offset: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const href = `/projects/${project.slug}`;
  return (
    <article className={cn("col-span-12 md:col-span-5", offset ? "md:col-start-8 md:mt-40" : "md:col-start-1")}>
      <TransitionLink
        href={href}
        imageRef={ref}
        image={project.heroImage}
        transitionLabel={project.category}
        data-cursor="project"
        data-cursor-label={project.category}
        className="group block"
      >
        <ParallaxImage
          ref={ref}
          asset={project.heroImage}
          sizes="(min-width: 768px) 40vw, 100vw"
          className={offset ? "aspect-[4/5]" : "aspect-[5/4]"}
        />
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <p className="label text-concrete">
              Project {pad(number)} — {project.category}
            </p>
            <h3 className="mt-2 font-serif text-title transition-[font-style] group-hover:italic">{project.title}</h3>
          </div>
          <span aria-hidden className="mt-6 text-xl transition-transform duration-500 group-hover:translate-x-1">
            →
          </span>
        </div>
      </TransitionLink>
    </article>
  );
}
