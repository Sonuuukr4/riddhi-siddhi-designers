import type { ImageAsset } from "@/lib/types";

/**
 * Image registry.
 *
 * Every image on the site is defined here once and referenced by key, so
 * replacing placeholder photography is a one-file change:
 *
 *   1. Drop the studio's own image into /public/images/<folder>/
 *   2. Change `src` below to the local path, e.g. "/images/projects/residential/hero.jpg"
 *   3. Update `alt` and remove `placeholder: true`
 *
 * All current images are representative stock photography from Unsplash
 * (unsplash.com/license) and are NOT work by Riddhi Siddhi Designers.
 */

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;

const stock = (id: string, alt: string, position?: string): ImageAsset => ({
  src: unsplash(id),
  alt,
  position,
  placeholder: true,
  credit: "Unsplash",
});

export const img = {
  /* — Hero ———————————————————————————————— /images/hero/ */
  heroSpace: stock("1542359498-13ebad248020", "A figure walking beneath a sequence of curved concrete ribs", "50% 55%"),
  heroForm: stock(
    "1682681857663-7a5cf876ad1a",
    "A cantilevered concrete house hovering over a landscaped plinth",
    "50% 45%",
  ),
  heroLight: stock(
    "1774721505292-111198a5aced",
    "Light falling through a carved stone jaali into a dark room",
    "50% 50%",
  ),

  /* — Residential ———————————————————————— /images/projects/residential/ */
  resCourtyard: stock(
    "1711963224442-f6eb1329e8c6",
    "Brick walls and a tree around an open courtyard in a contemporary house",
  ),
  resJaaliLiving: stock("1711963225994-e34c729579f9", "A living room framed by a brick jaali shelf wall"),
  resScreen: stock("1711963224486-99a19022f305", "A perforated brick screen beside a planted courtyard"),
  resLounge: stock("1711963225980-dbc5adcf2e0d", "A white sofa set against timber shelving and exposed brick"),
  resStair: stock("1601993957728-1e56ab70c5a8", "A plastered stair rising towards soft daylight"),
  resVolume: stock("1628012209120-d9db7abf7eab", "White cubic volumes of a contemporary house against the sky"),
  resNight: stock("1600585153490-76fb20a32601", "A dark timber house with tall lit openings at dusk"),

  /* — Commercial —————————————————————————— /images/projects/commercial/ */
  comFloor: stock("1643267514395-b36b3f7e8281", "An open workplace with a long glazed wall facing greenery"),
  comLounge: stock("1705909770198-7e83c24e1616", "A quiet work lounge with sculptural chairs and timber"),
  comMeeting: stock("1693625700727-b548ca8f5679", "A meeting room with a long table and floor-to-ceiling glass"),
  comTable: stock("1497366616365-e78dd380d3dd", "A concrete-walled studio space with a long shared table"),
  comFacade: stock("1496236436299-cde70e3587cf", "A facade of deep vertical fins casting hard shadows"),

  /* — Interior ———————————————————————————— /images/projects/interior/ */
  intShadow: stock("1711891391309-c1f93b463c7e", "A calm room crossed by geometric bands of light and shadow"),
  intSlats: stock("1700809887581-c41c239e808e", "Timber slats and a single pendant light in a warm interior"),
  intSkylight: stock("1590411255052-ea52fd44c531", "A chair beneath a shaft of light from a skylight"),
  intWindow: stock("1610123172763-1f587473048f", "A living space with a large window and low warm furniture"),
  intArches: stock("1704458162479-42b5e0023c39", "Lime-plastered arches and timber doors in soft light"),
  intLiving: stock("1618221195710-dd6b41faaea6", "A neutral living room with low furniture and natural textures"),

  /* — Retail —————————————————————————————— /images/projects/retail/ */
  retStore: stock("1718985342149-7178154e0aee", "A retail interior with timber shelving and hanging garments"),
  retRail: stock("1769107805465-bfd41863f1a0", "A minimal garment rail against a pale plaster wall"),
  retShelf: stock("1769107805412-90d9191d53e9", "Floating white shelves holding a few objects"),
  retDisplay: stock("1644562278850-0181eb7f587a", "Backlit timber display shelving in a boutique"),

  /* — Hospitality ————————————————————————— /images/projects/hospitality/ */
  hosDining: stock("1650490534612-d9ba46776916", "A low-lit dining room under a slatted timber ceiling"),
  hosReception: stock("1660557989695-14fac79c086d", "A stone reception desk with warm, low lighting"),
  hosCurve: stock("1759038086832-795644825e3a", "A curved timber wall wrapping a hotel lobby"),
  hosBar: stock("1650490632010-e18cbb694dd1", "A dark bar interior with warm wall lighting"),
  hosCorridor: stock("1558277872-bb3f50054da2", "A long, softly lit hotel corridor"),
  hosTable: stock("1628630468252-a086c2bc7255", "A live-edge timber table in a hotel lounge"),

  /* — Visualization ——————————————————————— /images/projects/visualization/ */
  visModel: stock("1631454965644-00510875561f", "A timber architectural model with angled fins on a dark ground"),
  visMassing: stock("1672669092491-ac5a210747bc", "A white massing model of a cluster of buildings"),
  visPavilion: stock("1653164488636-7407bec89281", "A white model of a cantilevered pavilion"),
  visInterior: stock("1735448213858-6bdfdf78967a", "A white interior model showing layered screens and openings"),
  visHouse: stock("1653164494885-a8526f62678c", "A white model house on a pale base"),

  /* — Expertise / principles —————————————— /images/studio/ */
  archColumns: stock("1569258592171-357ea26da4df", "Angled concrete columns meeting a concrete soffit"),
  warehouse: stock("1557761469-f29c6e201784", "A long industrial shed with a ribbon of high windows"),
  blueprint: stock("1721244654392-9c912a6eb236", "Blueprint elevations and sections of a building"),
  drawingPencil: stock("1542621334-a254cf47733d", "A pencil resting on a dimensioned architectural drawing"),
  lightJaali: stock("1641803187045-2885879ec5a1", "Sunlight through a sandstone jaali casting patterned shadow"),
  proportionModel: stock("1653164579768-ea97833b3b03", "A white model of a facade with three tall openings"),
  materialConcrete: stock("1565626424178-c699f6601afd", "Board-marked concrete volumes in raking light"),
  contextSandstone: stock("1698459316110-61346c5fd6ae", "Red sandstone galleries around a courtyard with a tree"),
  detailJaali: stock("1783456310361-ba537c7d7a66", "Close view of a hexagonal stone lattice glowing with light"),
  shadowPalm: stock("1571327352610-1c5484ccc840", "Palm shadows on a warm plaster wall beside a timber shutter"),
  concretePlanes: stock("1579724175242-0204ecac28cb", "Concrete planes and steps in soft directional light"),

  /* — Studio leadership ————————————————— /images/studio/ — supplied by the studio, not placeholders */
  neerajPortrait: {
    src: "/images/studio/neeraj-portrait.jpg",
    alt: "Neeraj Ji seated at his desk in the Riddhi Siddhi Designers studio, architectural drawings in front of him",
    position: "50% 30%",
  },
  neerajStudio: {
    src: "/images/studio/neeraj-studio.jpg",
    alt: "Neeraj Ji in the Riddhi Siddhi Designers studio, with an architectural model on the shelves behind",
    position: "50% 35%",
  },
  neerajHeadshot: {
    src: "/images/studio/neeraj-headshot.jpg",
    alt: "Portrait of Neeraj Ji, Riddhi Siddhi Designers",
  },

  /* — Studio ——————————————————————————————— /images/studio/ */
  studioDesk: stock("1598368195835-91e67f80c9d7", "A hand drawing a plan at a timber desk"),
  studioModel: stock("1603901622056-0a5bee231395", "Architectural drawings with drafting tools"),

  /* — Visualization comparison ——————————— /images/visualization/ */
  vizSpace: stock("1600607687939-ce8a6c25118c", "A bright living space with full-height glazing and low furniture"),
} satisfies Record<string, ImageAsset>;
