import Image from "next/image";
import { RegMark, SectionHead } from "@/components/ui/Annotations";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { FadeIn, RevealLines } from "@/components/ui/Reveal";
import { site } from "@/config/site";
import { about } from "@/content/about";
import { ABOUT_SECTION_TOTAL } from "./sheet";

/**
 * 02 — Leadership. The studio's own photograph, set large and asymmetric
 * like a plate in a monograph: a figure number and dimension line in the
 * margin, the name across from it, the biography settling to its foot.
 *
 * The portrait is real — never cropped tighter, filtered heavily or marked
 * as representative.
 */
export function AboutLeadership() {
  const { leader } = about;
  const [first, ...rest] = leader.name.split(" ");

  return (
    <section
      id="leadership"
      aria-labelledby="leadership-title"
      data-theme="light"
      data-section-index="02"
      data-section-label="Leadership"
      className="relative overflow-hidden bg-paper-deep pb-28 pt-20 text-ink md:pb-40 md:pt-28"
    >
      <SectionHead index={2} total={ABOUT_SECTION_TOTAL} label="Leadership" meta={leader.role} />

      <div className="frame grid-12 mt-14 gap-y-10 md:mt-20 md:grid-rows-[auto_1fr] md:gap-y-12 lg:mt-24">
        {/* Name */}
        <div className="col-span-12 md:col-span-5 md:col-start-8 md:row-start-1">
          <FadeIn as="p" className="label flex items-center gap-3 text-concrete">
            <span aria-hidden className="h-px w-8 bg-terra" />
            {leader.role}
          </FadeIn>
          {/* Sized in the heading's own em, so the signature scales with the name at every breakpoint. */}
          <div className="relative mt-5 pb-[0.85em] text-display md:mt-8 md:pb-[0.45em]">
            <h2 id="leadership-title" className="font-medium uppercase leading-[0.84] condensed">
              <RevealLines
                lines={[
                  first,
                  ...(rest.length
                    ? [
                        <span key="rest" className="font-serif font-normal normal-case italic tracking-[-0.01em]">
                          {rest.join(" ")}
                        </span>,
                      ]
                    : []),
                ]}
              />
            </h2>
            {/* Neeraj Ji's own handwritten signature, signed beside the name like a plate in a monograph. */}
            <FadeIn
              delay={0.35}
              className="pointer-events-none absolute left-[0.85em] top-[0.95em] w-[2.6em] md:w-[1.9em]"
            >
              <Image
                src="/images/neeraj-signature.png"
                alt={`Signature of ${leader.name}`}
                width={1403}
                height={870}
                sizes="(min-width: 768px) 20vw, 40vw"
                className="h-auto w-full object-contain"
              />
            </FadeIn>
          </div>
        </div>

        {/* Portrait */}
        <figure className="col-span-12 md:col-span-7 md:col-start-1 md:row-span-2 md:row-start-1 lg:col-span-6">
          <div className="flex gap-3 md:gap-4">
            <div className="relative min-w-0 flex-1">
              <ParallaxImage
                asset={leader.portrait}
                sizes="(min-width: 1024px) 46vw, (min-width: 768px) 54vw, 88vw"
                strength={0.03}
                className="aspect-[4/5]"
              />
              <RegMark className="absolute -left-2 -top-2 text-ink/50" />
              <RegMark className="absolute -right-2 -top-2 text-ink/50" />
              <RegMark className="absolute -bottom-2 -left-2 text-ink/50" />
              <RegMark className="absolute -bottom-2 -right-2 text-ink/50" />
            </div>
            {/* Dimension line and figure number in the margin */}
            <div aria-hidden className="flex w-5 shrink-0 flex-col items-center md:w-7">
              <span className="h-px w-3 bg-ink/40" />
              <span className="w-px flex-1 bg-ink/25" />
              <span className="label my-3 rotate-180 whitespace-nowrap text-concrete [writing-mode:vertical-rl]">
                Fig. 02 — {leader.role}
              </span>
              <span className="w-px flex-1 bg-ink/25" />
              <span className="h-px w-3 bg-ink/40" />
            </div>
          </div>
          <figcaption className="label mr-8 mt-4 flex flex-wrap justify-between gap-x-6 gap-y-1 border-t border-ink/15 pt-3 text-concrete md:mr-11">
            <span>{leader.name}</span>
            <span>
              {site.name}, {site.city}
            </span>
          </figcaption>
        </figure>

        {/* Biography */}
        <div className="col-span-12 md:col-span-5 md:col-start-8 md:row-start-2 md:self-end">
          {/* Shown until the studio approves the text — set leader.draft to false in src/content/about.ts. */}
          {leader.draft && site.showPlaceholderNotices && (
            <p className="label mb-6 inline-flex items-center gap-2 border border-dashed border-terra/60 px-2.5 py-1.5 text-terra">
              <span aria-hidden className="size-1.5 rounded-full bg-terra" />
              Draft biography — client approval required
            </p>
          )}
          {leader.biography.map((p, i) => (
            <FadeIn key={i} delay={i * 0.08} className={i === 0 ? undefined : "mt-5"}>
              <p className={i === 0 ? "font-serif text-lede text-pretty" : "max-w-[34rem] text-pretty text-concrete"}>
                {p}
              </p>
            </FadeIn>
          ))}
          <FadeIn delay={0.2}>
            <dl className="mt-10 border-t border-ink/15">
              {leader.notes.map((n) => (
                <div key={n.term} className="label flex justify-between gap-6 border-b border-ink/15 py-3">
                  <dt className="text-concrete">{n.term}</dt>
                  <dd className="text-right">{n.value}</dd>
                </div>
              ))}
            </dl>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
