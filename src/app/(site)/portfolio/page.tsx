import type { Metadata } from "next";
import { PortfolioView } from "@/components/portfolio/PortfolioView";
import { Coordinates, SectionHead } from "@/components/ui/Annotations";
import { FadeIn, RevealLines } from "@/components/ui/Reveal";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { site } from "@/config/site";
import { getPortfolioCategories, getPublishedProjects } from "@/lib/cms/public";
import { pad } from "@/lib/utils";

const description =
  "The architecture and interior design portfolio of Riddhi Siddhi Designers, New Delhi — residential, commercial, interior, retail, hospitality and visualization projects.";

export const metadata: Metadata = {
  title: "Portfolio",
  description,
  alternates: { canonical: "/portfolio" },
  openGraph: { title: `Portfolio — ${site.name}`, description, url: "/portfolio" },
};

export default async function PortfolioPage() {
  const [projects, categories] = await Promise.all([getPublishedProjects(), getPortfolioCategories()]);
  const usedCategories = categories.filter((c) => c.count > 0).length;

  // Structured data lists real projects only — demo entries are never published as work.
  const real = projects.filter((p) => !p.placeholder);
  const jsonLd = real.length
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `Portfolio — ${site.name}`,
        url: `${site.url}/portfolio`,
        about: { "@id": `${site.url}/#studio` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: real.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.title,
            url: `${site.url}/projects/${p.slug}`,
          })),
        },
      }
    : null;

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}

      <section
        data-theme="light"
        data-section-index="01"
        data-section-label="Portfolio"
        aria-labelledby="portfolio-title"
        className="paper-grid bg-paper pb-28 pt-[calc(var(--header-h)+3rem)] text-ink md:pb-40 md:pt-[calc(var(--header-h)+5rem)]"
      >
        <SectionHead
          index={1}
          total={1}
          label="Portfolio"
          meta={`${pad(projects.length)} projects · ${pad(usedCategories)} categories`}
        />

        <div className="frame grid-12 mt-10 items-end gap-y-6 md:mt-14">
          <h1
            id="portfolio-title"
            className="col-span-12 text-mega font-medium uppercase leading-[0.8] condensed md:col-span-9"
          >
            <RevealLines
              as="span"
              immediate
              lines={[
                "Selected",
                <span key="w" className="font-serif font-normal normal-case italic">
                  work
                </span>,
              ]}
            />
          </h1>
          <FadeIn className="col-span-12 flex flex-col gap-4 md:col-span-3">
            <p className="text-pretty text-concrete">
              Homes, workplaces, shops and places of hospitality — each project a complete record of photographs,
              drawings and, where available, film.
            </p>
            <Coordinates className="text-concrete" />
          </FadeIn>
        </div>

        <div className="mt-16 md:mt-24">
          <PortfolioView projects={projects} categories={categories} />
        </div>
      </section>

      <section data-theme="dark" aria-labelledby="portfolio-next" className="ink-grid bg-ink py-20 text-paper md:py-28">
        <div className="frame grid-12 items-end gap-y-10">
          <h2 id="portfolio-next" className="col-span-12 text-display font-medium uppercase condensed md:col-span-8">
            Have a project
            <span className="block font-serif font-normal normal-case italic text-paper/85">in mind?</span>
          </h2>
          <div className="col-span-12 flex flex-col items-start gap-5 md:col-span-4 md:items-end">
            <TransitionLink
              href="/contact"
              transitionLabel="Contact"
              className="caps group flex items-center gap-3 border-b border-paper pb-1"
            >
              Start a conversation
              <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </TransitionLink>
            <a href={site.phone.href} className="label text-paper/70 hover:text-paper">
              Or call {site.phone.display}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
