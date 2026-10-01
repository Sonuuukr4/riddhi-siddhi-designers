/**
 * Shared content types. Everything the site renders is described here so the
 * content layer (src/content/*) can later be swapped for a CMS without
 * touching components.
 */

export type ImageAsset = {
  /** Local path (e.g. "/images/projects/residential/hero.jpg") or remote URL. */
  src: string;
  alt: string;
  /** CSS object-position, e.g. "50% 30%". Defaults to centre. */
  position?: string;
  /** True while the asset is representative stock imagery, not studio work. */
  placeholder?: boolean;
  credit?: string;
};

export type GalleryLayout = "full" | "wide" | "portrait" | "pair" | "offset";

export type GalleryItem = ImageAsset & {
  layout: GalleryLayout;
  caption?: string;
  /** Second image, used when layout is "pair". */
  pairWith?: ImageAsset;
};

export type Drawing = {
  /** Sheet code shown in the title block, e.g. "A-101". */
  sheet: string;
  title: string;
  kind: "plan" | "section" | "elevation" | "detail";
  /** Leave undefined until a real drawing is available — a blank plate renders. */
  image?: ImageAsset;
};

export type Material = {
  name: string;
  note?: string;
  /** Swatch colour used until a material photograph is supplied. */
  tone: string;
  image?: ImageAsset;
};

export type ProjectCategory = "Residential" | "Commercial" | "Interior" | "Retail" | "Hospitality" | "Visualization";

export type Project = {
  slug: string;
  title: string;
  category: ProjectCategory;
  /** Longer category descriptor, e.g. "Residential Architecture". */
  typology: string;
  /** null renders as an em dash — never invent a location. */
  location: string | null;
  year: string | null;
  status: string | null;
  client: string | null;
  scope: string[];
  /** One line used on cards and in the index. */
  summary: string;
  description: string[];
  approach: { title: string; text: string }[];
  heroImage: ImageAsset;
  gallery: GalleryItem[];
  drawings: Drawing[];
  visualizations: ImageAsset[];
  materials: Material[];
  /** Marks the whole entry as a structural placeholder awaiting real content. */
  placeholder: boolean;
};

export type Expertise = {
  id: string;
  title: string;
  group: "Discipline" | "Typology" | "Approvals" | "Planning";
  description: string;
  image: ImageAsset;
};

export type Discipline = {
  id: string;
  label: string;
  description: string;
};

export type ProcessStep = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  /** Short drawing annotations shown on the process sheet. */
  notes: string[];
};

export type Principle = {
  id: string;
  word: string;
  line: string;
  image: ImageAsset;
};

export type VisualizationStage = {
  id: "concept" | "visualization" | "space";
  label: string;
  caption: string;
  /**
   * Optional dedicated image for this stage (e.g. a real sketch or render).
   * When omitted, the stage is derived from the base image with a filter.
   */
  image?: ImageAsset;
};
