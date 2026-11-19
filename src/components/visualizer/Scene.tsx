"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, OrbitControls, Sky } from "@react-three/drei";
import { EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { STOREY, WALL_H, type House, type Room } from "@/lib/houses";
import * as tex from "./textures";
import { buildFloor, buildHipRoof, buildOutdoors, levelOf, type GeoMap } from "./buildHouse";
import Furniture3D from "./Furniture3D";

export type View = "exterior" | "cutaway" | "walk";
export type TimeOfDay = "day" | "golden" | "dusk";
export type Quality = "high" | "balanced";

export interface SceneProps {
  house: House;
  view: View;
  floorIndex: number;
  roomId: string | null;
  time: TimeOfDay;
  autoRotate: boolean;
  quality: Quality;
  introKey: number;
  running: boolean;
  onRoomPick: (id: string) => void;
  onReady?: () => void;
}

/* ───────────── time of day ───────────── */
const TIMES = {
  day: { el: 52, az: 28, sun: "#fff3dc", sunI: 3.6, hemiSky: "#c9defa", hemiGround: "#97906f", hemiI: 0.75, env: 1, fog: "#d4e0ee", sky: { turbidity: 3, rayleigh: 1.1, mie: 0.004 }, glow: 0 },
  golden: { el: 12, az: 58, sun: "#ffb26b", sunI: 3.4, hemiSky: "#ffd9b5", hemiGround: "#7a6a52", hemiI: 0.6, env: 0.8, fog: "#ecc9a2", sky: { turbidity: 9, rayleigh: 2.6, mie: 0.012 }, glow: 0.15 },
  dusk: { el: 1.5, az: -82, sun: "#ff8a57", sunI: 1.1, hemiSky: "#6f80b8", hemiGround: "#2c2f3a", hemiI: 0.55, env: 0.45, fog: "#3d4866", sky: { turbidity: 10, rayleigh: 0.9, mie: 0.006 }, glow: 1 },
} as const;

const sunVec = (el: number, az: number) => {
  const e = (el * Math.PI) / 180, a = (az * Math.PI) / 180;
  return new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e));
};

/* ───────────── materials ───────────── */
const matCache = new Map<string, Record<string, THREE.Material>>();

function getMats(house: House): Record<string, THREE.Material> {
  const hit = matCache.get(house.id);
  if (hit) return hit;
  const p = house.palette;
  const std = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);
  const woodTone = house.style === "Luxury" ? "#8a6240" : house.style === "Traditional" ? "#a97b52" : "#bd9565";
  const roofTex = tex.roofTiles(p.roof);
  roofTex.repeat.set(1 / 1.2, 1 / 1.2);
  const m: Record<string, THREE.Material> = {
    render: std({ map: tex.plaster(p.render, 1), roughness: 0.94 }),
    inner: std({ map: tex.plaster("#f3f0e9", 2), roughness: 0.96 }),
    trim: std({ map: tex.plaster(p.trim, 3), roughness: 0.85 }),
    slab: std({ map: tex.concrete("#c9c5bc"), roughness: 0.95 }),
    roofSlab: std({ map: tex.concrete(p.roof), roughness: 0.9 }),
    roofTop: std({ map: tex.concrete("#a7a49c", 12), roughness: 1 }),
    soffit: std({ map: tex.woodSlats(p.timber, 13, 8), roughness: 0.6 }),
    frame: std({ color: p.frame, roughness: 0.35, metalness: 0.65 }),
    glass: new THREE.MeshStandardMaterial({ color: "#a9c3cf", roughness: 0.04, metalness: 0.15, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide, emissive: "#000000" }),
    door: std({ map: tex.woodSlats("#8b5d3a", 14, 1), roughness: 0.55 }),
    doorExt: std({ map: tex.woodSlats(p.timber, 15, 5), roughness: 0.5 }),
    "floor-wood": std({ map: tex.woodPlanks(woodTone, 2), roughness: 0.5 }),
    "floor-tile": std({ map: tex.tiles("#e9e8e3", 3, 4), roughness: 0.28 }),
    "floor-marble": std({ map: tex.marble("#f0ede7"), roughness: 0.18, metalness: 0.02 }),
    "floor-stone": std({ map: tex.stoneBlocks("#b8ae9b"), roughness: 0.8 }),
    "floor-terracotta": std({ map: tex.tiles("#c98a62", 3, 5, "#a57654"), roughness: 0.7 }),
    "clad-wood": std({ map: tex.woodSlats(p.timber, 3, 12), roughness: 0.55 }),
    "clad-stone": std({ map: tex.stoneBlocks("#bfb29a"), roughness: 0.85 }),
    "clad-brick": std({ map: tex.bricks("#a8573a"), roughness: 0.9 }),
    "clad-slate": std({ map: tex.stoneBlocks("#4a4d52", 16), roughness: 0.7 }),
    deck: std({ map: tex.woodPlanks("#a08058", 17, 8), roughness: 0.65 }),
    paving: std({ map: tex.paving(), roughness: 0.9 }),
    coping: std({ map: tex.plaster("#ebe6da", 18), roughness: 0.6 }),
    poolTile: std({ color: "#9fd6df", roughness: 0.3 }),
    fascia: std({ color: p.timber, roughness: 0.6 }),
    ridge: std({ color: p.roof, roughness: 0.8 }),
    roofTile: std({ map: roofTex, roughness: 0.78, side: THREE.DoubleSide }),
    water: new THREE.MeshStandardMaterial({ color: "#2f9bb0", roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.82 }),
    grass: std({ map: (() => { const g = tex.grass(); g.repeat.set(70, 70); return g; })(), roughness: 1 }),
    foliage: std({ vertexColors: true, roughness: 0.95 }),
    bark: std({ color: "#5a4636", roughness: 1 }),
  };
  matCache.set(house.id, m);
  return m;
}

/* ───────────── geometry helpers ───────────── */
function useDisposable(geo: GeoMap | THREE.BufferGeometry | null) {
  useEffect(() => () => {
    if (!geo) return;
    if (geo instanceof Map) geo.forEach((g) => g.dispose()); else geo.dispose();
  }, [geo]);
}

function GeoMeshes({ geos, mats, shadow = true }: { geos: GeoMap; mats: Record<string, THREE.Material>; shadow?: boolean }) {
  useDisposable(geos);
  return (
    <>
      {[...geos.entries()].map(([k, g]) => (
        <mesh key={k} geometry={g} material={mats[k] ?? mats.render} castShadow={shadow && k !== "glass"} receiveShadow={k !== "glass"} />
      ))}
    </>
  );
}

function Floor3D({ house, fi, cut, showRoofs, mats, withFurniture, lights }: {
  house: House; fi: number; cut: boolean; showRoofs: boolean; mats: Record<string, THREE.Material>; withFurniture: boolean; lights: boolean;
}) {
  const geos = useMemo(() => buildFloor(house, fi, cut, showRoofs), [house, fi, cut, showRoofs]);
  const hips = useMemo(
    () => (showRoofs ? house.floors[fi].roofs.filter((r) => r.type === "hip").map((r) => buildHipRoof(r, levelOf(fi))) : []),
    [house, fi, showRoofs],
  );
  useEffect(() => () => hips.forEach((h) => { h.roof.dispose(); h.parts.forEach((g) => g.dispose()); }), [hips]);
  const level = levelOf(fi);
  const floor = house.floors[fi];
  const lightRooms = useMemo(() => floor.rooms.filter((r) => r.w * r.h > 9).slice(0, 4), [floor]);
  return (
    <group>
      <GeoMeshes geos={geos} mats={mats} />
      {hips.map((h, i) => (
        <group key={i}>
          <mesh geometry={h.roof} material={mats.roofTile} castShadow receiveShadow />
          <GeoMeshes geos={h.parts} mats={mats} />
        </group>
      ))}
      {withFurniture && <Furniture3D items={floor.rooms.flatMap((r) => r.furniture)} level={level} />}
      {lights && lightRooms.map((r) => (
        <pointLight key={r.id} position={[r.x + r.w / 2, level + 2.3, r.y + r.h / 2]} intensity={14} distance={9} decay={2} color="#ffcf8f" />
      ))}
    </group>
  );
}

/* ───────────── surroundings ───────────── */
const ni = (g: THREE.BufferGeometry) => (g.index ? g.toNonIndexed() : g);
function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

function applyAtmosphere(scene: THREE.Scene, mats: Record<string, THREE.Material>, fog: string, glow: number) {
  scene.fog = new THREE.Fog(fog, 90, 320);
  scene.background = new THREE.Color(fog);
  const g = mats.glass as THREE.MeshStandardMaterial;
  const on = glow > 0.5;
  g.emissive.set(on ? "#ffc47a" : "#000000");
  g.emissiveIntensity = on ? 0.85 : 0;
  g.opacity = on ? 0.55 : 0.32;
  g.color.set(on ? "#6f8190" : "#a9c3cf");
}
function clearFog(scene: THREE.Scene) { scene.fog = null; }

function useTrees(house: House) {
  return useMemo(() => {
    const rnd = seeded(house.id.charCodeAt(0) * 97 + 13);
    const b = house.bounds;
    const cx = b.x + b.w / 2, cz = b.y + b.h / 2;
    const rx = b.w / 2 + 13, rz = b.h / 2 + 14;
    const trunks: THREE.BufferGeometry[] = [];
    const leaves: THREE.BufferGeometry[] = [];
    const greens = ["#3a5230", "#46603a", "#2f4527", "#51693a", "#3f5a31"].map((c) => new THREE.Color(c));
    const place = (x: number, z: number, h: number) => {
      const trunk = new THREE.CylinderGeometry(0.14 * h * 0.18, 0.22 * h * 0.18, h * 0.55, 8);
      trunk.translate(x, h * 0.275, z);
      trunks.push(trunk);
      const n = 7 + Math.floor(rnd() * 4);
      for (let i = 0; i < n; i++) {
        const r = h * (0.2 + rnd() * 0.14);
        let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(r, 4);
        g.deleteAttribute("normal"); g.deleteAttribute("uv");
        const pos = g.getAttribute("position");
        for (let v = 0; v < pos.count; v++) {
          const px = pos.getX(v), py = pos.getY(v), pz = pos.getZ(v);
          const k = 1 + (Math.sin(px * 9 + i) * Math.cos(pz * 8 + i * 2) + Math.sin(py * 11 + px * 5) * 0.8 + Math.sin((px + pz) * 19) * 0.35) * 0.07;
          pos.setXYZ(v, px * k, py * k * 0.86, pz * k);
        }
        g = mergeVertices(g, 1e-3);
        g.computeVertexNormals();
        g.translate(x + (rnd() - 0.5) * h * 0.42, h * (0.52 + rnd() * 0.34), z + (rnd() - 0.5) * h * 0.42);
        const col = greens[Math.floor(rnd() * greens.length)];
        const p2 = g.getAttribute("position");
        const arr = new Float32Array(p2.count * 3);
        for (let v = 0; v < p2.count; v++) {
          const shade = 0.7 + Math.min(1, Math.max(0, (p2.getY(v) - h * 0.3) / (h * 0.7))) * 0.3 + rnd() * 0.05;
          arr.set([col.r * shade, col.g * shade, col.b * shade], v * 3);
        }
        g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
        leaves.push(ni(g));
      }
    };
    const count = 22;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + rnd() * 0.3;
      const sx = Math.cos(a), sz = Math.sin(a);
      // keep the south approach and the default camera sector (south-east) clear
      if (sz > 0.75 && Math.abs(sx) < 0.45) continue;
      if (sx > 0.1 && sz > 0.25) continue;
      const k = 1 + rnd() * 0.45;
      place(cx + sx * rx * k, cz + sz * rz * k, 5 + rnd() * 3.5);
    }
    // a few shrubs close to the building
    for (let i = 0; i < 8; i++) {
      const x = b.x - 2 + rnd() * (b.w + 4), z = b.y + b.h + 0.8 + rnd() * 0.4;
      if (x > b.x + 1 && x < b.x + b.w - 1) continue;
      place(x, z, 1.6 + rnd() * 0.8);
    }
    return {
      trunk: mergeGeometries(trunks.map(ni), false),
      leaves: mergeGeometries(leaves, false),
    };
  }, [house]);
}

function Surroundings({ house, mats }: { house: House; mats: Record<string, THREE.Material> }) {
  const trees = useTrees(house);
  const outs = useMemo(() => buildOutdoors(house.outdoors), [house]);
  const pool = house.outdoors.find((o) => o.kind === "pool");
  const b = house.bounds;
  const all = [b, ...house.outdoors.map((o) => ({ x: o.x, y: o.y, w: o.w, h: o.h }))];
  const minX = Math.min(...all.map((r) => r.x)) - 3, minY = Math.min(...all.map((r) => r.y)) - 3;
  const maxX = Math.max(...all.map((r) => r.x + r.w)) + 3, maxY = Math.max(...all.map((r) => r.y + r.h)) + 3.2;
  const wallH = 1.5, wt = 0.22;
  const gate = 4.2, gx = (b.x + b.w / 2);
  const segs: { x: number; z: number; w: number; d: number }[] = [
    { x: (minX + maxX) / 2, z: minY, w: maxX - minX, d: wt },
    { x: minX, z: (minY + maxY) / 2, w: wt, d: maxY - minY },
    { x: maxX, z: (minY + maxY) / 2, w: wt, d: maxY - minY },
    { x: (minX + (gx - gate / 2)) / 2, z: maxY, w: gx - gate / 2 - minX, d: wt },
    { x: (maxX + (gx + gate / 2)) / 2, z: maxY, w: maxX - (gx + gate / 2), d: wt },
  ];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[b.x + b.w / 2, -0.01, b.y + b.h / 2]} receiveShadow material={mats.grass}>
        <circleGeometry args={[260, 64]} />
      </mesh>
      {segs.map((s, i) => (
        <group key={i}>
          <mesh position={[s.x, wallH / 2, s.z]} castShadow receiveShadow material={mats.render}>
            <boxGeometry args={[s.w, wallH, s.d]} />
          </mesh>
          <mesh position={[s.x, wallH + 0.03, s.z]} castShadow material={mats.trim}>
            <boxGeometry args={[s.w + 0.06, 0.06, s.d + 0.1]} />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((sgn) => (
        <mesh key={sgn} position={[gx + (sgn * gate) / 2, 1.0, maxY]} castShadow material={mats.trim}>
          <boxGeometry args={[0.45, 2.0, 0.45]} />
        </mesh>
      ))}
      {/* driveway from gate to the house */}
      <mesh position={[gx, 0.02, (maxY + Math.max(...house.outdoors.map((o) => o.y + o.h), b.y + b.h)) / 2]} receiveShadow material={mats.paving}>
        <boxGeometry args={[2.2, 0.04, maxY - Math.max(...house.outdoors.map((o) => o.y + o.h), b.y + b.h)]} />
      </mesh>
      <GeoMeshes geos={outs} mats={mats} />
      {pool && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[pool.x + pool.w / 2, 0.1, pool.y + pool.h / 2]} material={mats.water}>
          <planeGeometry args={[pool.w, pool.h]} />
        </mesh>
      )}
      {trees.trunk && <mesh geometry={trees.trunk} material={mats.bark} castShadow receiveShadow />}
      {trees.leaves && <mesh geometry={trees.leaves} material={mats.foliage} castShadow receiveShadow />}
    </group>
  );
}

/* ───────────── lighting ───────────── */
function Lighting({ house, time, quality, mats }: { house: House; time: TimeOfDay; quality: Quality; mats: Record<string, THREE.Material> }) {
  const t = TIMES[time];
  const b = house.bounds;
  const c = useMemo(() => new THREE.Vector3(b.x + b.w / 2, 0, b.y + b.h / 2), [b]);
  const dir = useMemo(() => sunVec(t.el, t.az), [t]);
  const light = useRef<THREE.DirectionalLight>(null);
  const R = Math.max(b.w, b.h) * 1.1 + 12;
  const { scene } = useThree();

  useEffect(() => {
    applyAtmosphere(scene, mats, t.fog, t.glow);
    return () => clearFog(scene);
  }, [t, scene, mats]);

  useEffect(() => {
    if (light.current) { light.current.target.position.copy(c); light.current.target.updateMatrixWorld(); }
  }, [c]);

  return (
    <>
      <Sky sunPosition={dir.clone().multiplyScalar(1000).toArray()} turbidity={t.sky.turbidity} rayleigh={t.sky.rayleigh} mieCoefficient={t.sky.mie} mieDirectionalG={0.85} />
      <hemisphereLight args={[t.hemiSky, t.hemiGround, t.hemiI]} />
      <directionalLight
        ref={light}
        position={[c.x + dir.x * 70, dir.y * 70 + 1, c.z + dir.z * 70]}
        intensity={t.sunI}
        color={t.sun}
        castShadow
        shadow-mapSize={quality === "high" ? [4096, 4096] : [1536, 1536]}
        shadow-camera-left={-R} shadow-camera-right={R} shadow-camera-top={R} shadow-camera-bottom={-R}
        shadow-camera-near={1} shadow-camera-far={220}
        shadow-bias={-0.0004} shadow-normalBias={0.04} shadow-radius={quality === "high" ? 4 : 2}
      />
      <Environment key={time} resolution={256} frames={1} environmentIntensity={t.env}>
        <Lightformer form="rect" intensity={2.2} position={[dir.x * 12, Math.max(dir.y, 0.2) * 12, dir.z * 12]} scale={[14, 14, 1]} target={[0, 0, 0]} color={t.sun} />
        <Lightformer form="rect" intensity={0.9} position={[0, 12, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[30, 30, 1]} color={t.hemiSky} />
        <Lightformer form="rect" intensity={0.4} position={[-12, 3, 0]} rotation={[0, Math.PI / 2, 0]} scale={[20, 8, 1]} color="#ffffff" />
      </Environment>
    </>
  );
}

/* ───────────── camera rig ───────────── */
function limits(c: OrbitControlsImpl | null, walk: boolean) {
  if (!c) return;
  c.minDistance = walk ? 0.01 : 3;
  c.maxDistance = walk ? 0.2 : 140;
  c.rotateSpeed = walk ? -0.45 : 0.9;
  c.enableZoom = !walk;
  c.enablePan = !walk;
  c.minPolarAngle = walk ? 0.9 : 0;
  c.maxPolarAngle = walk ? 2.3 : Math.PI / 2.03;
}

function Rig({ house, view, floorIndex, roomId, autoRotate, introKey, running }: Pick<SceneProps, "house" | "view" | "floorIndex" | "roomId" | "autoRotate" | "introKey" | "running">) {
  const { camera } = useThree();
  const controls = useRef<OrbitControlsImpl | null>(null);
  const fly = useRef({ on: false, walk: false, pos: new THREE.Vector3(), target: new THREE.Vector3(), rate: 3 });
  const b = house.bounds;
  const center = useMemo(() => new THREE.Vector3(b.x + b.w / 2, 0, b.y + b.h / 2), [b]);
  const aspect = useThree((st) => st.size.width / Math.max(1, st.size.height));
  const R = (Math.max(b.w, b.h) * 1.6 + 8) * (aspect < 1.1 ? 1 + (1.1 - aspect) * 0.85 : 1);

  const goalFor = useMemo(() => (v: View, fi: number, room: Room | null) => {
    const lvl = levelOf(fi);
    if (v === "walk" && room) {
      const rc = new THREE.Vector3(room.x + room.w / 2, 0, room.y + room.h / 2);
      const toCenter = center.clone().sub(rc).setY(0);
      const dir = toCenter.length() > 0.4 ? toCenter.normalize() : new THREE.Vector3(0, 0, 1);
      const reach = Math.min(room.w, room.h) * 0.42;
      const stand = rc.clone().addScaledVector(dir, reach);
      stand.x = THREE.MathUtils.clamp(stand.x, room.x + 0.45, room.x + room.w - 0.45);
      stand.z = THREE.MathUtils.clamp(stand.z, room.y + 0.45, room.y + room.h - 0.45);
      const look = rc.clone().sub(stand).setY(0);
      if (look.length() < 0.3) look.set(0, 0, -1);
      look.normalize();
      const eye = lvl + 1.55;
      return { pos: new THREE.Vector3(stand.x, eye, stand.z), target: new THREE.Vector3(stand.x + look.x * 0.05, eye - 0.02, stand.z + look.z * 0.05) };
    }
    if (v === "cutaway") {
      const r = R * 0.9;
      return { pos: new THREE.Vector3(center.x + r * 0.3, lvl + r * 0.85, center.z + r * 0.62), target: new THREE.Vector3(center.x, lvl + 0.3, center.z) };
    }
    return { pos: new THREE.Vector3(center.x + R * 0.62, R * 0.42, center.z + R * 0.95), target: new THREE.Vector3(center.x, 2.2, center.z) };
  }, [center, R]);

  // intro: start from a top-down "plan" view
  useEffect(() => {
    const g = goalFor("exterior", 0, null);
    camera.position.set(center.x, R * 1.55, center.z + 0.001);
    if (controls.current) { controls.current.target.set(center.x, 0, center.z); controls.current.update(); }
    fly.current = { on: true, walk: false, pos: g.pos, target: g.target, rate: 1.7 };
  }, [introKey, camera, center, R, goalFor]);

  useEffect(() => {
    const room = roomId ? house.floors[floorIndex]?.rooms.find((r) => r.id === roomId) ?? null : null;
    const effective: View = view === "walk" && !room ? "cutaway" : view;
    const g = goalFor(effective, floorIndex, room);
    const walk = effective === "walk";
    fly.current = { on: true, walk, pos: g.pos, target: g.target, rate: 3 };
    limits(controls.current, false);
    if (walk && controls.current) controls.current.minDistance = 0.01; // allow the fly-in to end at eye level
  }, [view, floorIndex, roomId, house, goalFor]);

  useFrame((_, dt) => {
    const f = fly.current;
    const c = controls.current;
    if (!f.on || !c || !running) return;
    const k = 1 - Math.exp(-dt * f.rate);
    camera.position.lerp(f.pos, k);
    c.target.lerp(f.target, k);
    c.update();
    if (camera.position.distanceTo(f.pos) < 0.05 && c.target.distanceTo(f.target) < 0.05) {
      f.on = false;
      if (f.walk) {
        camera.position.copy(f.pos);
        c.target.copy(f.target);
        limits(c, true);
        c.update();
      }
    }
  });

  return (
    <OrbitControls
      ref={controls as never}
      makeDefault
      enableDamping
      dampingFactor={0.07}
      autoRotate={autoRotate && view === "exterior"}
      autoRotateSpeed={0.7}
      onStart={() => { fly.current.on = false; }}
    />
  );
}

/* ───────────── building root ───────────── */
function Building({ house, view, floorIndex, quality, time, introKey, onRoomPick, roomId }: SceneProps) {
  const mats = useMemo(() => getMats(house), [house]);
  const group = useRef<THREE.Group>(null);
  const rise = useRef(0);

  useEffect(() => { rise.current = 0; }, [introKey]);
  useEffect(() => { if (group.current) group.current.scale.y = Math.max(0.001, rise.current); }, []);

  useFrame((_, dt) => {
    if (rise.current < 1) {
      rise.current = Math.min(1, rise.current + dt / 1.6);
      const e = 1 - Math.pow(1 - rise.current, 3);
      if (group.current) group.current.scale.y = Math.max(0.001, e);
    }
  });

  const interior = view !== "exterior";
  const lights = time === "dusk" && quality === "high";

  return (
    <>
      <Lighting house={house} time={time} quality={quality} mats={mats} />
      <group ref={group}>
        {house.floors.map((f, i) => {
          if (interior && i > floorIndex) return null;
          const cut = view === "cutaway" && i === floorIndex;
          const showRoofs = !interior || i < floorIndex;
          const furniture = interior && i === floorIndex;
          return (
            <Floor3D key={`${house.id}-${i}-${cut}-${showRoofs}`} house={house} fi={i} cut={cut} showRoofs={showRoofs} mats={mats}
              withFurniture={furniture} lights={lights && (!interior || i === floorIndex)} />
          );
        })}
        {view === "cutaway" &&
          house.floors[floorIndex].rooms.map((r) => (
            <Html key={r.id} position={[r.x + r.w / 2, levelOf(floorIndex) + 1.9, r.y + r.h / 2]} center zIndexRange={[20, 0]} style={{ pointerEvents: "auto" }}>
              <button
                onClick={() => onRoomPick(r.id)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-medium tracking-[0.14em] uppercase backdrop-blur transition ${
                  roomId === r.id ? "bg-[#b08d5b] text-white" : "bg-black/55 text-white hover:bg-[#b08d5b]"
                }`}
              >
                {r.name}
              </button>
            </Html>
          ))}
      </group>
      <Surroundings house={house} mats={mats} />
    </>
  );
}

function ReadySignal({ onReady }: { onReady?: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (!done.current) { done.current = true; onReady?.(); }
  });
  return null;
}

export default function Scene(props: SceneProps) {
  const { quality, running } = props;
  const b = props.house.bounds;
  const R = Math.max(b.w, b.h) * 1.35 + 7;
  return (
    <Canvas
      shadows
      frameloop={running ? "always" : "never"}
      dpr={quality === "high" ? [1, 2] : [1, 1.5]}
      camera={{ fov: 32, near: 0.1, far: 700, position: [b.x + b.w / 2, R * 1.5, b.y + b.h / 2 + 0.01] }}
      gl={{ antialias: quality !== "high", powerPreference: "high-performance", toneMapping: quality === "high" ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }}
      style={{ touchAction: "none" }}
    >
      <Suspense fallback={null}>
        <Rig {...props} />
        <Building {...props} />
        <ReadySignal onReady={props.onReady} />
        {quality === "high" && (
          <EffectComposer multisampling={0} enableNormalPass={false}>
            <N8AO aoRadius={1.6} distanceFalloff={1.2} intensity={2.6} quality="medium" halfRes />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            <SMAA />
            <Vignette offset={0.3} darkness={0.45} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}

export { STOREY, WALL_H };
