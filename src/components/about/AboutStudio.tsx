import { Coordinates, RegMark, SectionHead } from "@/components/ui/Annotations";
import { FadeIn, RevealLines } from "@/components/ui/Reveal";
import { site } from "@/config/site";
import { about } from "@/content/about";
import { cn, pad } from "@/lib/utils";
import { ABOUT_SECTION_TOTAL } from "./sheet";

/**
 * 01 — The studio. What the practice is and does, in plain terms, with the
 * same facts set out alongside as a drawing-sheet schedule.
 */
export function AboutStudio() {
  const { studio } = about;
  const last = studio.heading.length - 1;

  return (
    <section
      id="studio-profile"
      aria-labelledby="studio-profile-title"
      data-theme="light"
      data-section-index="01"
      data-section-label="Studio"
      className="relative overflow-hidden bg-paper pb-28 pt-20 text-ink md:pb-40 md:pt-28"
    >
      <SectionHead index={1} total={ABOUT_SECTION_TOTAL} label={studio.label} meta="East Patel Nagar — New Delhi" />

      <div className="frame grid-12 mt-14 md:mt-24">
        <h2
          id="studio-profile-title"
          className="col-span-12 text-display font-medium uppercase condensed lg:col-span-10"
        >
          <RevealLines
            lines={studio.heading.map((line, i) => (
              <span
                key={i}
                className={cn(
                  "block",
                  i === 1 && "md:pl-[16.66%]",
                  i === last && "font-serif font-normal normal-case italic tracking-[-0.01em]",
                )}
              >
                {line}
              </span>
            ))}
          />
        </h2>
      </div>

      <div className="frame grid-12 mt-16 gap-y-16 md:mt-24">
        <div className="col-span-12 md:col-span-6 md:col-start-7 md:row-start-1 lg:col-span-5 lg:col-start-8">
          <FadeIn>
            <p className="text-lede text-pretty">{studio.lede}</p>
          </FadeIn>
          {studio.body.map((p, i) => (
            <FadeIn key={i} delay={0.1 + i * 0.1} className="mt-6">
              <p className="max-w-[34rem] text-pretty text-concrete">{p}</p>
            </FadeIn>
          ))}
        </div>

        {/* Schedule */}
        <FadeIn className="col-span-12 md:col-span-6 md:col-start-1 md:row-start-1 lg:col-span-5" delay={0.15}>
          <div className="relative border border-ink/20">
            <RegMark className="absolute -left-2 -top-2 text-ink/45" />
            <RegMark className="absolute -right-2 -top-2 text-ink/45" />
            <RegMark className="absolute -bottom-2 -left-2 text-ink/45" />
            <RegMark className="absolute -bottom-2 -right-2 text-ink/45" />

            <p className="label flex justify-between gap-4 border-b border-ink/20 px-4 py-3 text-concrete md:px-5">
              <span>Studio schedule</span>
              <span>Sheet {pad(1)}</span>
            </p>
            <dl>
              {studio.sheet.map((row, i) => (
                <div
                  key={row.term}
                  className="grid grid-cols-[8rem_1fr] gap-x-4 border-b border-ink/10 px-4 py-4 last:border-b-0 sm:grid-cols-[9rem_1fr] md:px-5"
                >
                  <dt className="label pt-[0.3em] text-concrete">
                    <span className="mr-2 opacity-60">{pad(i + 1)}</span>
                    {row.term}
                  </dt>
                  <dd className="leading-snug">
                    {row.values.map((v) => (
                      <span key={v} className="block">
                        {v}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="label flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-ink/20 px-4 py-3 text-concrete md:px-5">
              <span>{site.name}</span>
              <Coordinates />
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
