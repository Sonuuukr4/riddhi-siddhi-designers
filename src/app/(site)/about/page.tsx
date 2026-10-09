import type { Metadata } from "next";
import { AboutCapabilities } from "@/components/about/AboutCapabilities";
import { AboutClosing } from "@/components/about/AboutClosing";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutLeadership } from "@/components/about/AboutLeadership";
import { AboutPrinciples } from "@/components/about/AboutPrinciples";
import { AboutPurpose } from "@/components/about/AboutPurpose";
import { AboutStudio } from "@/components/about/AboutStudio";
import { AboutVision } from "@/components/about/AboutVision";
import { site } from "@/config/site";
import { about } from "@/content/about";

const { meta } = about;
const shareTitle = `${meta.title} — ${site.name}`;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: site.name,
    url: "/about",
    title: shareTitle,
    description: meta.description,
    images: [{ url: meta.image.src, width: meta.image.width, height: meta.image.height, alt: meta.image.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: meta.description,
    images: [{ url: meta.image.src, alt: meta.image.alt }],
  },
};

const absolute = (src: string) => (src.startsWith("http") ? src : `${site.url}${src}`);

/**
 * AboutPage structured data. Facts only: it points at the studio's
 * LocalBusiness node (emitted by the site layout) rather than restating it,
 * and publishes no Person data while the biography awaits approval.
 */
function aboutPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${site.url}/about#page`,
    url: `${site.url}/about`,
    name: shareTitle,
    description: meta.description,
    inLanguage: "en-IN",
    about: { "@id": `${site.url}/#studio` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      contentUrl: absolute(meta.image.src),
      width: meta.image.width,
      height: meta.image.height,
      caption: meta.image.alt,
    },
  };
}

/**
 * About — the studio's profile, set as another chapter of the site:
 * opening sheet → studio → leadership → vision → purpose → thinking → capabilities → next.
 */
export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd()) }} />
      <AboutHero />
      <AboutStudio />
      <AboutLeadership />
      <AboutVision />
      <AboutPurpose />
      <AboutPrinciples />
      <AboutCapabilities />
      <AboutClosing />
    </>
  );
}
