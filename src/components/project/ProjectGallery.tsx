import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { FadeIn } from "@/components/ui/Reveal";
import type { GalleryItem } from "@/lib/types";
import { pad } from "@/lib/utils";

/**
 * Gallery composed from layout hints in the data, so a project can be
 * re-art-directed by editing src/content/projects.ts alone.
 */
export function ProjectGallery({ items }: { items: GalleryItem[] }) {
  return (
    <div className="flex flex-col gap-20 md:gap-32">
      {items.map((item, i) => (
        <GalleryRow key={`${item.src}-${i}`} item={item} index={i} />
      ))}
    </div>
  );
}

function Caption({ index, text }: { index: number; text?: string }) {
  return (
    <FadeIn className="label mt-3 flex justify-between text-concrete">
      <span>Fig. {pad(index + 1)}</span>
      {text && <span>{text}</span>}
    </FadeIn>
  );
}

function GalleryRow({ item, index }: { item: GalleryItem; index: number }) {
  switch (item.layout) {
    case "full":
      return (
        <figure>
          <ParallaxImage asset={item} sizes="100vw" className="h-[70svh] md:h-[92svh]" strength={0.1} />
          <div className="frame">
            <Caption index={index} text={item.caption} />
          </div>
        </figure>
      );
    case "wide":
      return (
        <figure className="frame grid-12">
          <div className="col-span-12 md:col-span-10 md:col-start-2">
            <ParallaxImage asset={item} sizes="(min-width: 768px) 80vw, 100vw" className="aspect-[16/9]" />
            <Caption index={index} text={item.caption} />
          </div>
        </figure>
      );
    case "portrait":
      return (
        <figure className="frame grid-12">
          <div className="col-span-10 md:col-span-5 md:col-start-7">
            <ParallaxImage asset={item} sizes="(min-width: 768px) 40vw, 85vw" className="aspect-[4/5]" />
            <Caption index={index} text={item.caption} />
          </div>
        </figure>
      );
    case "offset":
      return (
        <figure className="frame grid-12">
          <div className="col-span-12 md:col-span-7 md:col-start-2">
            <ParallaxImage asset={item} sizes="(min-width: 768px) 58vw, 100vw" className="aspect-[4/3]" />
            <Caption index={index} text={item.caption} />
          </div>
        </figure>
      );
    case "pair":
      return (
        <figure className="frame grid-12 items-end gap-y-6">
          <div className="col-span-12 md:col-span-6">
            <ParallaxImage asset={item} sizes="(min-width: 768px) 48vw, 100vw" className="aspect-[4/5]" />
          </div>
          {item.pairWith && (
            <div className="col-span-9 col-start-4 md:col-span-5 md:col-start-8">
              <ParallaxImage asset={item.pairWith} sizes="(min-width: 768px) 40vw, 75vw" className="aspect-[4/3]" />
            </div>
          )}
          <div className="col-span-12">
            {/* One caption for the pair, so neither image loses its title. */}
            <Caption index={index} text={[item.caption, item.pairWith?.caption].filter(Boolean).join(" / ") || undefined} />
          </div>
        </figure>
      );
  }
}
