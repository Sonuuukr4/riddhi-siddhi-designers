"use client";

import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { LocationPlate } from "@/components/contact/LocationPlate";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { SectionHead } from "@/components/ui/Annotations";
import { FadeIn, RevealLines, Rule } from "@/components/ui/Reveal";
import { site } from "@/content/site";
import { contact } from "@/content/studio";

/** 08 — Contact. The closing statement, the direct line, and a short form. */
export function Contact() {
  const { scrollTo } = useSmoothScroll();

  const startConversation = () => {
    const form = document.getElementById("enquiry");
    if (!form) return;
    scrollTo(form, { offset: -120 });
    setTimeout(() => form.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true }), 900);
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      data-theme="dark"
      data-section-index="08"
      data-section-label="Contact"
      className="ink-grid relative bg-ink pb-24 pt-20 text-paper md:pb-32 md:pt-28"
    >
      <SectionHead index={8} label="Contact" meta={`${site.city} / ${site.country}`} />

      <div className="frame mt-16 md:mt-24">
        <h2 id="contact-title" className="text-mega font-medium uppercase leading-[0.82] tracking-[-0.02em] condensed">
          <RevealLines
            lines={[
              contact.headline[0],
              <span key="2" className="pl-[16.66%]">
                {contact.headline[1]}
              </span>,
            ]}
          />
        </h2>
        <div className="grid-12 mt-8 items-end gap-y-8 md:mt-10">
          <FadeIn className="col-span-12 font-serif text-headline italic text-paper/85 md:col-span-6 md:col-start-3">
            {contact.sub}
          </FadeIn>
          <FadeIn className="col-span-12 md:col-span-4 md:col-start-9" delay={0.15}>
            <a href={site.phone.href} className="group block">
              <span className="label block text-paper/60">Call the studio</span>
              <span className="mt-1 block text-title font-light tabular-nums transition-colors group-hover:text-sand">
                {site.phone.display}
              </span>
            </a>
          </FadeIn>
        </div>
      </div>

      <div className="frame mt-14 md:mt-20">
        <Rule />
        <button
          type="button"
          onClick={startConversation}
          className="group flex w-full items-center justify-between gap-6 py-8 text-left md:py-10"
        >
          <span className="text-headline font-medium uppercase leading-none condensed">{contact.cta}</span>
          <span
            aria-hidden
            className="grid size-14 shrink-0 place-items-center rounded-full border border-paper/40 text-2xl transition-all duration-500 group-hover:translate-x-2 group-hover:bg-paper group-hover:text-ink md:size-20"
          >
            →
          </span>
        </button>
        <Rule />
      </div>

      <div className="frame grid-12 mt-16 gap-y-16 md:mt-24">
        <div className="col-span-12 lg:col-span-7">
          <p className="label mb-8 text-paper/60">Enquiry</p>
          <EnquiryForm id="enquiry" />
        </div>

        <aside
          className="col-span-12 flex flex-col gap-10 md:col-span-6 lg:col-span-4 lg:col-start-9"
          aria-label="Studio address"
        >
          <LocationPlate />
          <div className="grid grid-cols-2 gap-6">
            <address className="not-italic">
              <span className="label block text-paper/60">Studio</span>
              <span className="mt-2 block leading-relaxed">
                {site.address.lines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </span>
            </address>
            <div className="flex flex-col items-start gap-5">
              <div>
                <span className="label block text-paper/60">Phone</span>
                <a href={site.phone.href} className="mt-2 block hover:text-sand">
                  {site.phone.display}
                </a>
              </div>
              <a
                href={site.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="caps group inline-flex items-center gap-2 border-b border-paper/50 pb-1 hover:border-paper"
              >
                Get directions
                <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
                  ↗
                </span>
                <span className="sr-only">(opens Google Maps in a new tab)</span>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
