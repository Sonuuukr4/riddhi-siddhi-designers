import type { Expertise, ImageAsset } from "@/lib/types";
import { expertise } from "./expertise";
import { img } from "./images";

/**
 * About page content (/about).
 *
 * Plain, typed data so each block can later be served by the CMS without
 * touching the components that render it. Written from the business
 * description only — no years, awards, qualifications, memberships, client
 * names, project counts or statistics. Add verified facts here when the
 * studio supplies them.
 */

export type AboutSheetRow = { term: string; values: string[] };

export type AboutNote = { term: string; value: string };

export type AboutLink = {
  label: string;
  href: string;
  /** Small annotation above the link, e.g. "Index of work". */
  meta: string;
  /** Curtain label for the page transition. */
  transitionLabel?: string;
};

export type AboutLeader = {
  name: string;
  /**
   * Public label for the role. The formal designation is unconfirmed — keep
   * this neutral until the studio supplies one (do not invent Founder/Principal).
   */
  role: string;
  portrait: ImageAsset;
  biography: string[];
  /** Short factual annotations set beneath the biography. */
  notes: AboutNote[];
  /** True while the biography awaits the client's approval. Not rendered. */
  draft: boolean;
};

export type AboutResponse = { id: string; title: string; text: string };

/** One line of the purpose: what the studio is given, and what it returns. */
export type AboutPurposePoint = { from: string; to: string; text: string };

export type AboutPrincipleId = "space" | "light" | "material" | "proportion" | "function" | "detail" | "context";

export type AboutPrinciple = {
  id: AboutPrincipleId;
  word: string;
  line: string;
  /** The question the studio asks of a project under this heading. */
  question: string;
};

export type AboutCapability = Expertise;

export type AboutContent = {
  meta: {
    title: string;
    description: string;
    /** Share image — dimensions are required by Open Graph consumers. */
    image: ImageAsset & { width: number; height: number };
  };
  hero: { kicker: string; title: [string, string]; intro: string; disciplines: string[] };
  /** Heading arrays: the last line is set in italic serif. */
  studio: { label: string; heading: string[]; lede: string; body: string[]; sheet: AboutSheetRow[] };
  leader: AboutLeader;
  vision: { label: string; statement: string; emphasis: string[]; responds: AboutResponse[] };
  purpose: { label: string; heading: string[]; intro: string; points: AboutPurposePoint[] };
  thinking: { label: string; heading: [string, string]; intro: string; principles: AboutPrinciple[] };
  capabilities: {
    label: string;
    heading: [string, string];
    intro: string;
    items: AboutCapability[];
    more: AboutLink;
  };
  cta: { label: string; heading: [string, string]; text: string; links: AboutLink[]; direct: string };
};

/** Capabilities reuse the service descriptions in expertise.ts, so the two never drift apart. */
const CAPABILITY_IDS = ["architecture", "interior-design", "visualization", "mcd", "licensing", "vastu"] as const;

const capabilityItems: AboutCapability[] = CAPABILITY_IDS.map((id) => {
  const item = expertise.find((e) => e.id === id);
  if (!item) throw new Error(`about.ts: no expertise entry with id "${id}"`);
  return item;
});

export const about: AboutContent = {
  meta: {
    title: "About the Studio",
    description:
      "Riddhi Siddhi Designers is an architecture and interior design studio in East Patel Nagar, New Delhi — residential, commercial, retail, hospitality and warehouse projects, with interior 3D visualization, MCD work, licensing and Vastu-related design.",
    image: { ...img.neerajPortrait, width: 880, height: 1100 },
  },

  hero: {
    kicker: "About the studio",
    title: ["Riddhi Siddhi", "designers"],
    intro:
      "An architecture and interior design studio in East Patel Nagar, New Delhi — shaping homes, workplaces, shops, warehouses and places of hospitality with equal care for the plan, the room and the detail.",
    disciplines: ["Architecture", "Interiors", "Visualization"],
  },

  studio: {
    label: "The studio",
    heading: ["Architecture", "and interiors,", "drawn as one."],
    lede: "Riddhi Siddhi Designers is an architecture and interior design studio based in East Patel Nagar, New Delhi.",
    body: [
      "The studio works on residential, commercial and corporate, retail, hospitality and warehouse projects. Buildings and their interiors are developed side by side, so the structure, the room and the details that complete it follow one line of thought.",
      "Interior 3D visualization lets a space be seen — its light, material and proportion — before it is built. Alongside design, the studio supports MCD work and licensing, and brings Vastu-related planning into a project where a client asks for it.",
    ],
    sheet: [
      { term: "Practice", values: ["Architecture", "Interior design"] },
      { term: "Studio", values: ["East Patel Nagar", "New Delhi"] },
      {
        term: "Typologies",
        values: ["Residential", "Commercial & corporate", "Retail", "Hospitality", "Warehouses"],
      },
      { term: "Visualization", values: ["Interior 3D visualization"] },
      { term: "Approvals", values: ["MCD work", "Licensing"] },
      { term: "Planning", values: ["Vastu-related design"] },
    ],
  },

  /*
   * DRAFT BIOGRAPHY — CLIENT APPROVAL REQUIRED
   * Written from the studio's business context only. Neeraj Ji's formal
   * designation, years in practice, qualifications and affiliations are
   * unconfirmed — do not add any of them until the studio supplies them.
   */
  leader: {
    name: "Neeraj Ji",
    role: "Studio Leadership",
    portrait: img.neerajPortrait,
    biography: [
      "Neeraj Ji leads the design work of Riddhi Siddhi Designers, guiding projects across architecture and interiors — from the first conversation with a client to the finished space.",
      "The work begins with understanding: how people intend to live or work in a space, what the site allows, and what the project genuinely needs. Only then does the drawing start.",
      "From there the focus is clarity and execution — functional plans, considered materials and details resolved with the people who will build them in mind. Design thinking and practical judgement are held together, so that what is drawn can be built well.",
    ],
    notes: [
      { term: "Practice", value: "Architecture & interiors" },
      { term: "Studio", value: "East Patel Nagar, New Delhi" },
    ],
    draft: true,
  },

  vision: {
    label: "Our vision",
    statement:
      "To create spaces that are thoughtful in plan, clear in function and quietly refined — spaces that respond to the people who use them, the context that surrounds them and the purpose they serve.",
    emphasis: ["people", "context", "purpose"],
    responds: [
      {
        id: "people",
        title: "People",
        text: "Rooms arranged around the routines, gatherings and quiet hours of the people who use them.",
      },
      {
        id: "context",
        title: "Context",
        text: "Design that answers its setting — the plot, the climate, the street outside and the city beyond.",
      },
      {
        id: "purpose",
        title: "Purpose",
        text: "Each space measured against what it is for: a home, a workplace, a shop, a place of welcome.",
      },
    ],
  },

  purpose: {
    label: "Our purpose",
    heading: ["Turning", "requirements", "into meaningful space."],
    intro:
      "A project begins as a set of needs — rooms, uses, limits, hopes. The studio’s work is to give those needs a form that is practical, balanced and intentional.",
    points: [
      {
        from: "Requirement",
        to: "Space",
        text: "A brief is read closely — how people live and work, what the site allows — and translated into rooms that give it form.",
      },
      {
        from: "Aesthetics + function",
        to: "Balance",
        text: "Beauty and use are weighed together, so that neither is gained at the expense of the other.",
      },
      {
        from: "Element",
        to: "Intention",
        text: "Every wall, opening and material is placed for a reason, so a space feels intentional rather than assembled.",
      },
      {
        from: "Constraint",
        to: "Solution",
        text: "Ideas are resolved with construction and everyday use in mind, so they work on site as well as on paper.",
      },
      {
        from: "Need",
        to: "Architecture",
        text: "The design answers what the client actually needs — not a style, a trend or a template.",
      },
    ],
  },

  thinking: {
    label: "The way we think",
    heading: ["The way", "we think."],
    intro:
      "Seven considerations run through every project, from a single room to a whole building. Point at, tap or scroll through a word to see how it is drawn.",
    principles: [
      {
        id: "space",
        word: "Space",
        line: "Shaped first — the volume between walls, felt before it is furnished.",
        question: "What should this room hold, and what should it leave open?",
      },
      {
        id: "light",
        word: "Light",
        line: "Openings placed for how daylight enters, moves and changes a room through the day.",
        question: "Where does the sun come in, and what should it find?",
      },
      {
        id: "material",
        word: "Material",
        line: "Surfaces chosen for touch, for durability and for the way they age.",
        question: "How will it feel to the hand, and how will it wear?",
      },
      {
        id: "proportion",
        word: "Proportion",
        line: "Dimensions held in relation, so every part sits easily within the whole.",
        question: "Does each part belong to the whole?",
      },
      {
        id: "function",
        word: "Function",
        line: "Plans that follow how a space is used — hour by hour, day after day.",
        question: "How will this space be used on an ordinary day?",
      },
      {
        id: "detail",
        word: "Detail",
        line: "The joint, the edge, the threshold — where an idea is either kept or lost.",
        question: "Where does one material meet the next, and how?",
      },
      {
        id: "context",
        word: "Context",
        line: "Site, climate, street and city, read before the first line is drawn.",
        question: "What do the site and the city ask of the building?",
      },
    ],
  },

  capabilities: {
    label: "Studio capabilities",
    heading: ["From first line", "to final detail."],
    intro:
      "Six capabilities that carry a project from the first drawing to visualization, and on to the approvals and planning considerations that building in Delhi involves.",
    items: capabilityItems,
    more: {
      label: "All disciplines & typologies",
      href: "/#expertise",
      meta: "Expertise",
      transitionLabel: "Expertise",
    },
  },

  cta: {
    label: "Next",
    heading: ["Begin with", "a conversation."],
    text: "See how these ideas take shape across the studio’s work, or bring a brief of your own — a home, a workplace, a shop or a building yet to be drawn.",
    links: [
      { label: "View the portfolio", href: "/portfolio", meta: "Index of work", transitionLabel: "Index of work" },
      { label: "Start a conversation", href: "/contact", meta: "Enquiry", transitionLabel: "Contact" },
    ],
    direct: "Or speak to the studio directly",
  },
};
