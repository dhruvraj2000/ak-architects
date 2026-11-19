"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";
import Reveal from "./Reveal";

/**
 * Before/after slider. "Before" is currently rendered as a monochrome concept-massing treatment of the
 * same photograph. Swap `before` for a true "existing building" photo (same framing) to show real transformations.
 */
const PAIRS = [
  { id: "ext", label: "Exterior", after: "/images/hero-tree-house.webp", before: "/images/hero-tree-house.webp", caption: "Concept massing → completed elevation" },
  { id: "int", label: "Interior", after: "/images/int-lounge.webp", before: "/images/int-lounge.webp", caption: "Layout study → finished living space" },
];

export default function Compare() {
  const [pair, setPair] = useState(PAIRS[0]);
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = useCallback((clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }, []);

  return (
    <section className="bg-[#ebe6da] py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow eyebrow-dark mb-4">Design Transformation</p>
            <h2 className="font-display text-[2.6rem] leading-[1.02] md:text-6xl">From concept <em className="text-[#b08d5b]">to completion.</em></h2>
          </div>
          <div className="flex gap-2">
            {PAIRS.map((p) => (
              <button key={p.id} onClick={() => { setPair(p); setPos(50); }} aria-pressed={pair.id === p.id}
                className={`rounded-full px-5 py-2 text-[13px] transition ${pair.id === p.id ? "bg-[#15140f] text-white" : "ring-1 ring-black/15 hover:ring-black/40"}`}>
                {p.label}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div
            ref={box}
            className="relative aspect-[4/3] w-full cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-3xl md:aspect-[21/10]"
            onPointerDown={(e) => { dragging.current = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); update(e.clientX); }}
            onPointerMove={(e) => dragging.current && update(e.clientX)}
            onPointerUp={() => (dragging.current = false)}
            onPointerCancel={() => (dragging.current = false)}
          >
            <Image src={pair.after} alt="Completed design" fill sizes="(max-width: 1400px) 100vw, 1400px" className="object-cover" />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
              <Image src={pair.before} alt="Concept massing" fill sizes="(max-width: 1400px) 100vw, 1400px"
                className="object-cover [filter:grayscale(1)_contrast(1.25)_brightness(1.15)_sepia(0.15)_hue-rotate(185deg)]" />
              <div className="blueprint absolute inset-0 bg-[#1d3b5c]/35 mix-blend-multiply" />
            </div>
            <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-[11px] tracking-[0.2em] text-white uppercase backdrop-blur">Concept</span>
            <span className="absolute right-4 top-4 rounded-full bg-[#b08d5b] px-3 py-1.5 text-[11px] tracking-[0.2em] text-white uppercase">Completed</span>

            <div className="absolute inset-y-0 w-px bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" style={{ left: `${pos}%` }}>
              <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#15140f] shadow-xl">
                <MoveHorizontal size={18} />
              </span>
            </div>
          </div>
          <p className="mt-4 text-sm text-[#15140f]/55">{pair.caption}. Drag the handle to compare.</p>
        </Reveal>
      </div>
    </section>
  );
}
