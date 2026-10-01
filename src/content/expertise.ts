import type { Expertise } from "@/lib/types";
import { img } from "./images";

/** Services, in the order supplied by the studio. Descriptions avoid unverified claims. */
export const expertise: Expertise[] = [
  {
    id: "architecture",
    title: "Architecture",
    group: "Discipline",
    description:
      "Buildings conceived from the plan up — massing, structure, light and the way people move through them.",
    image: img.archColumns,
  },
  {
    id: "interior-design",
    title: "Interior Design",
    group: "Discipline",
    description: "Interiors resolved to the joint: layout, material, light and the furniture that completes a room.",
    image: img.resLounge,
  },
  {
    id: "corporate",
    title: "Corporate Spaces",
    group: "Typology",
    description: "Workplaces planned around how teams actually work — focus, collaboration, arrival and identity.",
    image: img.comMeeting,
  },
  {
    id: "retail",
    title: "Retail",
    group: "Typology",
    description: "Shops where circulation, display and light are tuned to the product and the brand.",
    image: img.retRail,
  },
  {
    id: "warehouses",
    title: "Warehouses",
    group: "Typology",
    description:
      "Industrial and storage buildings planned for clear spans, efficient movement and durable construction.",
    image: img.warehouse,
  },
  {
    id: "hospitality",
    title: "Hospitality",
    group: "Typology",
    description: "Hotels, restaurants and places of welcome, where atmosphere is designed as carefully as function.",
    image: img.hosReception,
  },
  {
    id: "residential",
    title: "Residential",
    group: "Typology",
    description: "Homes shaped around daily life — orientation, privacy, gathering, and rooms that age well.",
    image: img.resNight,
  },
  {
    id: "visualization",
    title: "3D Visualization",
    group: "Discipline",
    description: "Views of a space before it exists — so that form, light and material can be decided by seeing.",
    image: img.visHouse,
  },
  {
    id: "mcd",
    title: "MCD Work",
    group: "Approvals",
    description: "Architectural drawings and documentation prepared for Municipal Corporation of Delhi requirements.",
    image: img.blueprint,
  },
  {
    id: "licensing",
    title: "Licensing",
    group: "Approvals",
    description: "Design and documentation support for licensing-related work, prepared alongside the project.",
    image: img.drawingPencil,
  },
  {
    id: "vastu",
    title: "Vastu",
    group: "Planning",
    description: "Vastu-related considerations brought into orientation and layout, where a client seeks them.",
    image: img.intArches,
  },
];
