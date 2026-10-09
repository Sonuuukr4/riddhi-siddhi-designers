import { Img } from "@/components/ui/Img";
import { site } from "@/config/site";
import type { Drawing } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A drawing sheet with a title block. Until a real drawing is supplied the
 * sheet stays blank — framed, labelled and clearly awaiting its drawing —
 * rather than showing an invented plan.
 */
export function DrawingPlate({
  drawing,
  projectTitle,
  className,
}: {
  drawing: Drawing;
  projectTitle: string;
  className?: string;
}) {
  return (
    <figure className={cn("flex flex-col border border-ink/25 bg-bone p-3", className)}>
      <div className="paper-grid relative aspect-[4/3] w-full border border-ink/15">
        {drawing.image ? (
          <Img asset={drawing.image} fill sizes="(min-width: 768px) 40vw, 85vw" className="object-contain p-4" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-concrete">
            <svg
              aria-hidden
              viewBox="0 0 40 40"
              className="size-10"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
            >
              <rect x="4" y="4" width="32" height="32" strokeDasharray="2 2" />
              <path d="M4 4l32 32M36 4L4 36" strokeOpacity="0.4" />
            </svg>
            <span className="label">Drawing to be added</span>
          </div>
        )}
      </div>
      <figcaption className="label mt-3 grid grid-cols-[1fr_auto] border border-ink/25 text-[0.625rem]">
        <span className="border-b border-r border-ink/25 p-2">
          <span className="block text-concrete">Title</span>
          {drawing.title}
        </span>
        <span className="border-b border-ink/25 p-2">
          <span className="block text-concrete">Sheet</span>
          {drawing.sheet}
        </span>
        <span className="border-r border-ink/25 p-2">
          <span className="block text-concrete">Project</span>
          {projectTitle}
        </span>
        <span className="p-2">
          <span className="block text-concrete">Studio</span>
          {site.shortName}
        </span>
      </figcaption>
    </figure>
  );
}
