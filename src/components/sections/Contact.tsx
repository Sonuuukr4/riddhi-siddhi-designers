"use client";

import { ContactActions } from "@/components/contact/ContactActions";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { LocationPlate } from "@/components/contact/LocationPlate";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { SectionHead } from "@/components/ui/Annotations";
import { FadeIn, RevealLines, Rule } from "@/components/ui/Reveal";
import { site } from "@/config/site";
import { contact } from "@/content/studio";
import { cn } from "@/lib/utils";

/**
 * 08 — Contact. The closing statement, the studio's direct lines, and a short form.
 *
 * Closes the home page as a section; with `standalone` it is the whole of
 * /contact — it clears the fixed header and carries the page's h1.
 */
export function Contact({ standalone = false }: { standalone?: boolean }) {
  const { scrollTo } = useSmoothScroll();
  const Heading = standalone ? "h1" : "h2";
  const Subheading = standalone ? "h2" : "h3";

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
      data-section-index={standalone ? "01" : "08"}
      data-section-label="Contact"
      className={cn(
        "ink-grid relative bg-ink pb-24 text-paper md:pb-32",
        standalone ? "pt-[calc(var(--header-h)+2.5rem)] md:pt-[calc(var(--header-h)+4rem)]" : "pt-20 md:pt-28",
      )}
    >
      <SectionHead
        index={standalone ? 1 : 8}
        total={standalone ? 1 : 8}
        label="Contact"
        meta={`${site.city} / ${site.country}`}
      />

      <div className="frame mt-16 md:mt-24">
        <Heading
          id="contact-title"
          className="text-mega font-medium uppercase leading-[0.82] tracking-[-0.02em] condensed"
        >
          {standalone && <span className="sr-only">Contact {site.name} — </span>}
          <RevealLines
            as="span"
            className="block"
            lines={[
              contact.headline[0],
              <span key="2" className="pl-[16.66%]">
                {contact.headline[1]}
              </span>,
            ]}
          />
        </Heading>
        <div className="grid-12 mt-8 md:mt-10">
          <FadeIn className="col-span-12 font-serif text-headline italic text-paper/85 md:col-span-6 md:col-start-3">
            {contact.sub}
          </FadeIn>
        </div>
      </div>

      {/* Direct lines — the quickest way to the studio, before the form. */}
      <div className="frame grid-12 mt-14 gap-y-8 md:mt-20">
        <FadeIn className="col-span-12 lg:col-span-3">
          <Subheading className="label text-paper/60">Direct lines</Subheading>
          <p className="mt-3 max-w-[20rem] text-pretty text-paper/70">
            Speak to the studio directly — a call, or a message on WhatsApp.
          </p>
        </FadeIn>
        <FadeIn className="col-span-12 lg:col-span-9" delay={0.1}>
          <ContactActions variant="stacked" />
        </FadeIn>
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
                <a
                  href={site.phone.href}
                  aria-label={`Call ${site.name} on ${site.phone.display}`}
                  className="mt-2 block tabular-nums hover:text-sand"
                >
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
