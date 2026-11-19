"use client";

import { memo, useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { STOREY, type Furn } from "@/lib/houses";

const FABRICS = ["#d8d0c2", "#b9b2a4", "#8d9a94", "#c9a98a", "#7d8798", "#cfc7b8"];

function useFM() {
  return useMemo(() => {
    const std = (color: string, roughness = 0.8, metalness = 0, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
      new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    return {
      wood: std("#8a6040", 0.55),
      walnut: std("#5b3b26", 0.5),
      oak: std("#c19a6b", 0.6),
      white: std("#f3f0ea", 0.55),
      linen: std("#ece6da", 0.95),
      cabinet: std("#e9e4da", 0.5),
      dark: std("#26272a", 0.45, 0.3),
      stone: std("#2f2f31", 0.25, 0.1),
      ceramic: std("#fbfbfa", 0.2),
      brass: std("#b58f4f", 0.3, 0.85),
      leaf: std("#46683a", 0.85),
      leaf2: std("#5d8148", 0.85),
      pot: std("#8c7b6b", 0.9),
      glass: std("#b7d6dd", 0.05, 0.1, { transparent: true, opacity: 0.25, depthWrite: false }),
      water: std("#bfe2e8", 0.1),
      rug: std("#cfc4b2", 1),
      fabrics: FABRICS.map((c) => std(c, 0.95)),
    };
  }, []);
}
type FM = ReturnType<typeof useFM>;

const RB = ({ args, position, material, r = 0.03 }: { args: [number, number, number]; position: [number, number, number]; material: THREE.Material; r?: number }) => (
  <RoundedBox args={args} position={position} radius={Math.min(r, Math.min(...args) / 2 - 0.001)} smoothness={3} castShadow receiveShadow material={material} />
);
const B = ({ args, position, material }: { args: [number, number, number]; position: [number, number, number]; material: THREE.Material }) => (
  <mesh position={position} castShadow receiveShadow material={material}>
    <boxGeometry args={args} />
  </mesh>
);

function Chair({ x, z, rot, m }: { x: number; z: number; rot: number; m: FM }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <RB args={[0.42, 0.06, 0.42]} position={[0, 0.45, 0]} material={m.fabrics[0]} r={0.02} />
      <RB args={[0.42, 0.42, 0.05]} position={[0, 0.72, -0.2]} material={m.fabrics[0]} r={0.02} />
      {[[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]].map(([a, c], i) => (
        <B key={i} args={[0.03, 0.44, 0.03]} position={[a, 0.22, c]} material={m.walnut} />
      ))}
    </group>
  );
}

function Plant({ s, m }: { s: number; m: FM }) {
  const spheres = useMemo(() => [[0, 0.95, 0, 0.32], [0.12, 1.2, 0.05, 0.26], [-0.1, 0.75, 0.08, 0.24], [0.05, 1.42, -0.06, 0.18]] as const, []);
  return (
    <group scale={s * 2.0}>
      <mesh position={[0, 0.2, 0]} castShadow material={m.pot}>
        <cylinderGeometry args={[0.2, 0.15, 0.4, 20]} />
      </mesh>
      <mesh position={[0, 0.4, 0]} material={m.walnut}>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 16]} />
      </mesh>
      {spheres.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow material={i % 2 ? m.leaf2 : m.leaf}>
          <icosahedronGeometry args={[r, 1]} />
        </mesh>
      ))}
    </group>
  );
}

function Stairs({ f, m }: { f: Furn; m: FM }) {
  const n = Math.round(f.w / 0.25);
  const run = f.w / n;
  const rise = STOREY / n;
  return (
    <group>
      {Array.from({ length: n }).map((_, i) => (
        <group key={i}>
          <B args={[run, rise * (i + 1) - 0.04, f.d]} position={[-f.w / 2 + run * (i + 0.5), (rise * (i + 1) - 0.04) / 2, 0]} material={m.white} />
          <B args={[run + 0.03, 0.045, f.d + 0.04]} position={[-f.w / 2 + run * (i + 0.5) - 0.0, rise * (i + 1) - 0.02, 0]} material={m.walnut} />
        </group>
      ))}
      {/* glass balustrade on open side */}
      <mesh position={[0, STOREY / 2 + 0.45, f.d / 2 + 0.01]} rotation={[0, 0, Math.atan2(STOREY, f.w)]} material={m.glass}>
        <boxGeometry args={[Math.hypot(f.w, STOREY), 0.9, 0.012]} />
      </mesh>
    </group>
  );
}

function Piece({ f, m, idx }: { f: Furn; m: FM; idx: number }) {
  const { w, d } = f;
  const fab = m.fabrics[idx % m.fabrics.length];
  switch (f.t) {
    case "bed": {
      const accent = m.fabrics[(idx + 3) % m.fabrics.length];
      return (
        <group>
          <RB args={[w, 0.3, d]} position={[0, 0.15, 0]} material={m.walnut} r={0.02} />
          <RB args={[w - 0.08, 0.24, d - 0.1]} position={[0, 0.42, 0.03]} material={m.linen} r={0.07} />
          <RB args={[w + 0.12, 1.05, 0.08]} position={[0, 0.52, -d / 2 + 0.02]} material={m.walnut} r={0.03} />
          <RB args={[w * 0.43, 0.12, 0.38]} position={[-w * 0.24, 0.6, -d / 2 + 0.35]} material={m.white} r={0.05} />
          <RB args={[w * 0.43, 0.12, 0.38]} position={[w * 0.24, 0.6, -d / 2 + 0.35]} material={m.white} r={0.05} />
          <RB args={[w - 0.05, 0.07, d * 0.5]} position={[0, 0.56, d * 0.2]} material={accent} r={0.03} />
          <RB args={[0.45, 0.5, 0.4]} position={[-w / 2 - 0.3, 0.25, -d / 2 + 0.25]} material={m.walnut} r={0.02} />
          <RB args={[0.45, 0.5, 0.4]} position={[w / 2 + 0.3, 0.25, -d / 2 + 0.25]} material={m.walnut} r={0.02} />
        </group>
      );
    }
    case "sofa": {
      const seats = Math.max(2, Math.round((w - 0.4) / 0.75));
      const sw = (w - 0.36) / seats;
      return (
        <group>
          <RB args={[w, 0.2, d]} position={[0, 0.12, 0]} material={m.dark} r={0.02} />
          {Array.from({ length: seats }).map((_, i) => (
            <RB key={i} args={[sw - 0.02, 0.2, d - 0.22]} position={[-w / 2 + 0.18 + sw * (i + 0.5), 0.34, 0.1]} material={fab} r={0.07} />
          ))}
          <RB args={[w, 0.55, 0.22]} position={[0, 0.5, -d / 2 + 0.11]} material={fab} r={0.08} />
          <RB args={[0.18, 0.28, d - 0.05]} position={[-w / 2 + 0.09, 0.44, 0]} material={fab} r={0.07} />
          <RB args={[0.18, 0.28, d - 0.05]} position={[w / 2 - 0.09, 0.44, 0]} material={fab} r={0.07} />
          <RB args={[0.4, 0.4, 0.12]} position={[-w / 2 + 0.5, 0.62, -d / 2 + 0.3]} material={m.fabrics[(idx + 2) % 6]} r={0.05} />
        </group>
      );
    }
    case "armchair":
      return (
        <group>
          <RB args={[w, 0.2, d]} position={[0, 0.12, 0]} material={m.dark} r={0.02} />
          <RB args={[w - 0.3, 0.2, d - 0.2]} position={[0, 0.34, 0.07]} material={fab} r={0.07} />
          <RB args={[w, 0.6, 0.2]} position={[0, 0.5, -d / 2 + 0.1]} material={fab} r={0.08} />
          <RB args={[0.15, 0.3, d - 0.1]} position={[-w / 2 + 0.08, 0.45, 0]} material={fab} r={0.06} />
          <RB args={[0.15, 0.3, d - 0.1]} position={[w / 2 - 0.08, 0.45, 0]} material={fab} r={0.06} />
        </group>
      );
    case "coffee":
      return (
        <group>
          <RB args={[w, 0.04, d]} position={[0, 0.38, 0]} material={m.oak} r={0.02} />
          <RB args={[w - 0.1, 0.03, d - 0.1]} position={[0, 0.2, 0]} material={m.walnut} r={0.01} />
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, c], i) => (
            <B key={i} args={[0.03, 0.38, 0.03]} position={[(a * (w - 0.1)) / 2, 0.19, (c * (d - 0.1)) / 2]} material={m.dark} />
          ))}
        </group>
      );
    case "rug":
      return <RB args={[w, 0.015, d]} position={[0, 0.008, 0]} material={m.fabrics[(idx + 1) % 6]} r={0.005} />;
    case "dining": {
      const n = f.n ?? 6;
      const per = Math.ceil(n / 2);
      return (
        <group>
          <RB args={[w, 0.05, d]} position={[0, 0.75, 0]} material={m.oak} r={0.02} />
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, c], i) => (
            <B key={i} args={[0.07, 0.73, 0.07]} position={[(a * (w - 0.2)) / 2, 0.365, (c * (d - 0.15)) / 2]} material={m.walnut} />
          ))}
          {Array.from({ length: per }).map((_, i) => {
            const x = -w / 2 + (w * (i + 0.5)) / per;
            return (
              <group key={i}>
                <Chair x={x} z={-d / 2 - 0.3} rot={Math.PI} m={m} />
                {i < n - per && <Chair x={x} z={d / 2 + 0.3} rot={0} m={m} />}
              </group>
            );
          })}
          <mesh position={[0, 0.82, 0]} material={m.ceramic} castShadow>
            <cylinderGeometry args={[0.1, 0.07, 0.12, 18]} />
          </mesh>
        </group>
      );
    }
    case "counter":
      return (
        <group>
          <RB args={[w, 0.84, d]} position={[0, 0.42, 0]} material={m.cabinet} r={0.01} />
          <RB args={[w + 0.02, 0.04, d + 0.03]} position={[0, 0.86, 0.01]} material={m.stone} r={0.01} />
          {w > 1.8 && <RB args={[w, 0.7, 0.34]} position={[0, 1.65, -d / 2 + 0.17]} material={m.cabinet} r={0.01} />}
        </group>
      );
    case "island":
      return (
        <group>
          <RB args={[w - 0.1, 0.84, d - 0.1]} position={[0, 0.42, -0.02]} material={m.oak} r={0.01} />
          <RB args={[w + 0.05, 0.05, d + 0.05]} position={[0, 0.87, 0]} material={m.white} r={0.015} />
          {[-0.28, 0.28].map((s, i) => (
            <group key={i} position={[w * s, 0, d / 2 + 0.3]}>
              <mesh position={[0, 0.65, 0]} material={m.fabrics[0]}><cylinderGeometry args={[0.17, 0.17, 0.05, 18]} /></mesh>
              <mesh position={[0, 0.32, 0]} material={m.dark}><cylinderGeometry args={[0.02, 0.02, 0.64, 8]} /></mesh>
            </group>
          ))}
        </group>
      );
    case "wardrobe": {
      const doors = Math.max(2, Math.round(w / 0.6));
      return (
        <group>
          <RB args={[w, 2.2, d]} position={[0, 1.1, 0]} material={m.oak} r={0.01} />
          {Array.from({ length: doors - 1 }).map((_, i) => (
            <B key={i} args={[0.008, 2.1, 0.01]} position={[-w / 2 + (w * (i + 1)) / doors, 1.1, d / 2 + 0.003]} material={m.walnut} />
          ))}
          {Array.from({ length: doors }).map((_, i) => (
            <B key={i} args={[0.015, 0.3, 0.015]} position={[-w / 2 + (w * (i + 0.5)) / doors + 0.06, 1.05, d / 2 + 0.015]} material={m.brass} />
          ))}
        </group>
      );
    }
    case "desk":
      return (
        <group>
          <RB args={[w, 0.04, d]} position={[0, 0.74, 0]} material={m.oak} r={0.01} />
          <B args={[0.04, 0.72, d - 0.05]} position={[-w / 2 + 0.05, 0.36, 0]} material={m.dark} />
          <B args={[0.04, 0.72, d - 0.05]} position={[w / 2 - 0.05, 0.36, 0]} material={m.dark} />
          <B args={[0.45, 0.3, 0.02]} position={[0, 1.0, -d / 2 + 0.1]} material={m.dark} />
          <Chair x={0} z={d / 2 + 0.3} rot={0} m={m} />
        </group>
      );
    case "tvunit":
      return (
        <group>
          <RB args={[w, 0.45, d]} position={[0, 0.225, 0]} material={m.walnut} r={0.02} />
          <B args={[w * 0.72, 0.5, 0.035]} position={[0, 0.98, -d / 2 + 0.06]} material={m.dark} />
        </group>
      );
    case "pooja":
      return (
        <group>
          <RB args={[w, 0.85, d]} position={[0, 0.425, 0]} material={m.walnut} r={0.02} />
          <RB args={[w, 0.95, d * 0.8]} position={[0, 1.33, -d * 0.1]} material={m.oak} r={0.02} />
          <B args={[w * 0.7, 0.65, 0.01]} position={[0, 1.3, d * 0.3 + 0.01]} material={m.brass} />
          <mesh position={[0, 0.9, 0.05]} material={m.brass}><cylinderGeometry args={[0.04, 0.05, 0.05, 12]} /></mesh>
        </group>
      );
    case "bench":
      return (
        <group>
          <RB args={[w, 0.08, d]} position={[0, 0.42, 0]} material={m.oak} r={0.02} />
          <B args={[w - 0.1, 0.4, d - 0.1]} position={[0, 0.2, 0]} material={m.dark} />
        </group>
      );
    case "wc":
      return (
        <group>
          <RB args={[w, 0.4, 0.2]} position={[0, 0.65, -d / 2 + 0.1]} material={m.ceramic} r={0.03} />
          <RB args={[w - 0.04, 0.38, d - 0.2]} position={[0, 0.2, 0.1]} material={m.ceramic} r={0.08} />
        </group>
      );
    case "basin":
      return (
        <group>
          <RB args={[w + 0.3, 0.7, d]} position={[0, 0.35, 0]} material={m.walnut} r={0.01} />
          <RB args={[w + 0.34, 0.04, d + 0.02]} position={[0, 0.72, 0]} material={m.white} r={0.01} />
          <mesh position={[0, 0.74, 0]} material={m.ceramic}><cylinderGeometry args={[0.17, 0.14, 0.04, 24]} /></mesh>
          <B args={[w, 0.7, 0.02]} position={[0, 1.4, -d / 2 + 0.01]} material={m.glass} />
        </group>
      );
    case "shower":
      return (
        <group>
          <B args={[w, 0.04, d]} position={[0, 0.02, 0]} material={m.ceramic} />
          <B args={[w, 2.0, 0.012]} position={[0, 1.0, d / 2]} material={m.glass} />
          <B args={[0.012, 2.0, d]} position={[w / 2, 1.0, 0]} material={m.glass} />
          <mesh position={[0, 2.0, -d / 2 + 0.12]} material={m.brass}><cylinderGeometry args={[0.1, 0.1, 0.02, 16]} /></mesh>
        </group>
      );
    case "tub":
      return (
        <group>
          <RB args={[w, 0.55, d]} position={[0, 0.275, 0]} material={m.ceramic} r={0.14} />
          <RB args={[w - 0.14, 0.02, d - 0.14]} position={[0, 0.54, 0]} material={m.water} r={0.12} />
        </group>
      );
    case "stairs":
      return <Stairs f={f} m={m} />;
    case "plant":
      return <Plant s={f.w} m={m} />;
    default:
      return null;
  }
}

function Furniture3D({ items, level }: { items: Furn[]; level: number }) {
  const m = useFM();
  return (
    <group position={[0, level, 0]}>
      {items.map((f, i) => (
        <group key={i} position={[f.x, 0, f.y]} rotation={[0, (-f.r * Math.PI) / 180, 0]}>
          <Piece f={f} m={m} idx={i} />
        </group>
      ))}
    </group>
  );
}

export default memo(Furniture3D);
