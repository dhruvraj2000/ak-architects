"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";

/** A lightweight architectural wireframe that slowly turns and follows the pointer. */
function Wire() {
  const group = useRef<THREE.Group>(null);
  const geo = useMemo(() => {
    const parts: [number, number, number, number, number, number][] = [
      // x, y, z centre, w, h, d
      [0, 1.5, 0, 9, 3, 6],        // ground volume
      [-1.5, 4.7, -0.4, 6, 3.4, 5], // upper volume
      [-1.5, 6.55, -0.4, 6.8, 0.3, 5.8], // roof slab
      [3.2, 3.15, 1.6, 4.4, 0.25, 4], // terrace slab
    ];
    const verts: number[] = [];
    for (const [x, y, z, w, h, d] of parts) {
      const e = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
      const p = e.getAttribute("position");
      for (let i = 0; i < p.count; i++) verts.push(p.getX(i) + x, p.getY(i) + y, p.getZ(i) + z);
    }
    // windows
    const win = (x: number, y: number, z: number, w: number, h: number, side: "z" | "x") => {
      const hw = w / 2, hh = h / 2;
      const pts = side === "z"
        ? [[-hw, -hh], [hw, -hh], [hw, -hh], [hw, hh], [hw, hh], [-hw, hh], [-hw, hh], [-hw, -hh]]
        : [[-hw, -hh], [hw, -hh], [hw, -hh], [hw, hh], [hw, hh], [-hw, hh], [-hw, hh], [-hw, -hh]];
      for (const [a, b] of pts) verts.push(side === "z" ? x + a : x, y + b, side === "z" ? z : z + a);
    };
    for (let i = 0; i < 3; i++) win(-2.6 + i * 2.6, 1.6, 3.01, 2, 2, "z");
    for (let i = 0; i < 2; i++) win(-3.3 + i * 3.3, 4.8, 2.11, 2.4, 2.2, "z");
    // site grid
    for (let i = -8; i <= 8; i += 4) {
      verts.push(i, 0, -8, i, 0, 8, -8, 0, i, 8, 0, i);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    return g;
  }, []);

  const ptr = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  useEffect(() => {
    const move = (e: PointerEvent) => {
      ptr.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useFrame(({ clock }, dt) => {
    if (!group.current) return;
    const p = ptr.current;
    p.sx += (p.x - p.sx) * Math.min(1, dt * 3);
    p.sy += (p.y - p.sy) * Math.min(1, dt * 3);
    group.current.rotation.y = -0.6 + clock.getElapsedTime() * 0.12 + p.sx * 0.5;
    group.current.rotation.x = 0.05 + p.sy * 0.08;
  });

  return (
    <group ref={group} position={[3.2, -1.2, 0]} scale={0.5}>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color="#d6b98a" transparent opacity={0.85} />
      </lineSegments>
    </group>
  );
}

export default function HeroWire() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 3, 17], fov: 34 }} gl={{ alpha: true, antialias: true }} style={{ pointerEvents: "none" }} aria-hidden>
      <Wire />
    </Canvas>
  );
}
