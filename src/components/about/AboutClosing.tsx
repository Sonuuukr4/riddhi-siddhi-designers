import { SectionHead } from "@/components/ui/Annotations";
import { FadeIn, RevealLines, Rule } from "@/components/ui/Reveal";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { site } from "@/config/site";
import { about } from "@/content/about";
import { pad } from "@/lib/utils";
import { ABOUT_SECTION_TOTAL } from "./sheet";

/** 07 — Next. Two ways on: the work itself, or a conversation — and the direct line. */
export function AboutClosing() {
  const { cta } = about;

  return (
    <section
      id="next"
      aria-labelledby="next-title"
      data-theme="dark"
      data-section-index="07"
      data-section-label="Next"
      className="ink-grid relative overflow-hidden bg-ink pb-24 pt-20 text-paper md:pb-32 md:pt-28"
    >
      <SectionHead index={7} total={ABOUT_SECTION_TOTAL} label={cta.label} meta={`${site.city} / ${site.country}`} />

      <div className="frame mt-16 md:mt-24">
        <h2 id="next-title" className="text-mega font-medium uppercase leading-[0.82] tracking-[-0.02em] condensed">
          <RevealLines
            lines={[
              cta.heading[0],
              <span
                key="s"
                className="block text-[0.9em] font-serif font-normal normal-case italic tracking-[-0.01em] text-paper/85 md:pl-[8.33%]"
              >
                {cta.heading[1]}
              </span>,
            ]}
          />
        </h2>
        <div className="grid-12 mt-8 md:mt-12">
          <FadeIn className="col-span-12 text-pretty text-paper/70 md:col-span-5 md:col-start-7 md:text-lg">
            {cta.text}
          </FadeIn>
        </div>
      </div>

      <div className="frame mt-14 md:mt-20">
        <ul>
          {cta.links.map((link, i) => (
            <li key={link.href}>
              <Rule delay={i * 0.1} />
              <TransitionLink
                href={link.href}
                transitionLabel={link.transitionLabel}
                className="group grid grid-cols-[1fr_auto] items-center gap-6 py-8 md:grid-cols-[3.5rem_1fr_auto] md:py-10"
              >
                <span className="label hidden text-paper/60 md:block">{pad(i + 1)}</span>
                <span className="min-w-0">
                  <span className="label block text-paper/60">{link.meta}</span>
                  <span className="mt-2 block text-headline font-medium uppercase leading-none transition-transform duration-700 ease-[var(--ease-out-expo)] condensed group-hover:translate-x-2">
                    {link.label}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="grid size-14 shrink-0 place-items-center rounded-full border border-paper/40 text-2xl transition-all duration-500 group-hover:translate-x-2 group-hover:bg-paper group-hover:text-ink md:size-20"
                >
                  →
                </span>
              </TransitionLink>
            </li>
          ))}
        </ul>
        <Rule delay={0.2} />
      </div>

      <div className="frame grid-12 mt-14 gap-y-8 md:mt-20">
        <p className="label col-span-12 text-paper/60 md:col-span-4">{cta.direct}</p>
        <a href={site.phone.href} className="group col-span-12 sm:col-span-6 md:col-span-4">
          <span className="label block text-paper/60">Call the studio</span>
          <span className="mt-1 block text-title font-light tabular-nums transition-colors group-hover:text-sand">
            {site.phone.display}
          </span>
        </a>
        <a
          href={site.whatsapp.hrefWithMessage}
          target="_blank"
          rel="noopener noreferrer"
          className="group col-span-12 sm:col-span-6 md:col-span-4"
        >
          <span className="label block text-paper/60">WhatsApp</span>
          <span className="mt-1 inline-flex items-baseline gap-2 text-title font-light transition-colors group-hover:text-sand">
            Message the studio
            <span aria-hidden className="text-lede transition-transform duration-500 group-hover:translate-x-1">
              ↗
            </span>
          </span>
          <span className="sr-only">(opens WhatsApp in a new tab)</span>
        </a>
      </div>
    </section>
  );
}
