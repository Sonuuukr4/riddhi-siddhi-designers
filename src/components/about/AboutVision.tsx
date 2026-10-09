import type { CSSProperties } from "react";
import { SectionHead } from "@/components/ui/Annotations";
import { FadeIn, Rule } from "@/components/ui/Reveal";
import { ScrollWords } from "@/components/ui/ScrollWords";
import { about } from "@/content/about";
import { pad } from "@/lib/utils";
import { ABOUT_SECTION_TOTAL } from "./sheet";

/**
 * 03 — Vision. One sentence, read at the pace of the reader's scroll, then
 * the three things every space is asked to answer to.
 */
export function AboutVision() {
  const { vision } = about;

  return (
    <section
      id="vision"
      aria-labelledby="vision-title"
      data-theme="dark"
      data-section-index="03"
      data-section-label="Vision"
      className="relative overflow-hidden bg-ink pb-28 pt-20 text-paper md:pb-40 md:pt-28"
    >
      {/* Oversized outline word, set like a watermark on the sheet. */}
      <p
        aria-hidden
        className="text-outline pointer-events-none absolute -bottom-[0.1em] right-[-0.03em] select-none whitespace-nowrap text-[clamp(7rem,30vw,30rem)] font-medium uppercase leading-[0.8] condensed"
        style={{ "--outline-color": "rgb(238 234 227 / 0.07)" } as CSSProperties}
      >
        Vision
      </p>

      <SectionHead
        index={3}
        total={ABOUT_SECTION_TOTAL}
        label={vision.label}
        meta="People / Context / Purpose"
        className="relative"
      />

      <div className="frame grid-12 relative mt-14 gap-y-8 md:mt-24">
        <h2 id="vision-title" className="label col-span-12 flex items-center gap-3 text-paper/60 md:col-span-2 md:pt-4">
          <span aria-hidden className="h-px w-6 bg-terra" />
          {vision.label}
        </h2>
        <div className="col-span-12 md:col-span-10 lg:col-span-9">
          <ScrollWords
            text={vision.statement}
            emphasis={vision.emphasis}
            className="font-serif text-headline leading-[1.04] tracking-[-0.01em]"
          />
        </div>
      </div>

      <ol className="frame grid-12 relative mt-20 gap-y-12 md:mt-32">
        {vision.responds.map((r, i) => (
          <FadeIn as="li" key={r.id} delay={i * 0.1} className="col-span-12 md:col-span-4">
            <Rule delay={i * 0.1} />
            <p className="label mt-4 text-paper/60">Responds to — {pad(i + 1)}</p>
            <h3 className="mt-3 font-serif text-title italic">{r.title}</h3>
            <p className="mt-3 max-w-sm text-pretty text-paper/65">{r.text}</p>
          </FadeIn>
        ))}
      </ol>
    </section>
  );
}
