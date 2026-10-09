"use client";

import { useRef } from "react";
import { Img } from "@/components/ui/Img";
import { PlaceholderNote } from "@/components/ui/ParallaxImage";
import { TransitionLink } from "@/components/ui/TransitionLink";
import type { Project } from "@/lib/types";
import { cn, pad } from "@/lib/utils";

/**
 * Compositions cycle through the 12-column grid so the portfolio reads as a
 * sequence of spreads: a wide landscape, a tall portrait set low, a narrow
 * plate, a lowered landscape, then a full-width band.
 */
export const RHYTHM = [
  { span: "md:col-span-7", aspect: "aspect-[4/3]", sizes: "(min-width: 768px) 58vw, 100vw" },
  { span: "md:col-span-4 md:col-start-9 md:mt-28", aspect: "aspect-[3/4]", sizes: "(min-width: 768px) 33vw, 100vw" },
  { span: "md:col-span-5 md:col-start-2", aspect: "aspect-[4/5]", sizes: "(min-width: 768px) 42vw, 100vw" },
  { span: "md:col-span-5 md:col-start-8 md:mt-44", aspect: "aspect-[16/11]", sizes: "(min-width: 768px) 42vw, 100vw" },
  { span: "md:col-span-12", aspect: "aspect-[4/3] md:aspect-[21/9]", sizes: "100vw" },
] as const;

export function PortfolioCard({
  project,
  number,
  index,
  priority,
}: {
  project: Project;
  number: number;
  index: number;
  priority?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const layout = RHYTHM[index % RHYTHM.length];
  const href = `/projects/${project.slug}`;
  const facts = [project.category, project.location, project.year].filter(Boolean).join(" · ");

  return (
    <article className={cn("col-span-12", layout.span)}>
      <TransitionLink
        href={href}
        imageRef={frame}
        image={project.heroImage}
        transitionLabel={project.category}
        data-cursor="project"
        data-cursor-label={project.category}
        className="group block focus-visible:outline-offset-8"
        aria-label={`${project.title} — ${facts}`}
      >
        <div ref={frame} className={cn("relative overflow-hidden bg-paper-deep", layout.aspect)}>
          <Img
            asset={project.heroImage}
            fill
            sizes={layout.sizes}
            priority={priority}
            className="tone object-cover transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          />
          {/* Hover layer: the project's one-line summary, set like a caption on the drawing. */}
          <div className="pointer-events-none absolute inset-0 hidden flex-col justify-end bg-gradient-to-t from-ink/75 via-ink/15 to-transparent p-5 opacity-0 transition-opacity duration-700 group-hover:opacity-100 md:flex">
            {project.summary && (
              <p className="max-w-md translate-y-2 text-pretty text-paper transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-y-0">
                {project.summary}
              </p>
            )}
            <span className="label mt-3 text-paper/80">View project →</span>
          </div>
          <PlaceholderNote asset={project.heroImage} />
        </div>

        <div className="mt-4 grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-3">
          <span className="label text-concrete">{pad(number)}</span>
          <div className="min-w-0">
            <h3 className="font-serif text-title leading-[1.02] transition-[font-style] group-hover:italic">
              {project.title}
            </h3>
            <p className="label mt-2 text-concrete">{facts}</p>
          </div>
          <span className="label hidden text-right text-concrete sm:block">
            {project.status ?? ""}
          </span>
        </div>
      </TransitionLink>
    </article>
  );
}
