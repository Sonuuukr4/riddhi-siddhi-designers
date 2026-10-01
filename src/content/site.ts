/**
 * Business information — the single source of truth for name, address,
 * phone, navigation and SEO defaults. Edit here; every component reads it.
 */

export const site = {
  name: "Riddhi Siddhi Designers",
  shortName: "Riddhi Siddhi",
  descriptor: "Architecture / Interior Design / Visualization",
  tagline: "Space / Form / Light",

  /** Set NEXT_PUBLIC_SITE_URL in production so canonical URLs, the sitemap and OG tags resolve. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),

  phone: {
    display: "098117 63839",
    href: "tel:+919811763839",
    e164: "+91-98117-63839",
  },

  /** No email address has been provided. Leave null until the studio supplies one. */
  email: null as string | null,

  address: {
    lines: ["8/12, W Patel Nagar Rd", "Near DAV School, Block 26", "East Patel Nagar", "New Delhi — 110008"],
    short: ["8/12, W Patel Nagar Rd", "East Patel Nagar", "New Delhi — 110008"],
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
    { label: "Expertise", href: "/#expertise" },
    { label: "Studio", href: "/#studio" },
    { label: "Process", href: "/#process" },
    { label: "Contact", href: "/#contact" },
  ],

  seo: {
    title: "Riddhi Siddhi Designers | Architecture & Interior Design Studio in Delhi",
    description:
      "Riddhi Siddhi Designers is an architecture and interior design studio in Patel Nagar, New Delhi — residential, commercial, retail, hospitality and warehouse projects, with 3D visualization, MCD work, licensing and Vastu-related design.",
  },
} as const;

export type Site = typeof site;
