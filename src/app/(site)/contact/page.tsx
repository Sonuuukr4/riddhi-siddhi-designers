import type { Metadata } from "next";
import { Contact } from "@/components/sections/Contact";
import { site } from "@/config/site";

const title = "Contact";
const description = `${site.name}, ${site.address.short.join(", ")}. Call ${site.phone.display}, message the studio on WhatsApp or send an enquiry.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: site.name,
    title: `${title} — ${site.name}`,
    description,
    url: "/contact",
    images: ["/opengraph-image"],
  },
  twitter: { card: "summary_large_image", title: `${title} — ${site.name}`, description, images: ["/opengraph-image"] },
};

/** The contact section on its own page: direct lines, the enquiry form and the studio's location. */
export default function ContactPage() {
  return <Contact standalone />;
}
