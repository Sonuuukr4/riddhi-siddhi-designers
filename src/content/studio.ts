import type { Discipline, Principle, ProcessStep, VisualizationStage } from "@/lib/types";
import { img } from "./images";

/**
 * Studio copy. Written from the business description only — no years,
 * awards, team sizes or client names. Add verified facts here when available.
 */
export const studio = {
  statement: "We design spaces that belong to the people who inhabit them.",

  prologue: {
    kicker: "Space / Form / Light",
    lines: [
      "A building is more than its walls.",
      "We shape space, light, material, function —",
      "and the experience of moving through them.",
    ],
  },

  intro: [
    "Riddhi Siddhi Designers is an architecture and interior design studio in East Patel Nagar, New Delhi.",
    "The studio works across homes, workplaces, shops, warehouses and places of hospitality — carrying a project from its first drawings through interiors and 3D visualization, and supporting the MCD work, licensing and Vastu considerations that building in Delhi often involves.",
  ],

  about: [
    "The practice works at every scale a building asks for — from the arrangement of a site to the detail of a joint. Architecture, interiors and visualization sit side by side, so the drawing, the model and the finished room share one intent.",
    "Building in Delhi brings its own requirements. Alongside design, the studio supports MCD work and licensing, and brings Vastu considerations into planning where a client asks for them.",
  ],

  image: img.studioDesk,
  imageSecondary: img.studioModel,
};

export const disciplines: Discipline[] = [
  {
    id: "architecture",
    label: "Architecture",
    description: "Buildings conceived from the plan up — massing, structure, light and movement.",
  },
  {
    id: "interior",
    label: "Interior",
    description: "Rooms resolved to the detail: layout, material, light and the objects that complete them.",
  },
  {
    id: "visualization",
    label: "Visualization",
    description: "3D views that let a space be seen, tested and decided upon before it is built.",
  },
  {
    id: "mcd",
    label: "MCD Work",
    description: "Architectural drawings and documentation for Municipal Corporation of Delhi requirements.",
  },
  {
    id: "licensing",
    label: "Licensing",
    description: "Design and documentation support for licensing-related work.",
  },
  {
    id: "vastu",
    label: "Vastu",
    description: "Vastu-related considerations brought into orientation and layout, where a client seeks them.",
  },
];

/** "What we look for" — framed as an approach to design, not a credo. */
export const principles: Principle[] = [
  { id: "light", word: "Light", line: "Where it enters, how it moves, what it reveals.", image: img.lightJaali },
  {
    id: "proportion",
    word: "Proportion",
    line: "The quiet relationship between every part and the whole.",
    image: img.proportionModel,
  },
  {
    id: "material",
    word: "Material",
    line: "Surfaces chosen for how they feel, weather and age.",
    image: img.materialConcrete,
  },
  { id: "function", word: "Function", line: "Plans that follow the way a day is actually lived.", image: img.resStair },
  {
    id: "context",
    word: "Context",
    line: "Site, climate, street and city — Delhi as a starting point.",
    image: img.contextSandstone,
  },
  {
    id: "detail",
    word: "Detail",
    line: "The joint, the edge, the threshold. Where intent becomes real.",
    image: img.detailJaali,
  },
];

/** Hero — the three slides cycle slowly behind the masthead. */
export const hero = {
  disciplines: ["Architecture", "Interiors", "Spaces"],
  slides: [
    { id: "space", word: "Space", image: img.heroSpace },
    { id: "form", word: "Form", image: img.heroForm },
    { id: "light", word: "Light", image: img.heroLight },
  ],
};

/** Contact section copy and enquiry options. */
export const contact = {
  headline: ["Have a space", "in mind?"],
  sub: "Let’s design it.",
  cta: "Start a conversation",
  projectTypes: [
    "Residential",
    "Corporate",
    "Interior",
    "Retail",
    "Hospitality",
    "Warehouse",
    "3D Visualization",
    "MCD / Licensing",
    "Vastu",
    "Other",
  ],
};

/** Visualization section — three readings of one space. */
export const visualization = {
  title: ["From drawing", "to reality."],
  intro:
    "3D visualization lets a space be walked through before it is built. Drag across the image to move from the first line of a concept to the finished room.",
  base: img.vizSpace,
  // Add `image` to a stage to replace its derived (filtered) version with a real sketch or render.
  stages: [
    { id: "concept", label: "Concept", caption: "Line and proportion" },
    { id: "visualization", label: "Visualization", caption: "Form and light" },
    { id: "space", label: "Space", caption: "Material and life" },
  ] as VisualizationStage[],
};

export const process: ProcessStep[] = [
  {
    id: "understand",
    title: "Understand",
    summary: "Site, brief, people.",
    detail:
      "Every project begins by listening — to the people who will use the space, to the site and its orientation, and to the constraints that will shape what is possible.",
    notes: ["Site boundary", "Orientation", "Sun path", "Access"],
  },
  {
    id: "concept",
    title: "Concept",
    summary: "The idea of the space.",
    detail:
      "Relationships come before rooms. Spaces are arranged as a diagram of how life will move through them, and a governing idea is found.",
    notes: ["Adjacencies", "Spatial diagram", "Centre"],
  },
  {
    id: "develop",
    title: "Develop",
    summary: "From diagram to drawing.",
    detail:
      "The diagram is given structure. A grid is set, walls and openings are placed, and the plan takes on proportion and order.",
    notes: ["Structural grid", "Walls & openings", "Circulation"],
  },
  {
    id: "visualize",
    title: "Visualize",
    summary: "Seeing before building.",
    detail:
      "Light, depth and material are studied in three dimensions, so that decisions are made by seeing the space rather than imagining it.",
    notes: ["Section", "Light study", "Poché"],
  },
  {
    id: "execute",
    title: "Execute",
    summary: "Drawings for the site.",
    detail:
      "The design is translated into precise, buildable documentation — dimensioned, coordinated and ready for the people who will build it.",
    notes: ["Dimensions", "Setting out", "Coordination"],
  },
  {
    id: "refine",
    title: "Refine",
    summary: "The final layer.",
    detail:
      "Furniture, fittings, finishes and light are tuned until the space feels complete — and belongs to the people who inhabit it.",
    notes: ["Furniture", "Finishes", "Lighting"],
  },
];
