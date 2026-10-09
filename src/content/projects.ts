import type { Drawing, Project } from "@/lib/types";
import { img } from "./images";

/**
 * Project portfolio.
 *
 * IMPORTANT — every entry below is a STRUCTURAL PLACEHOLDER (placeholder: true).
 * No real project names, locations, years or clients have been supplied, so
 * none are shown. Imagery is representative stock photography.
 *
 * To publish a real project: duplicate an entry, replace the text and image
 * keys, fill location / year / status / client, set placeholder: false.
 * Order in this array = order on the site.
 */

const standardDrawings: Drawing[] = [
  { sheet: "A-101", title: "Ground floor plan", kind: "plan" },
  { sheet: "A-201", title: "Section A—A", kind: "section" },
  { sheet: "A-301", title: "Principal elevation", kind: "elevation" },
  { sheet: "A-501", title: "Typical detail", kind: "detail" },
];

export const projects: Project[] = [
  {
    slug: "residential",
    title: "Residence",
    category: "Residential",
    categorySlug: "residential",
    featured: true,
    typology: "Residential Architecture",
    location: null,
    year: null,
    status: null,
    client: null,
    scope: ["Architecture", "Interior Design", "3D Visualization"],
    summary: "Homes shaped around light, privacy and the rhythm of a family’s day.",
    description: [
      "A residential commission begins with how a household actually lives — where mornings are spent, where people gather, and where they withdraw.",
    ],
    approach: [
      {
        title: "Orientation",
        text: "Rooms placed to receive the right light at the right hour, and shaded from the harshest.",
      },
      { title: "Threshold", text: "A considered sequence from street to home — gate, court, door, room." },
      { title: "Material", text: "A restrained palette that is warm to the hand and ages with grace." },
    ],
    heroImage: img.resCourtyard,
    gallery: [
      { ...img.resJaaliLiving, layout: "full", caption: "Living — representative image" },
      { ...img.resScreen, layout: "pair", pairWith: img.resLounge, caption: "Screen and court" },
      { ...img.resStair, layout: "portrait", caption: "Stair" },
      { ...img.resVolume, layout: "wide", caption: "Massing" },
      { ...img.resNight, layout: "offset", caption: "Evening" },
    ],
    drawings: standardDrawings,
    visualizations: [img.visHouse],
    materials: [
      { name: "Exposed brick", note: "Indicative", tone: "#9a5b43" },
      { name: "Lime plaster", note: "Indicative", tone: "#e6dfd2" },
      { name: "Kota stone", note: "Indicative", tone: "#7d8079" },
      { name: "Teak", note: "Indicative", tone: "#8a5f3c" },
    ],
    placeholder: true,
  },
  {
    slug: "commercial",
    title: "Workplace",
    category: "Commercial",
    categorySlug: "commercial",
    featured: true,
    typology: "Corporate Space",
    location: null,
    year: null,
    status: null,
    client: null,
    scope: ["Interior Design", "Space Planning", "3D Visualization"],
    summary: "Workplaces planned around focus, collaboration and arrival.",
    description: [
      "A workplace is a daily ritual for the people inside it. Its plan should make concentration easy, conversation natural and arrival memorable.",
    ],
    approach: [
      { title: "Zoning", text: "Quiet, collaborative and social settings arranged as a legible sequence." },
      { title: "Daylight", text: "Work placed along the light; support spaces gathered at the core." },
      { title: "Identity", text: "Material and detail that express the organisation without signage." },
    ],
    heroImage: img.comFloor,
    gallery: [
      { ...img.comLounge, layout: "wide", caption: "Lounge" },
      { ...img.comMeeting, layout: "pair", pairWith: img.comTable, caption: "Meeting and studio" },
      { ...img.comFacade, layout: "full", caption: "Facade study" },
    ],
    drawings: standardDrawings,
    visualizations: [img.visMassing],
    materials: [
      { name: "Fair-faced concrete", note: "Indicative", tone: "#a7a39b" },
      { name: "Oak veneer", note: "Indicative", tone: "#b48a5e" },
      { name: "Clear glass", note: "Indicative", tone: "#c9d0cd" },
      { name: "Wool felt", note: "Indicative", tone: "#5d5a55" },
    ],
    placeholder: true,
  },
  {
    slug: "hospitality",
    title: "Hospitality",
    category: "Hospitality",
    categorySlug: "hospitality",
    featured: true,
    typology: "Hospitality Interior",
    location: null,
    year: null,
    status: null,
    client: null,
    scope: ["Interior Design", "Lighting Concept", "3D Visualization"],
    summary: "Places of welcome, where atmosphere is designed as carefully as function.",
    description: [
      "In hospitality, the first impression is spatial — the volume of a room, the warmth of its light, the weight of a door handle.",
    ],
    approach: [
      { title: "Arrival", text: "A choreographed sequence from street to table or room." },
      { title: "Atmosphere", text: "Light designed in layers, so the room changes from day to night." },
      { title: "Durability", text: "Surfaces that withstand daily use and still feel generous." },
    ],
    heroImage: img.hosDining,
    gallery: [
      { ...img.hosReception, layout: "full", caption: "Reception" },
      { ...img.hosCurve, layout: "offset", caption: "Lobby" },
      { ...img.hosBar, layout: "pair", pairWith: img.hosCorridor, caption: "Bar and corridor" },
      { ...img.hosTable, layout: "wide", caption: "Lounge" },
    ],
    drawings: standardDrawings,
    visualizations: [img.visInterior],
    materials: [
      { name: "Smoked oak", note: "Indicative", tone: "#5b4331" },
      { name: "Honed marble", note: "Indicative", tone: "#d8d2c6" },
      { name: "Brass", note: "Indicative", tone: "#a68a55" },
      { name: "Linen", note: "Indicative", tone: "#cfc6b6" },
    ],
    placeholder: true,
  },
  {
    slug: "interior",
    title: "Interior",
    category: "Interior",
    categorySlug: "interior",
    featured: true,
    typology: "Interior Design",
    location: null,
    year: null,
    status: null,
    client: null,
    scope: ["Interior Design", "Furniture", "Lighting"],
    summary: "Rooms resolved to the detail — layout, material, light and the objects within.",
    description: [
      "An interior is experienced at arm’s length. Proportion, light and texture matter as much as the plan.",
    ],
    approach: [
      { title: "Light", text: "Natural light protected and drawn deeper into the room." },
      { title: "Joinery", text: "Storage and furniture built in, so the room stays calm." },
      { title: "Texture", text: "Plaster, timber and stone layered for warmth without clutter." },
    ],
    heroImage: img.intShadow,
    gallery: [
      { ...img.intArches, layout: "full", caption: "Arches" },
      { ...img.intSlats, layout: "portrait", caption: "Timber and light" },
      { ...img.intSkylight, layout: "pair", pairWith: img.intWindow, caption: "Skylight and window" },
      { ...img.intLiving, layout: "wide", caption: "Living" },
    ],
    drawings: standardDrawings,
    visualizations: [img.visInterior],
    materials: [
      { name: "Lime plaster", note: "Indicative", tone: "#e3dccf" },
      { name: "White oak", note: "Indicative", tone: "#c4a27a" },
      { name: "Travertine", note: "Indicative", tone: "#d4c3a8" },
      { name: "Bronze", note: "Indicative", tone: "#6e5638" },
    ],
    placeholder: true,
  },
  {
    slug: "retail",
    title: "Retail",
    category: "Retail",
    categorySlug: "retail",
    featured: false,
    typology: "Retail Space",
    location: null,
    year: null,
    status: null,
    client: null,
    scope: ["Interior Design", "Display Design", "3D Visualization"],
    summary: "Retail environments tuned to the product — circulation, display and light.",
    description: [
      "A shop is a stage for its product. The plan sets the pace of browsing; light and material set the tone of the brand.",
    ],
    approach: [
      { title: "Sequence", text: "A route that reveals the collection gradually." },
      { title: "Display", text: "Fixtures designed as architecture, not furniture." },
      { title: "Light", text: "Accent and ambient light balanced to flatter the product." },
    ],
    heroImage: img.retStore,
    gallery: [
      { ...img.retRail, layout: "portrait", caption: "Rail" },
      { ...img.retShelf, layout: "pair", pairWith: img.retDisplay, caption: "Shelving and display" },
    ],
    drawings: standardDrawings,
    visualizations: [img.visPavilion],
    materials: [
      { name: "Ash timber", note: "Indicative", tone: "#c7ab84" },
      { name: "Mineral plaster", note: "Indicative", tone: "#ddd6ca" },
      { name: "Blackened steel", note: "Indicative", tone: "#2f2e2c" },
    ],
    placeholder: true,
  },
  {
    slug: "visualization",
    title: "Visualization",
    category: "Visualization",
    categorySlug: "visualization",
    featured: false,
    typology: "3D Visualization",
    location: null,
    year: null,
    status: null,
    client: null,
    scope: ["3D Visualization", "Massing Studies", "Material Studies"],
    summary: "Seeing a space before it is built — form, light and material, tested in three dimensions.",
    description: [
      "Visualization turns drawings into experience. Massing, daylight and material can be judged by eye, long before construction begins.",
    ],
    approach: [
      { title: "Massing", text: "Early volumetric studies to test scale and placement." },
      { title: "Daylight", text: "Light studied through the day and across the seasons." },
      { title: "Material", text: "Finishes compared side by side in context." },
    ],
    heroImage: img.visModel,
    gallery: [
      { ...img.visMassing, layout: "full", caption: "Massing study" },
      { ...img.visPavilion, layout: "pair", pairWith: img.visHouse, caption: "Form studies" },
      { ...img.visInterior, layout: "wide", caption: "Interior study" },
    ],
    drawings: standardDrawings,
    visualizations: [img.visMassing, img.visPavilion],
    materials: [],
    placeholder: true,
  },
];

/**
 * Starting category list, mirrored by the database seed. Once the CMS is
 * connected, categories are managed in the admin panel instead.
 */
export const staticCategories = [
  { slug: "residential", name: "Residential" },
  { slug: "commercial", name: "Commercial" },
  { slug: "interior", name: "Interior" },
  { slug: "retail", name: "Retail" },
  { slug: "hospitality", name: "Hospitality" },
  { slug: "warehouse", name: "Warehouse" },
  { slug: "corporate", name: "Corporate" },
  { slug: "visualization", name: "Visualization" },
  { slug: "other", name: "Other" },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

/** Previous and next projects, wrapping around the list. */
export const getAdjacentProjects = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  const n = projects.length;
  return {
    previous: projects[(i - 1 + n) % n],
    next: projects[(i + 1) % n],
  };
};

export const projectIndex = (slug: string) => projects.findIndex((p) => p.slug === slug) + 1;
