/**
 * Parametric house data. Units are metres. Plan x = east, plan y = south (down on the plan).
 * The same data drives the 2D SVG floor plan and the 3D model.
 */

export type Style = "Modern" | "Contemporary" | "Traditional" | "Luxury";
export type FloorMat = "wood" | "tile" | "marble" | "stone" | "terracotta";
export type FurnType =
  | "bed" | "sofa" | "armchair" | "coffee" | "dining" | "counter" | "island"
  | "wardrobe" | "desk" | "wc" | "basin" | "shower" | "tub" | "plant" | "rug"
  | "stairs" | "tvunit" | "pooja" | "bench";

export interface Furn {
  t: FurnType;
  /** centre */ x: number;
  y: number;
  /** footprint before rotation */ w: number;
  d: number;
  /** clockwise degrees (plan view). 0 = back to north wall */ r: number;
  /** chairs for dining */ n?: number;
}

export interface Room {
  id: string;
  name: string;
  x: number; y: number; w: number; h: number;
  floor: FloorMat;
  furniture: Furn[];
  /** rectangular hole in this room's floor slab (stair opening) */
  hole?: { x: number; y: number; w: number; h: number };
}

export type OpeningKind = "door" | "arch" | "window" | "glass";
export interface OpeningDef { x: number; y: number; w: number; kind: OpeningKind; sill?: number; h?: number; f?: 1 | -1 }
export interface Opening extends OpeningDef { at: number; sill: number; h: number }

export type Side = "N" | "E" | "S" | "W";
export interface Wall {
  x1: number; y1: number; x2: number; y2: number;
  ext: boolean; side?: Side; horizontal: boolean;
  openings: Opening[];
}

export type Cladding = "wood" | "stone" | "brick" | "slate";
export interface RoofDef {
  type: "flat" | "hip";
  x: number; y: number; w: number; h: number;
  /** overhang N, E, S, W */ ov: [number, number, number, number];
  /** columns along south edge (veranda) */ columns?: number;
}
export interface Floor {
  id: string; label: string;
  rooms: Room[]; walls: Wall[];
  roofs: RoofDef[];
  accents: { side: Side; mat: Cladding }[];
}
export interface Outdoor { kind: "deck" | "pool" | "path"; x: number; y: number; w: number; h: number }

export interface House {
  id: string; name: string; style: Style; location: string; blurb: string;
  photo: string;
  floors: Floor[];
  outdoors: Outdoor[];
  bounds: { x: number; y: number; w: number; h: number };
  area: number; beds: number; baths: number; plot: string;
  palette: { render: string; trim: string; frame: string; roof: string; timber: string };
}

/* ───────────────────────── builders ───────────────────────── */

const T = 0.12;
let uid = 0;

function against(room: Pick<Room, "x" | "y" | "w" | "h">, wall: Side, t: FurnType, w: number, d: number, off = 0, n?: number): Furn {
  switch (wall) {
    case "N": return { t, w, d, r: 0, n, x: room.x + room.w / 2 + off, y: room.y + T + d / 2 };
    case "S": return { t, w, d, r: 180, n, x: room.x + room.w / 2 + off, y: room.y + room.h - T - d / 2 };
    case "E": return { t, w, d, r: 90, n, x: room.x + room.w - T - d / 2, y: room.y + room.h / 2 + off };
    default: return { t, w, d, r: 270, n, x: room.x + T + d / 2, y: room.y + room.h / 2 + off };
  }
}
const at = (t: FurnType, x: number, y: number, w: number, d: number, r = 0, n?: number): Furn => ({ t, x, y, w, d, r, n });

type Rect = { x: number; y: number; w: number; h: number };
function R(
  name: string, x: number, y: number, w: number, h: number, floor: FloorMat,
  furnish: (r: Rect) => Furn[] = () => [], hole?: Rect,
): Room {
  return { id: `r${uid++}`, name, x, y, w, h, floor, furniture: furnish({ x, y, w, h }), hole };
}

const D = (x: number, y: number, w = 0.9, f: 1 | -1 = 1): OpeningDef => ({ x, y, w, kind: "door", f });
const A = (x: number, y: number, w = 1.2): OpeningDef => ({ x, y, w, kind: "arch" });
const W = (x: number, y: number, w = 1.2, sill = 0.9, h = 1.3): OpeningDef => ({ x, y, w, kind: "window", sill, h });
const G = (x: number, y: number, w = 2.4): OpeningDef => ({ x, y, w, kind: "glass", sill: 0.05, h: 2.6 });

const r2 = (v: number) => Math.round(v * 100) / 100;

function buildWalls(rooms: Room[], defs: OpeningDef[]): Wall[] {
  type Iv = { a: number; b: number; room: Room };
  const H = new Map<number, Iv[]>();
  const V = new Map<number, Iv[]>();
  const push = (m: Map<number, Iv[]>, k: number, iv: Iv) => {
    const key = r2(k);
    if (!m.has(key)) m.set(key, []);
    m.get(key)!.push(iv);
  };
  for (const r of rooms) {
    push(H, r.y, { a: r.x, b: r.x + r.w, room: r });
    push(H, r.y + r.h, { a: r.x, b: r.x + r.w, room: r });
    push(V, r.x, { a: r.y, b: r.y + r.h, room: r });
    push(V, r.x + r.w, { a: r.y, b: r.y + r.h, room: r });
  }
  const walls: Wall[] = [];
  const sweep = (m: Map<number, Iv[]>, horizontal: boolean) => {
    for (const [line, ivs] of m) {
      const pts = [...new Set(ivs.flatMap((i) => [r2(i.a), r2(i.b)]))].sort((p, q) => p - q);
      let prev: Wall | null = null;
      for (let k = 0; k < pts.length - 1; k++) {
        const p = pts[k], q = pts[k + 1];
        const cover = ivs.filter((i) => r2(i.a) <= p && r2(i.b) >= q);
        if (!cover.length) { prev = null; continue; }
        const ext = cover.length === 1;
        let side: Side | undefined;
        if (ext) {
          const rm = cover[0].room;
          side = horizontal ? (rm.y + rm.h / 2 > line ? "N" : "S") : (rm.x + rm.w / 2 > line ? "W" : "E");
        }
        if (prev && prev.ext === ext && prev.side === side && (horizontal ? prev.x2 === p : prev.y2 === p)) {
          if (horizontal) prev.x2 = q; else prev.y2 = q;
        } else {
          prev = horizontal
            ? { x1: p, y1: line, x2: q, y2: line, ext, side, horizontal, openings: [] }
            : { x1: line, y1: p, x2: line, y2: q, ext, side, horizontal, openings: [] };
          walls.push(prev);
        }
      }
    }
  };
  sweep(H, true);
  sweep(V, false);

  for (const o of defs) {
    const wall = walls.find((w) => {
      if (w.horizontal) return Math.abs(o.y - w.y1) < 0.02 && o.x >= w.x1 - 0.01 && o.x <= w.x2 + 0.01;
      return Math.abs(o.x - w.x1) < 0.02 && o.y >= w.y1 - 0.01 && o.y <= w.y2 + 0.01;
    });
    if (!wall) {
      if (process.env.NODE_ENV !== "production") console.warn("Opening has no wall", o);
      continue;
    }
    const at = wall.horizontal ? o.x - wall.x1 : o.y - wall.y1;
    const isGlass = o.kind === "glass";
    wall.openings.push({
      ...o, at,
      sill: o.sill ?? (o.kind === "window" ? 0.9 : 0),
      h: o.h ?? (isGlass ? 2.6 : o.kind === "window" ? 1.3 : 2.1),
    });
  }
  return walls;
}

function floor(id: string, label: string, rooms: Room[], defs: OpeningDef[], roofs: RoofDef[], accents: Floor["accents"] = []): Floor {
  return { id, label, rooms, walls: buildWalls(rooms, defs), roofs, accents };
}

function finish(h: Omit<House, "bounds" | "area" | "beds" | "baths">): House {
  const all = h.floors.flatMap((f) => f.rooms);
  const g = h.floors[0].rooms;
  const minX = Math.min(...g.map((r) => r.x)), minY = Math.min(...g.map((r) => r.y));
  const maxX = Math.max(...g.map((r) => r.x + r.w)), maxY = Math.max(...g.map((r) => r.y + r.h));
  const sq = all.reduce((s, r) => s + r.w * r.h, 0) * 10.764;
  const beds = all.filter((r) => /bed|master|guest/i.test(r.name) && !/bath/i.test(r.name)).length;
  const baths = all.filter((r) => /bath|powder/i.test(r.name)).length;
  return { ...h, bounds: { x: minX, y: minY, w: maxX - minX, h: maxY - minY }, area: Math.round(sq / 50) * 50, beds, baths };
}

/* ───────────────────────── 1 · MODERN ───────────────────────── */

const modern = finish({
  id: "aarav",
  name: "Aarav Residence",
  style: "Modern",
  location: "Udaipur, Rajasthan",
  blurb: "A crisp two-storey box in white render and warm timber, with a generous terrace and floor-to-ceiling glazing.",
  photo: "/images/hero-tree-house.webp",
  plot: "40 × 60 ft",
  palette: { render: "#ece8df", trim: "#d9d3c6", frame: "#1d1f22", roof: "#cfcac0", timber: "#9a6a43" },
  outdoors: [{ kind: "deck", x: 0.4, y: 10.05, w: 6.2, h: 1.9 }],
  floors: [
    floor("g", "Ground Floor", [
      R("Living", 0, 0, 7, 5.2, "wood", () => [
        at("rug", 2.4, 2.6, 3.2, 2.4), at("tvunit", 2.0, 0.34, 2.0, 0.42, 0),
        at("sofa", 2.4, 3.9, 2.6, 0.95, 180), at("coffee", 2.4, 2.5, 1.1, 0.6, 90),
        at("armchair", 5.9, 2.4, 0.85, 0.85, 90), at("plant", 6.4, 0.6, 0.5, 0.5),
        at("pooja", 0.5, 4.5, 0.9, 0.45, 270),
      ]),
      R("Dining", 0, 5.2, 7, 4.8, "wood", (r) => [
        at("dining", 3.2, 7.7, 2.0, 1.0, 0, 6), against(r, "E", "counter", 1.8, 0.45, 1.0),
        at("plant", 0.55, 9.35, 0.5, 0.5),
      ]),
      R("Kitchen", 7, 0, 5, 3.8, "tile", (r) => [
        against(r, "S", "counter", 4.6, 0.62), at("island", 9.6, 1.8, 2.1, 0.9, 0),
      ]),
      R("Stair Hall", 7, 3.8, 5, 2.2, "wood", () => [at("stairs", 9.7, 4.4, 4.2, 1.0, 180)]),
      R("Guest Bed", 7, 6, 3.4, 4, "wood", (r) => [
        against(r, "W", "bed", 1.7, 2.0, 0), against(r, "E", "wardrobe", 1.4, 0.6, 0.1),
      ]),
      R("Bath", 10.4, 6, 1.6, 2.2, "tile", (r) => [
        against(r, "E", "wc", 0.4, 0.7, -0.2), against(r, "N", "basin", 0.5, 0.4, 0.3),
        against(r, "S", "shower", 0.9, 0.9, 0),
      ]),
      R("Utility", 10.4, 8.2, 1.6, 1.8, "tile", (r) => [against(r, "E", "wardrobe", 1.2, 0.4, 0)]),
    ], [
      D(2.0, 10, 1.3), G(5.3, 10, 2.4), W(0, 7.6, 2.0), G(0, 2.6, 2.6), W(5.5, 0, 2.4), W(9.5, 0, 1.8), W(12, 1.9, 1.2),
      W(8.7, 10, 1.8), W(12, 7.1, 0.6, 1.5, 0.6),
      A(3.5, 5.2, 3.4), D(7, 1.5), A(7, 5.0, 1.2), D(8.0, 6), D(10.4, 7.0, 0.8), D(10.4, 9.2, 0.8),
    ], [{ type: "flat", x: 0, y: 6, w: 12, h: 4, ov: [0, 0.3, 0.3, 0.3] }], [{ side: "S", mat: "wood" }]),
    floor("u", "First Floor", [
      R("Master Bedroom", 0, 0, 7, 4.2, "wood", (r) => [
        at("rug", 5.2, 2.1, 3, 2.4), against(r, "E", "bed", 1.9, 2.1, 0), against(r, "S", "wardrobe", 2.0, 0.6, -0.3),
        at("armchair", 1.2, 1.0, 0.85, 0.85, 135), at("plant", 6.5, 0.5, 0.5, 0.5),
      ]),
      R("Master Bath", 0, 4.2, 3, 1.8, "tile", (r) => [
        against(r, "W", "tub", 1.5, 0.75, 0), against(r, "E", "wc", 0.4, 0.7, 0), against(r, "N", "shower", 0.9, 0.9, 0.8),
        against(r, "S", "basin", 0.5, 0.4, 0.6),
      ]),
      R("Dressing", 3, 4.2, 4, 1.8, "wood", (r) => [against(r, "S", "wardrobe", 3.2, 0.6, 0)]),
      R("Bedroom 2", 7, 0, 3.4, 3.8, "wood", (r) => [
        against(r, "W", "bed", 1.7, 2.1, 0), against(r, "S", "wardrobe", 1.4, 0.6, 0.7),
      ]),
      R("Bath 2", 10.4, 0, 1.6, 2.4, "tile", (r) => [
        against(r, "E", "wc", 0.4, 0.7, 0.6), against(r, "N", "basin", 0.5, 0.4, -0.3), against(r, "S", "shower", 0.9, 0.9, -0.2),
      ]),
      R("Store", 10.4, 2.4, 1.6, 1.4, "tile", (r) => [against(r, "E", "wardrobe", 1.0, 0.4, 0)]),
      R("Landing", 7, 3.8, 5, 2.2, "wood", () => [at("plant", 11.5, 5.5, 0.5, 0.5), at("bench", 8.5, 5.7, 1.4, 0.4, 180)],
        { x: 7.6, y: 3.9, w: 4.2, h: 1.0 }),
    ], [
      W(3.5, 0, 3.0), G(0, 2.1, 2.4), W(1.5, 6, 0.8, 1.3, 0.8), W(8.7, 0, 2.2), W(11.2, 0, 0.6, 1.5, 0.6),
      G(9.5, 6, 3.0), W(12, 5, 1.2),
      D(1.3, 4.2, 0.8), D(5, 4.2), D(7, 5.1), D(8.2, 3.8), D(10.4, 1.2, 0.8), D(10.4, 3.1, 0.8),
    ], [{ type: "flat", x: 0, y: 0, w: 12, h: 6, ov: [0.3, 0.3, 0.3, 0.3] }], [{ side: "E", mat: "wood" }]),
  ],
});

/* ───────────────────────── 2 · CONTEMPORARY ───────────────────────── */

const contemporary = finish({
  id: "meera",
  name: "Meera Courtyard Villa",
  style: "Contemporary",
  location: "Jaipur, Rajasthan",
  blurb: "An L-shaped plan wraps a pool deck. Stone, timber and deep overhangs frame long views from every living space.",
  photo: "/images/hero-pool-house.webp",
  plot: "50 × 70 ft",
  palette: { render: "#e7e1d4", trim: "#cfc7b6", frame: "#25272a", roof: "#bdb6a8", timber: "#8a5a38" },
  outdoors: [
    { kind: "deck", x: 7.05, y: 6.05, w: 6.45, h: 4.95 },
    { kind: "pool", x: 8.2, y: 7.5, w: 4.4, h: 2.6 },
    { kind: "path", x: 0.9, y: 11.05, w: 1.7, h: 3.5 },
  ],
  floors: [
    floor("g", "Ground Floor", [
      R("Living", 0, 0, 6.5, 6, "wood", () => [
        at("stairs", 2.1, 5.2, 3.6, 1.0, 0),
        at("rug", 3.8, 2.9, 3, 2.6), at("sofa", 3.2, 2.9, 2.4, 0.95, 270), at("coffee", 4.3, 2.9, 1.1, 0.6, 90),
        at("tvunit", 6.28, 2.9, 1.6, 0.4, 90), at("armchair", 4.6, 0.9, 0.85, 0.85, 200), at("plant", 0.5, 0.5, 0.5, 0.5), at("plant", 6.0, 0.5, 0.5, 0.5),
      ]),
      R("Kitchen", 6.5, 0, 4, 3.2, "tile", (r) => [against(r, "N", "counter", 2.1, 0.62, -0.85), at("island", 8.6, 1.8, 1.8, 0.9, 0)]),
      R("Dining", 6.5, 3.2, 4, 2.8, "wood", () => [at("dining", 8.5, 4.6, 1.9, 1.0, 0, 6)]),
      R("Study", 10.5, 0, 3, 3.2, "wood", (r) => [against(r, "N", "desk", 1.6, 0.65, 0), against(r, "S", "wardrobe", 1.4, 0.4, -0.6)]),
      R("Powder", 10.5, 3.2, 1.4, 2.8, "tile", (r) => [against(r, "E", "wc", 0.4, 0.7, 0.6), against(r, "W", "basin", 0.5, 0.4, 0.9)]),
      R("Pooja", 11.9, 3.2, 1.6, 2.8, "marble", (r) => [against(r, "S", "pooja", 1.0, 0.5, 0)]),
      R("Foyer", 0, 6, 3.5, 5, "marble", (r) => [against(r, "E", "bench", 1.1, 0.4, 1.3), at("plant", 0.5, 10.4, 0.5, 0.5)]),
      R("Guest Bed", 3.5, 6, 3.5, 3.6, "wood", (r) => [
        against(r, "N", "bed", 1.7, 2.1, 0.8), at("wardrobe", 3.95, 6.85, 1.4, 0.6, 270),
      ]),
      R("Guest Bath", 3.5, 9.6, 3.5, 1.4, "tile", (r) => [
        against(r, "W", "wc", 0.4, 0.7, 0), against(r, "N", "basin", 0.5, 0.4, -0.95), against(r, "E", "shower", 0.9, 0.9, 0),
      ]),
    ], [
      D(1.75, 11, 1.2), A(1.75, 6, 1.6), D(6.5, 1.5), A(6.5, 4.6, 1.6), A(8.5, 3.2, 1.2), D(10.5, 1.6), D(12.7, 3.2),
      D(3.5, 8, 0.9), D(5.25, 9.6, 0.8), D(10.5, 4.8, 0.8),
      G(3.2, 0, 4.0), G(0, 1.8, 2.4), W(9.5, 0, 1.6), W(12, 0, 1.8), W(13.5, 1.6, 1.6), W(0, 8.5, 0.9, 0.5, 1.8),
      G(7, 7.8, 2.4), W(7, 10.3, 0.6, 1.5, 0.6), W(5.25, 11, 0.8, 1.3, 0.8), W(11.2, 6, 0.5, 1.5, 0.6), G(8.5, 6, 3.2),
    ], [{ type: "flat", x: 0, y: 6, w: 7, h: 5, ov: [0, 0.6, 0.6, 0.4] }], [{ side: "W", mat: "stone" }, { side: "S", mat: "stone" }]),
    floor("u", "First Floor", [
      R("Master Bedroom", 0, 0, 5, 4.2, "wood", (r) => [
        at("rug", 2.4, 2.4, 3, 2.6), against(r, "N", "bed", 1.9, 2.1, 0), against(r, "E", "wardrobe", 1.4, 0.6, 0.9),
        against(r, "S", "desk", 1.4, 0.6, -1.5),
      ]),
      R("Master Bath", 5, 0, 2, 4.2, "tile", (r) => [
        against(r, "E", "tub", 1.7, 0.75, -1.0), against(r, "E", "wc", 0.4, 0.7, 0.45),
        against(r, "E", "shower", 0.9, 0.9, 1.5), against(r, "S", "basin", 0.5, 0.4, 0),
      ]),
      R("Bedroom 2", 7, 0, 3.5, 4.2, "wood", (r) => [against(r, "N", "bed", 1.7, 2.1, 0), against(r, "E", "wardrobe", 1.6, 0.6, 1.0)]),
      R("Lounge", 10.5, 0, 3, 4.2, "wood", (r) => [
        against(r, "W", "sofa", 2.2, 0.95, 0), at("coffee", 12.0, 2.1, 1.0, 0.6, 90), at("armchair", 12.9, 3.3, 0.85, 0.85, 200), at("plant", 13.0, 0.6, 0.5, 0.5),
      ]),
      R("Stair Void", 0, 4.2, 3.9, 1.8, "wood", () => [], { x: 0.3, y: 4.7, w: 3.6, h: 1.0 }),
      R("Corridor", 3.9, 4.2, 9.6, 1.8, "wood", () => [at("plant", 13.0, 5.5, 0.5, 0.5), at("bench", 8.5, 5.7, 1.5, 0.4, 180)]),
    ], [
      W(2.5, 0, 2.8), G(0, 2.0, 2.2), W(6, 0, 0.6, 1.5, 0.6), W(8.75, 0, 2.0), W(12, 0, 2.4), G(13.5, 2.1, 2.4),
      G(2, 6, 2.5), G(8.5, 6, 4.0), W(13.5, 5.1, 1.0),
      D(5, 2.0, 0.8), D(4.4, 4.2, 0.8), D(9.0, 4.2), D(12, 4.2),
    ], [{ type: "flat", x: 0, y: 0, w: 13.5, h: 6, ov: [0.5, 0.5, 0.6, 0.5] }], [{ side: "E", mat: "wood" }, { side: "N", mat: "stone" }]),
  ],
});

/* ───────────────────────── 3 · TRADITIONAL ───────────────────────── */

const traditional = finish({
  id: "haveli",
  name: "Rajwada Haveli Home",
  style: "Traditional",
  location: "Nathdwara, Rajasthan",
  blurb: "A vastu-aligned family home under a terracotta hip roof, with a deep veranda, pooja room and warm, earthen finishes.",
  photo: "/images/chalet-dusk.webp",
  plot: "45 × 55 ft",
  palette: { render: "#e8d7bd", trim: "#f2e8d5", frame: "#5a3a22", roof: "#a4502e", timber: "#6e4528" },
  outdoors: [{ kind: "deck", x: 1.5, y: 9.05, w: 11, h: 2.0 }, { kind: "path", x: 6.0, y: 11.1, w: 1.5, h: 3.4 }],
  floors: [
    floor("g", "Ground Floor", [
      R("Bedroom", 0, 0, 4, 4.5, "terracotta", (r) => [
        against(r, "S", "bed", 1.8, 2.1, 0), against(r, "N", "wardrobe", 1.2, 0.6, 1.2), at("plant", 0.5, 0.5, 0.5, 0.5),
      ]),
      R("Dining", 4, 0, 4.5, 4.5, "terracotta", () => [at("dining", 6.25, 2.1, 2.0, 1.0, 0, 6), at("plant", 4.6, 0.6, 0.5, 0.5)]),
      R("Kitchen", 8.5, 0, 5.5, 4.5, "tile", (r) => [against(r, "N", "counter", 4.4, 0.62, 0), at("island", 11.2, 2.4, 2.0, 0.9, 0)]),
      R("Drawing Room", 0, 4.5, 4.5, 4.5, "terracotta", () => [
        at("rug", 2.25, 6.8, 3, 2.2), at("sofa", 2.25, 5.35, 2.6, 0.95, 0), at("coffee", 2.25, 6.6, 1.1, 0.6, 0),
        at("armchair", 0.8, 7.2, 0.85, 0.85, 90), at("tvunit", 2.25, 8.7, 1.8, 0.4, 180), at("plant", 4.0, 8.4, 0.5, 0.5),
      ]),
      R("Hall", 4.5, 4.5, 4.5, 4.5, "terracotta", () => [at("rug", 6.75, 6.8, 2.2, 2.4), at("plant", 5.0, 8.4, 0.5, 0.5), at("plant", 8.5, 8.4, 0.5, 0.5)]),
      R("Stairs", 9, 4.5, 1.6, 4.5, "terracotta", () => [at("stairs", 9.8, 6.75, 4.2, 1.0, 270)]),
      R("Pooja", 10.6, 4.5, 3.4, 2.2, "marble", (r) => [against(r, "E", "pooja", 1.2, 0.5, 0), at("plant", 11.0, 5.0, 0.5, 0.5)]),
      R("Bath", 10.6, 6.7, 3.4, 2.3, "tile", (r) => [
        against(r, "E", "wc", 0.4, 0.7, -0.6), against(r, "E", "shower", 0.9, 0.9, 0.6), against(r, "S", "basin", 0.5, 0.4, -0.5),
      ]),
    ], [
      D(6.75, 9, 1.4), A(4.5, 6.7, 1.6), A(6.75, 4.5, 1.4), D(4, 2.2), D(8.5, 2.2), D(9, 8.0), D(10.6, 5.6), D(10.6, 7.8, 0.8),
      W(0, 2.2, 1.4), W(1.6, 0, 1.2), W(6.25, 0, 1.6), W(11, 0, 1.6), W(14, 2, 1.2),
      W(0.9, 9, 0.9), W(3.6, 9, 0.9), W(14, 7.8, 0.6, 1.5, 0.6),
    ], [{ type: "flat", x: 1.5, y: 9, w: 11, h: 2.0, ov: [0, 0, 0.3, 0], columns: 6 }], [{ side: "S", mat: "brick" }]),
    floor("u", "First Floor", [
      R("Master Bedroom", 0, 0, 4.5, 4.5, "wood", (r) => [against(r, "S", "bed", 1.9, 2.1, 0), against(r, "N", "wardrobe", 1.5, 0.6, 1.4)]),
      R("Family Lounge", 4.5, 0, 4.5, 9, "wood", () => [
        at("rug", 6.7, 5.4, 3, 2.6), at("sofa", 5.1, 5.2, 2.2, 0.95, 270), at("coffee", 6.2, 5.4, 1.0, 0.6, 90),
        at("tvunit", 8.7, 5.7, 1.6, 0.4, 90), at("plant", 6.75, 8.4, 0.5, 0.5), at("plant", 5.0, 0.6, 0.5, 0.5),
      ]),
      R("Bedroom 3", 0, 4.5, 4.5, 4.5, "wood", (r) => [against(r, "N", "bed", 1.9, 2.1, 0), against(r, "S", "wardrobe", 1.8, 0.6, 0)]),
      R("Landing", 9, 2.6, 1.6, 6.4, "wood", () => [], { x: 9.3, y: 4.65, w: 1.0, h: 4.2 }),
      R("Study", 9, 0, 5, 2.6, "wood", (r) => [against(r, "N", "desk", 1.6, 0.65, 0), against(r, "E", "wardrobe", 1.4, 0.4, 0)]),
      R("Bedroom 4", 10.6, 2.6, 3.4, 3.2, "wood", (r) => [against(r, "N", "bed", 1.7, 2.1, 0), against(r, "E", "wardrobe", 1.2, 0.5, 0.9)]),
      R("Bath 2", 10.6, 5.8, 3.4, 3.2, "tile", (r) => [
        against(r, "S", "tub", 1.7, 0.75, -0.8), against(r, "E", "shower", 0.9, 0.9, -0.5), against(r, "E", "wc", 0.4, 0.7, 0.9),
        against(r, "W", "basin", 0.5, 0.4, 0.8),
      ]),
    ], [
      W(1.6, 0, 1.2), W(0, 2.2, 1.4), G(6.75, 9, 3.0), W(0, 7.6, 1.2), W(2.25, 9, 1.4), W(11.5, 0, 1.6), W(14, 3.3, 0.8), W(14, 7.6, 0.6, 1.5, 0.6),
      D(4.5, 2.2), D(4.5, 6.7), A(9, 4.0, 1.2), D(9.8, 2.6), D(10.6, 3.6), D(12.3, 5.8, 0.8),
    ], [{ type: "hip", x: 0, y: 0, w: 14, h: 9, ov: [0.8, 0.8, 0.8, 0.8] }], [{ side: "S", mat: "brick" }]),
  ],
});

/* ───────────────────────── 4 · LUXURY ───────────────────────── */

const luxury = finish({
  id: "rudra",
  name: "Rudra Signature Villa",
  style: "Luxury",
  location: "Udaipur, Rajasthan",
  blurb: "A statement villa: double-height foyer, home theatre, roof terrace and a pool deck, in travertine, walnut and bronze glass.",
  photo: "/images/hero-villa-pool.webp",
  plot: "80 × 100 ft",
  palette: { render: "#efeae0", trim: "#d6cdb9", frame: "#2a241e", roof: "#c8c0b0", timber: "#7a4a2a" },
  outdoors: [
    { kind: "deck", x: 0, y: 11.05, w: 16, h: 4.6 },
    { kind: "pool", x: 9.6, y: 12.0, w: 6, h: 2.8 },
    { kind: "path", x: 7.0, y: 15.7, w: 2.0, h: 2.2 },
  ],
  floors: [
    floor("g", "Ground Floor", [
      R("Family Room", 0, 0, 6.5, 5, "marble", () => [
        at("rug", 3.25, 2.6, 3.6, 2.4), at("tvunit", 3.25, 0.34, 2.4, 0.42, 0), at("sofa", 3.25, 4.0, 3.0, 0.95, 180),
        at("coffee", 3.25, 2.6, 1.2, 0.7, 0), at("plant", 0.5, 0.5, 0.5, 0.5), at("plant", 6.0, 0.5, 0.5, 0.5),
      ]),
      R("Kitchen", 6.5, 0, 4, 5, "marble", (r) => [against(r, "N", "counter", 3.6, 0.62, 0), at("island", 8.5, 2.5, 2.4, 1.0, 0)]),
      R("Home Theatre", 10.5, 0, 5.5, 5, "wood", (r) => [
        against(r, "N", "tvunit", 2.6, 0.4, 0), against(r, "S", "sofa", 3.2, 0.95, 0), at("armchair", 11.9, 2.9, 0.85, 0.85, 90), at("rug", 13.25, 2.7, 3.4, 2.4),
      ]),
      R("Living", 0, 5, 6, 6, "marble", (r) => [
        at("rug", 2.2, 7.4, 3.6, 2.6), against(r, "N", "sofa", 3.2, 0.95, -1.4), at("coffee", 2.0, 7.1, 1.2, 0.7, 0),
        at("armchair", 1.2, 9.4, 0.85, 0.85, 180), at("armchair", 2.9, 9.4, 0.85, 0.85, 180), at("plant", 5.5, 10.4, 0.5, 0.5),
      ]),
      R("Foyer", 6, 5, 4, 6, "marble", () => [
        at("stairs", 6.7, 8.3, 4.2, 1.0, 270), at("bench", 9.6, 9.8, 1.2, 0.4, 90), at("plant", 9.4, 10.3, 0.5, 0.5), at("rug", 8.6, 7.5, 1.6, 2.4),
      ]),
      R("Dining", 10, 5, 6, 3.2, "marble", () => [at("dining", 13, 6.6, 3.0, 1.1, 0, 8), at("plant", 15.5, 5.6, 0.5, 0.5)]),
      R("Bar", 10, 8.2, 4, 2.8, "wood", (r) => [against(r, "S", "counter", 3.0, 0.6, 0), at("island", 12, 9.2, 2.4, 0.7, 0)]),
      R("Powder", 14, 8.2, 2, 2.8, "tile", (r) => [against(r, "E", "wc", 0.4, 0.7, 0.4), against(r, "S", "basin", 0.5, 0.4, -0.2)]),
    ], [
      D(8, 11, 1.6), A(5.4, 5, 1.2), A(6, 5.65, 0.9), A(10, 7.5, 1.6), A(8, 5, 1.6), A(6.5, 2.5, 1.6), D(10.5, 2.5), A(11.5, 8.2, 1.2), D(14, 9.6, 0.8),
      W(5.2, 0, 1.2, 1.6, 0.6), G(0, 2.5, 3.0), W(8.7, 0, 2.4), G(16, 6.6, 2.4), G(3, 11, 4.6), G(0, 8, 3.0), W(12, 11, 2.4), W(15, 11, 0.6, 1.5, 0.6),
    ], [{ type: "flat", x: 10, y: 5, w: 6, h: 6, ov: [0, 0.6, 0.6, 0] }], [{ side: "S", mat: "stone" }, { side: "N", mat: "stone" }]),
    floor("u", "First Floor", [
      R("Master Suite", 0, 5, 6, 6, "wood", (r) => [
        at("rug", 3.4, 8, 3.6, 3), against(r, "W", "bed", 2.0, 2.2, 0), at("armchair", 4.9, 9.8, 0.85, 0.85, 200), at("plant", 5.5, 5.6, 0.5, 0.5),
      ]),
      R("Master Bath", 0, 0, 3.2, 5, "marble", (r) => [
        against(r, "N", "tub", 1.8, 0.8, 0.3), against(r, "W", "wc", 0.4, 0.7, 0.6), against(r, "E", "basin", 0.5, 0.4, 0), against(r, "E", "shower", 0.9, 0.9, 1.5),
      ]),
      R("Walk-in", 3.2, 0, 2.8, 5, "wood", (r) => [against(r, "E", "wardrobe", 3.8, 0.6, 0), against(r, "N", "wardrobe", 2.0, 0.6, 0)]),
      R("Gallery", 6, 5, 4, 6, "marble", () => [at("plant", 9.4, 5.6, 0.5, 0.5)], { x: 6.2, y: 6.2, w: 1.0, h: 4.2 }),
      R("Lounge", 6, 0, 4, 5, "wood", (r) => [
        against(r, "W", "sofa", 2.4, 0.95, 0), against(r, "N", "wardrobe", 3.0, 0.4, 0.3), at("coffee", 7.9, 2.5, 0.9, 0.6, 90), at("armchair", 9.2, 3.6, 0.85, 0.85, 200),
      ]),
      R("Bedroom 2", 10, 0, 4, 5, "wood", (r) => [against(r, "N", "bed", 1.9, 2.1, 0.2), against(r, "W", "wardrobe", 1.6, 0.6, 1.3)]),
      R("Bath 2", 14, 0, 2, 5, "tile", (r) => [
        against(r, "E", "tub", 1.8, 0.8, -1.2), against(r, "E", "wc", 0.4, 0.7, 0.8), against(r, "S", "shower", 0.9, 0.9, 0.5), against(r, "W", "basin", 0.5, 0.4, 1.7),
      ]),
    ], [
      G(3, 11, 4.6), W(0, 2.5, 0.8, 1.5, 0.6), W(4.6, 0, 0.8, 1.5, 0.6), W(8, 0, 2.6), W(12, 0, 2.4), G(12, 5, 3.0), W(16, 2.4, 0.6, 1.5, 0.6),
      G(8, 11, 3.0), G(10, 8.5, 2.6),
      D(1.6, 5, 0.8), D(4.7, 5, 0.8), D(6, 5.8), A(8, 5, 1.6), D(10, 2.5), D(14, 2.5, 0.8),
    ], [
      { type: "flat", x: 0, y: 0, w: 16, h: 5, ov: [0.5, 0.5, 0, 0.5] },
      { type: "flat", x: 0, y: 5, w: 10, h: 6, ov: [0, 0.5, 0.9, 0.5] },
    ], [{ side: "S", mat: "wood" }]),
  ],
});

export const HOUSES: House[] = [modern, contemporary, traditional, luxury];
export const STOREY = 3.2;
export const WALL_H = 3.0;
export const SQM_TO_SQFT = 10.764;
