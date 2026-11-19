import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { STOREY, WALL_H, type Floor, type House, type Outdoor, type RoofDef, type Side, type Wall } from "@/lib/houses";

export const PLINTH = 0.15;
export const CUT_H = 1.15;
export const levelOf = (i: number) => PLINTH + i * STOREY;

/** World-space tile size (metres) of each material's texture. */
export const TILE: Record<string, number> = {
  render: 2.2, inner: 2.2, trim: 2, slab: 2, roofSlab: 2, roofTop: 2,
  "floor-wood": 1.2, "floor-tile": 1.2, "floor-marble": 2.4, "floor-stone": 2, "floor-terracotta": 1.2,
  "clad-wood": 1.0, "clad-stone": 2.0, "clad-brick": 1.5, "clad-slate": 2,
  deck: 1.2, paving: 1.5, coping: 2, soffit: 1.2, poolTile: 1,
};

export type GeoMap = Map<string, THREE.BufferGeometry>;

const hash = (a: number, b: number, c: number) => {
  const s = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453;
  return s - Math.floor(s);
};

class Builder {
  private g = new Map<string, THREE.BufferGeometry[]>();

  box(key: string, cx: number, cy: number, cz: number, sx: number, sy: number, sz: number) {
    if (sx <= 0.001 || sy <= 0.001 || sz <= 0.001) return;
    const geo = new THREE.BoxGeometry(sx, sy, sz);
    const tile = TILE[key] ?? 1;
    const uv = geo.getAttribute("uv") as THREE.BufferAttribute;
    // BoxGeometry face order: +x, -x, +y, -y, +z, -z, four vertices each
    const dims: [number, number][] = [[sz, sy], [sz, sy], [sx, sz], [sx, sz], [sx, sy], [sx, sy]];
    const ox = hash(cx, cy, cz), oy = hash(cz, cx, cy);
    for (let f = 0; f < 6; f++)
      for (let v = 0; v < 4; v++) {
        const i = f * 4 + v;
        uv.setXY(i, (uv.getX(i) * dims[f][0]) / tile + ox, (uv.getY(i) * dims[f][1]) / tile + oy);
      }
    geo.translate(cx, cy, cz);
    this.push(key, geo);
  }

  cyl(key: string, cx: number, cy: number, cz: number, r: number, h: number, seg = 20) {
    const geo = new THREE.CylinderGeometry(r, r, h, seg);
    geo.translate(cx, cy, cz);
    this.push(key, geo);
  }

  push(key: string, geo: THREE.BufferGeometry) {
    if (!this.g.has(key)) this.g.set(key, []);
    this.g.get(key)!.push(geo);
  }

  build(): GeoMap {
    const out: GeoMap = new Map();
    for (const [k, arr] of this.g) {
      const m = mergeGeometries(arr.map((a) => (a.index ? a.toNonIndexed() : a)), false);
      arr.forEach((a) => a.dispose());
      if (m) out.set(k, m);
    }
    return out;
  }
}

const NORMAL: Record<Side, [number, number]> = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };

function addWall(b: Builder, wall: Wall, level: number, cut: boolean, accent: string | null) {
  const t = wall.ext ? 0.23 : 0.12;
  const len = wall.horizontal ? wall.x2 - wall.x1 : wall.y2 - wall.y1;
  const H = cut ? CUT_H : WALL_H;
  const ops = [...wall.openings].sort((p, q) => p.at - q.at);

  // piece = [u0,u1,y0,y1]
  const pieces: [number, number, number, number][] = [];
  const glazing: [number, number, number, number, typeof ops[number]][] = [];
  let cursor = 0;
  for (const o of ops) {
    const a = o.at - o.w / 2, e = o.at + o.w / 2;
    if (cut && o.kind === "window") continue; // sills sit above cut line → stay solid
    if (a > cursor) pieces.push([cursor, a, 0, H]);
    if (o.sill > 0.01) pieces.push([a, e, 0, Math.min(o.sill, H)]);
    const top = o.sill + o.h;
    if (!cut && top < H - 0.01) pieces.push([a, e, top, H]);
    if (!cut && (o.kind === "window" || o.kind === "glass" || o.kind === "door")) glazing.push([a, e, o.sill, top, o]);
    cursor = e;
  }
  if (cursor < len) pieces.push([cursor, len, 0, H]);

  const [nx, nz] = wall.side ? NORMAL[wall.side] : [0, 0];
  const skin = accent ? 0.06 : 0;
  const coreT = t - skin;
  const shift = skin / 2; // inward shift of core, outward shift of skin

  const place = (key: string, u0: number, u1: number, y0: number, y1: number, thick: number, off: number) => {
    let a = u0, e = u1;
    if (u0 <= 0.001) a = -t / 2;
    if (u1 >= len - 0.001) e = len + t / 2;
    const cu = (a + e) / 2, su = e - a, cy = level + (y0 + y1) / 2, sy = y1 - y0;
    if (wall.horizontal) b.box(key, wall.x1 + cu, cy, wall.y1 + off * (nz || 0), su, sy, thick);
    else b.box(key, wall.x1 + off * (nx || 0), cy, wall.y1 + cu, thick, sy, su);
  };

  for (const [u0, u1, y0, y1] of pieces) {
    if (accent) {
      place(wall.ext ? "render" : "inner", u0, u1, y0, y1, coreT, -shift);
      place(`clad-${accent}`, u0, u1, y0, y1, skin, t / 2 - skin / 2);
    } else {
      place(wall.ext ? "render" : "inner", u0, u1, y0, y1, t, 0);
    }
  }

  // glazing, frames and door leaves
  const fd = Math.min(t, 0.12);
  for (const [a, e, y0, y1, o] of glazing) {
    const w = e - a, h = y1 - y0, cu = (a + e) / 2, cy = level + (y0 + y1) / 2;
    const bx = (key: string, u: number, y: number, su: number, sy: number, st: number) =>
      wall.horizontal ? b.box(key, wall.x1 + u, y, wall.y1, su, sy, st) : b.box(key, wall.x1, y, wall.y1 + u, st, sy, su);
    if (o.kind === "door") {
      const key = wall.ext ? "doorExt" : "door";
      bx(key, a + w / 2, level + y0 + (h - 0.05) / 2, w - 0.08, h - 0.05, 0.045);
      bx("frame", a + 0.02, cy, 0.05, h, fd); bx("frame", e - 0.02, cy, 0.05, h, fd);
      bx("frame", cu, level + y1 - 0.025, w, 0.05, fd);
      if (wall.ext) bx("frame", cu, level + 0.03, w, 0.06, 0.2);
      continue;
    }
    bx("glass", cu, cy, w - 0.08, h - 0.08, 0.025);
    bx("frame", a + 0.025, cy, 0.05, h, fd); bx("frame", e - 0.025, cy, 0.05, h, fd);
    bx("frame", cu, level + y0 + 0.025, w, 0.05, fd); bx("frame", cu, level + y1 - 0.025, w, 0.05, fd);
    const bars = o.kind === "glass" ? Math.max(1, Math.round(w / 1.2) - 1) : w > 1.5 ? 1 : 0;
    for (let k = 1; k <= bars; k++) bx("frame", a + (w * k) / (bars + 1), cy, 0.04, h, fd);
    if (o.kind === "window" && wall.ext) {
      // projecting sill
      if (wall.horizontal) b.box("trim", wall.x1 + cu, level + y0 - 0.025, wall.y1 + nz * 0.04, w + 0.12, 0.05, t + 0.08);
      else b.box("trim", wall.x1 + nx * 0.04, level + y0 - 0.025, wall.y1 + cu, t + 0.08, 0.05, w + 0.12);
    }
  }
}

function slabPieces(x: number, y: number, w: number, h: number, hole?: { x: number; y: number; w: number; h: number }) {
  if (!hole) return [{ x, y, w, h }];
  const out = [
    { x, y, w: hole.x - x, h },
    { x: hole.x + hole.w, y, w: x + w - (hole.x + hole.w), h },
    { x: hole.x, y, w: hole.w, h: hole.y - y },
    { x: hole.x, y: hole.y + hole.h, w: hole.w, h: y + h - (hole.y + hole.h) },
  ];
  return out.filter((r) => r.w > 0.01 && r.h > 0.01);
}

function addFlatRoof(b: Builder, r: RoofDef, level: number, withParapet: boolean) {
  const top = level + WALL_H;
  const [on, oe, os, ow] = r.ov;
  const x0 = r.x - ow, x1 = r.x + r.w + oe, z0 = r.y - on, z1 = r.y + r.h + os;
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  b.box("soffit", cx, top + 0.02, cz, w - 0.01, 0.04, d - 0.01);
  b.box("roofSlab", cx, top + 0.04 + 0.08, cz, w, 0.16, d);
  b.box("roofTop", cx, top + 0.2 + 0.005, cz, w - 0.3, 0.01, d - 0.3);
  if (!withParapet) return;
  const p = 0.16, ph = 0.5, y = top + 0.2 + ph / 2;
  if (on > 0) { b.box("render", cx, y, z0 + p / 2, w, ph, p); b.box("trim", cx, top + 0.2 + ph + 0.02, z0 + p / 2, w + 0.04, 0.04, p + 0.06); }
  if (os > 0) { b.box("render", cx, y, z1 - p / 2, w, ph, p); b.box("trim", cx, top + 0.2 + ph + 0.02, z1 - p / 2, w + 0.04, 0.04, p + 0.06); }
  if (ow > 0) { b.box("render", x0 + p / 2, y, cz, p, ph, d); b.box("trim", x0 + p / 2, top + 0.2 + ph + 0.02, cz, p + 0.06, 0.04, d + 0.04); }
  if (oe > 0) { b.box("render", x1 - p / 2, y, cz, p, ph, d); b.box("trim", x1 - p / 2, top + 0.2 + ph + 0.02, cz, p + 0.06, 0.04, d + 0.04); }
}

function addColumns(b: Builder, r: RoofDef, level: number) {
  const n = r.columns ?? 0;
  if (!n) return;
  const [, , os] = r.ov;
  const z = r.y + r.h - 0.3;
  const h = WALL_H;
  for (let i = 0; i < n; i++) {
    const x = r.x + 0.3 + ((r.w - 0.6) * i) / (n - 1);
    b.cyl("render", x, level + h / 2, z, 0.14, h, 20);
    b.box("trim", x, level + 0.1, z, 0.4, 0.2, 0.4);
    b.box("trim", x, level + h - 0.08, z, 0.4, 0.16, 0.4);
  }
  void os;
}

export function buildFloor(house: House, fi: number, cut: boolean, showRoofs: boolean): GeoMap {
  const f: Floor = house.floors[fi];
  const level = levelOf(fi);
  const b = new Builder();

  // slabs + floor finishes
  for (const r of f.rooms) {
    for (const p of slabPieces(r.x, r.y, r.w, r.h, r.hole)) {
      const cx = p.x + p.w / 2, cz = p.y + p.h / 2;
      const thick = fi === 0 ? PLINTH : 0.2;
      b.box("slab", cx, level - 0.02 - (thick - 0.02) / 2, cz, p.w, thick - 0.02, p.h);
      b.box(`floor-${r.floor}`, cx, level - 0.01, cz, p.w - 0.004, 0.02, p.h - 0.004);
    }
  }

  const accentFor = (w: Wall) => (w.ext && w.side ? f.accents.find((a) => a.side === w.side)?.mat ?? null : null);
  for (const w of f.walls) addWall(b, w, level, cut, accentFor(w));

  if (showRoofs) {
    const showParapet = true;
    for (const r of f.roofs) {
      if (r.type === "flat") { addFlatRoof(b, r, level, showParapet); addColumns(b, r, level); }
    }
  }
  return b.build();
}

/** Hip-roof geometry lives outside the box builder (custom UVs in metres). */
export function buildHipRoof(r: RoofDef, level: number, rise?: number): { roof: THREE.BufferGeometry; parts: GeoMap } {
  const [on, oe, os, ow] = r.ov;
  const x0 = r.x - ow, x1 = r.x + r.w + oe, z0 = r.y - on, z1 = r.y + r.h + os;
  const base = level + WALL_H + 0.18;
  const W = x1 - x0, D = z1 - z0, zc = (z0 + z1) / 2;
  const ri = rise ?? D * 0.27;
  const slope = Math.hypot(D / 2, ri);
  const slopeEnd = Math.hypot(W <= D ? W / 2 : D / 2, ri);
  const rl = [x0 + D / 2, x1 - D / 2];
  const pos: number[] = [], uvs: number[] = [];
  const tri = (a: number[], ua: number[], bb: number[], ub: number[], c: number[], uc: number[]) => {
    pos.push(...a, ...bb, ...c); uvs.push(...ua, ...ub, ...uc);
  };
  // south slope
  tri([x0, base, z1], [x0, 0], [x1, base, z1], [x1, 0], [rl[1], base + ri, zc], [rl[1], slope]);
  tri([x0, base, z1], [x0, 0], [rl[1], base + ri, zc], [rl[1], slope], [rl[0], base + ri, zc], [rl[0], slope]);
  // north slope
  tri([x1, base, z0], [x1, 0], [x0, base, z0], [x0, 0], [rl[0], base + ri, zc], [rl[0], slope]);
  tri([x1, base, z0], [x1, 0], [rl[0], base + ri, zc], [rl[0], slope], [rl[1], base + ri, zc], [rl[1], slope]);
  // west + east hips
  tri([x0, base, z0], [z0, 0], [x0, base, z1], [z1, 0], [rl[0], base + ri, zc], [zc, slopeEnd]);
  tri([x1, base, z1], [z1, 0], [x1, base, z0], [z0, 0], [rl[1], base + ri, zc], [zc, slopeEnd]);
  const roof = new THREE.BufferGeometry();
  roof.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  roof.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  roof.computeVertexNormals();

  const tb = new Builder();
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  // eave soffit + fascia
  tb.box("soffit", cx, base - 0.1, cz, W, 0.05, D);
  const fh = 0.22, fy = base - 0.05 + fh / 2 - 0.05;
  tb.box("fascia", cx, fy, z0, W + 0.06, fh, 0.06); tb.box("fascia", cx, fy, z1, W + 0.06, fh, 0.06);
  tb.box("fascia", x0, fy, cz, 0.06, fh, D); tb.box("fascia", x1, fy, cz, 0.06, fh, D);
  // ridge cap
  tb.box("ridge", (rl[0] + rl[1]) / 2, base + ri + 0.04, zc, rl[1] - rl[0] + 0.5, 0.12, 0.28);
  // gable-end attic wall (plastered drum beneath the roof)
  tb.box("render", cx, level + WALL_H + 0.09, cz, r.w, 0.18, r.h);
  return { roof, parts: tb.build() };
}

export function buildOutdoors(outs: Outdoor[]): GeoMap {
  const b = new Builder();
  for (const o of outs) {
    if (o.kind === "path") {
      b.box("paving", o.x + o.w / 2, 0.03, o.y + o.h / 2, o.w, 0.06, o.h);
    } else if (o.kind === "deck") {
      const pool = outs.find((p) => p.kind === "pool" && p.x >= o.x && p.x + p.w <= o.x + o.w + 0.01 && p.y >= o.y && p.y + p.h <= o.y + o.h + 0.01);
      const pieces = pool ? slabPieces(o.x, o.y, o.w, o.h, { x: pool.x - 0.35, y: pool.y - 0.35, w: pool.w + 0.7, h: pool.h + 0.7 }) : [o];
      for (const p of pieces) b.box("deck", p.x + p.w / 2, 0.06, p.y + p.h / 2, p.w, 0.12, p.h);
    } else {
      // pool: basin tile + coping ring
      b.box("poolTile", o.x + o.w / 2, 0.02, o.y + o.h / 2, o.w + 0.7, 0.04, o.h + 0.7);
      const c = 0.35, hh = 0.16;
      b.box("coping", o.x + o.w / 2, hh / 2, o.y - c / 2, o.w + 0.7, hh, c);
      b.box("coping", o.x + o.w / 2, hh / 2, o.y + o.h + c / 2, o.w + 0.7, hh, c);
      b.box("coping", o.x - c / 2, hh / 2, o.y + o.h / 2, c, hh, o.h);
      b.box("coping", o.x + o.w + c / 2, hh / 2, o.y + o.h / 2, c, hh, o.h);
    }
  }
  return b.build();
}
