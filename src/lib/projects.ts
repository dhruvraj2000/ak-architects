import type { Style } from "./houses";

/**
 * NOTE: Photography below is high-resolution stock architectural imagery used as
 * stand-ins. Replace the files in /public/images (same names) with photos of the
 * studio's own completed work; no code changes are required.
 */
export type ProjectType = "Residential" | "Commercial" | "Interiors";

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
  style: Style | "Corporate";
  location: string;
  year: string;
  area: string;
  scope: string;
  image: string;
  /** extra images shown in the lightbox */
  gallery: string[];
  /** layout hint for the masonry grid */
  tall?: boolean;
}

const img = (n: string) => `/images/${n}.webp`;

export const PROJECTS: Project[] = [
  { id: "canopy", title: "Canopy House", type: "Residential", style: "Modern", location: "Jaipur", year: "2025", area: "3,400 sq ft", scope: "Planning · Elevation · Interiors",
    image: img("hero-tree-house"), gallery: [img("hero-tree-house"), img("noir-pavilion"), img("int-lounge"), img("int-kitchen")], tall: true },
  { id: "sky", title: "Sky Villa", type: "Residential", style: "Luxury", location: "Nathdwara", year: "2025", area: "5,800 sq ft", scope: "Full architecture · Vastu",
    image: img("hero-white-villa"), gallery: [img("hero-white-villa"), img("hero-villa-pool"), img("int-open"), img("int-bed")] },
  { id: "noir", title: "Noir Pavilion", type: "Residential", style: "Modern", location: "Udaipur", year: "2024", area: "2,900 sq ft", scope: "Elevation · Interiors",
    image: img("noir-pavilion"), gallery: [img("noir-pavilion"), img("timber-white"), img("int-dining")] },
  { id: "pool", title: "Pool Residence", type: "Residential", style: "Contemporary", location: "Kota", year: "2024", area: "4,200 sq ft", scope: "Planning · Landscape",
    image: img("hero-pool-house"), gallery: [img("hero-pool-house"), img("pool-pavilion"), img("int-lounge")], tall: true },
  { id: "terrace", title: "Terrace Residence", type: "Residential", style: "Contemporary", location: "Jaipur", year: "2024", area: "3,100 sq ft", scope: "Elevation · Interiors",
    image: img("timber-white"), gallery: [img("timber-white"), img("hillside-timber"), img("int-warm")] },
  { id: "courtyard", title: "Courtyard House", type: "Residential", style: "Contemporary", location: "Bhilwara", year: "2023", area: "2,600 sq ft", scope: "Vastu · Planning",
    image: img("courtyard-white"), gallery: [img("courtyard-white"), img("pool-pavilion"), img("int-stair")] },
  { id: "chalet", title: "Rajwada Chalet", type: "Residential", style: "Traditional", location: "Mount Abu", year: "2024", area: "3,600 sq ft", scope: "Planning · Elevation",
    image: img("chalet-dusk"), gallery: [img("chalet-dusk"), img("sunset-lodge"), img("int-warm")], tall: true },
  { id: "manor", title: "Stone Manor", type: "Residential", style: "Traditional", location: "Udaipur", year: "2023", area: "4,000 sq ft", scope: "Full architecture",
    image: img("stone-manor"), gallery: [img("stone-manor"), img("colonial-pool"), img("int-gallery")] },
  { id: "colonial", title: "Veranda Estate", type: "Residential", style: "Luxury", location: "Chittorgarh", year: "2023", area: "6,200 sq ft", scope: "Architecture · Landscape",
    image: img("colonial-pool"), gallery: [img("colonial-pool"), img("sunset-lodge"), img("int-bed")] },
  { id: "loft", title: "Atelier Loft Office", type: "Commercial", style: "Corporate", location: "Jaipur", year: "2025", area: "6,500 sq ft", scope: "Interior fit-out · Planning",
    image: img("com-loft"), gallery: [img("com-loft"), img("com-office")], tall: true },
  { id: "tower", title: "Meridian Commercial Tower", type: "Commercial", style: "Corporate", location: "Udaipur", year: "2024", area: "48,000 sq ft", scope: "Elevation · Planning",
    image: img("com-towers"), gallery: [img("com-towers"), img("com-facade"), img("com-angular")] },
  { id: "block", title: "Urban Residences", type: "Commercial", style: "Corporate", location: "Kota", year: "2024", area: "22,000 sq ft", scope: "Planning · Elevation",
    image: img("com-block"), gallery: [img("com-block"), img("com-facade")] },
  { id: "kitchen", title: "Linear Kitchen", type: "Interiors", style: "Modern", location: "Nathdwara", year: "2025", area: "420 sq ft", scope: "Interior design",
    image: img("int-kitchen"), gallery: [img("int-kitchen"), img("int-dining"), img("int-open")] },
  { id: "green", title: "Emerald Lounge", type: "Interiors", style: "Contemporary", location: "Jaipur", year: "2025", area: "680 sq ft", scope: "Interior styling",
    image: img("int-green"), gallery: [img("int-green"), img("int-gallery"), img("int-warm")], tall: true },
  { id: "spa", title: "Spa Bath Suite", type: "Interiors", style: "Luxury", location: "Udaipur", year: "2024", area: "260 sq ft", scope: "Interior design",
    image: img("int-bath"), gallery: [img("int-bath"), img("int-bed")] },
];

export interface Testimonial { quote: string; name: string; role: string }

/** PLACEHOLDER copy: replace with real client feedback before launch. */
export const TESTIMONIALS: Testimonial[] = [
  { quote: "They understood our plot, our family and our vastu needs on the very first visit. The 3D walkthrough meant there were no surprises when construction began.",
    name: "Client name", role: "Villa, Udaipur" },
  { quote: "The elevation completely changed how our house feels from the street. Every material was shown to us in advance, and the site team followed it faithfully.",
    name: "Client name", role: "Residence, Nathdwara" },
  { quote: "Clear communication, tidy drawings and an interior that works for daily life. We never felt lost in the process.",
    name: "Client name", role: "Apartment interiors, Jaipur" },
];
