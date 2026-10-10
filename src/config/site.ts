/**
 * Site configuration — the single source of truth for business details,
 * contact channels, social links, navigation and SEO defaults.
 *
 * Edit values here; every component reads from this file. Nothing below
 * should be hard-coded anywhere else in the codebase.
 */

const PHONE_E164 = "+919811763839";
const WHATSAPP_NUMBER = "919811763839"; // international format, digits only — no "+" or spaces

/**
 * Official social profiles — the single source for every social link on the site.
 *
 * Instagram: supplied by the studio. Facebook: not yet supplied — paste the full
 * profile URL when available. While a value is `null`, the button is hidden on
 * the production site and shown as "link pending" in development, so a broken
 * link is never published.
 */
export const SOCIAL_LINKS: { instagram: string | null; facebook: string | null } = {
  instagram: "https://www.instagram.com/riddhisiddhidesigners3",
  facebook: null,
};

export const site = {
  name: "Riddhi Siddhi Designers",
  shortName: "Riddhi Siddhi",
  descriptor: "Architecture / Interior Design / Visualization",
  tagline: "Space / Form / Light",

  /** NEXT_PUBLIC_SITE_URL, or the Vercel production domain (see next.config.ts), so canonical URLs, the sitemap and OG tags resolve. */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),

  phone: {
    display: "098117 63839",
    href: `tel:${PHONE_E164}`,
    e164: "+91-98117-63839",
  },

  whatsapp: {
    number: WHATSAPP_NUMBER,
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    /** Opens the chat with a polite first line the visitor can edit. */
    hrefWithMessage: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      "Hello Riddhi Siddhi Designers, I would like to discuss a project.",
    )}`,
  },

  social: SOCIAL_LINKS,

  /** No email address has been provided. Leave null until the studio supplies one. */
  email: null as string | null,

  address: {
    lines: ["8/12, W Patel Nagar\u00a0Rd", "Near DAV School, Block 26", "East Patel Nagar", "New Delhi — 110008"],
    short: ["8/12, W Patel Nagar\u00a0Rd", "East Patel Nagar", "New Delhi — 110008"],
    street: "8/12, W Patel Nagar Rd, Near DAV School, Block 26, East Patel Nagar, Patel Nagar",
    locality: "New Delhi",
    region: "Delhi",
    postalCode: "110008",
    country: "IN",
  },

  city: "New Delhi",
  country: "India",

  /**
   * Approximate coordinates of East Patel Nagar, used only as graphic
   * annotation. Not published in structured data.
   */
  coordinates: { lat: "28°38′N", lng: "77°10′E" },

  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent("Riddhi Siddhi Designers, 8/12, W Patel Nagar Rd, East Patel Nagar, New Delhi, Delhi 110008"),

  rating: { value: "4.8", scale: "5", source: "Google reviews" },

  /** Shows the small "representative imagery" notes on placeholder content. */
  showPlaceholderNotices: true,

  nav: [
    { label: "Projects", href: "/#projects" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Expertise", href: "/#expertise" },
    { label: "Studio", href: "/#studio" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],

  seo: {
    title: "Riddhi Siddhi Designers | Architecture & Interior Design Studio in Delhi",
    description:
      "Riddhi Siddhi Designers is an architecture and interior design studio in Patel Nagar, New Delhi — residential, commercial, retail, hospitality and warehouse projects, with 3D visualization, MCD work, licensing and Vastu-related design.",
  },
} as const;

export type Site = typeof site;

/** True when a social profile has been configured. */
export const hasSocial = (key: keyof typeof SOCIAL_LINKS) => Boolean(SOCIAL_LINKS[key]);
