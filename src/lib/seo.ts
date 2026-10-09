import { expertise } from "@/content/expertise";
import { site } from "@/config/site";
import type { Project } from "@/lib/types";

/**
 * LocalBusiness structured data built only from verified facts: name,
 * address, phone and services. No rating, geo-coordinates, opening hours or
 * email are emitted because none have been confirmed.
 */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": `${site.url}/#studio`,
    name: site.name,
    description: site.seo.description,
    url: site.url,
    telephone: site.phone.e164,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    areaServed: { "@type": "City", name: "Delhi" },
    knowsAbout: expertise.map((e) => e.title),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Architecture and interior design services",
      itemListElement: expertise.map((e) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: e.title, description: e.description },
      })),
    },
  };
}

const absolute = (src: string) => (src.startsWith("http") ? src : `${site.url}${src}`);

/** CreativeWork data for a real (non-placeholder) project — only fields the studio entered. */
export function projectJsonLd(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary || project.description[0] || undefined,
    genre: project.category,
    url: `${site.url}/projects/${project.slug}`,
    image: absolute(project.heroImage.src),
    ...(project.location ? { locationCreated: { "@type": "Place", name: project.location } } : {}),
    ...(project.year ? { temporalCoverage: project.year } : {}),
    creator: { "@type": "Organization", "@id": `${site.url}/#studio`, name: site.name },
  };
}
