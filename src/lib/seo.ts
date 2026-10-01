import { expertise } from "@/content/expertise";
import { site } from "@/content/site";

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
