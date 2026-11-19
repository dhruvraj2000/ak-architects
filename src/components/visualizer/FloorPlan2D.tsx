"use client";

import { useId, useMemo } from "react";
import type { Floor, FloorMat, Furn, House, Wall } from "@/lib/houses";

export const ft = (m: number) => {
  const total = Math.round(m * 39.3701);
  return `${Math.floor(total / 12)}′${total % 12}″`;
};

const FLOOR_FILL: Record<FloorMat, string> = {
  wood: "#efe2cd",
  tile: "#e4eaea",
  marble: "#f1eee8",
  stone: "#e6e1d6",
  terracotta: "#edd8c5",
};
const INK = "#1b1a17";
const PAPER = "#faf8f3";
const LINE = "#8a7e6c";

function FurnitureShape({ f }: { f: Furn }) {
  const { w, d } = f;
  const hw = w / 2, hd = d / 2;
  const sw = 0.025;
  const common = { stroke: LINE, strokeWidth: sw, fill: "#fff", vectorEffect: "non-scaling-stroke" as const };
  switch (f.t) {
    case "bed":
      return (
        <g>
          <rect x={-hw} y={-hd} width={w} height={d} rx={0.05} {...common} />
          <rect x={-hw + 0.1} y={-hd + 0.1} width={w / 2 - 0.15} height={0.4} rx={0.08} {...common} fill="#f1ebe0" />
          <rect x={0.05} y={-hd + 0.1} width={w / 2 - 0.15} height={0.4} rx={0.08} {...common} fill="#f1ebe0" />
          <path d={`M ${-hw} ${-hd + d * 0.42} H ${hw}`} stroke={LINE} strokeWidth={sw} />
        </g>
      );
    case "sofa":
      return (
        <g>
          <rect x={-hw} y={-hd} width={w} height={d} rx={0.1} {...common} fill="#e8e2d6" />
          <rect x={-hw + 0.18} y={-hd + 0.2} width={w - 0.36} height={d - 0.25} rx={0.06} {...common} fill="#f5f1e9" />
          <path d={`M 0 ${-hd + 0.2} V ${hd - 0.05}`} stroke={LINE} strokeWidth={sw * 0.8} />
        </g>
      );
    case "armchair":
      return (
        <g>
          <rect x={-hw} y={-hd} width={w} height={d} rx={0.12} {...common} fill="#e8e2d6" />
          <rect x={-hw + 0.12} y={-hd + 0.16} width={w - 0.24} height={d - 0.2} rx={0.08} {...common} fill="#f5f1e9" />
        </g>
      );
    case "coffee":
      return <rect x={-hw} y={-hd} width={w} height={d} rx={0.12} {...common} fill="#f3ece0" />;
    case "rug":
      return <rect x={-hw} y={-hd} width={w} height={d} rx={0.04} fill="rgba(160,130,95,0.10)" stroke={LINE} strokeWidth={0.015} strokeDasharray="0.1 0.08" vectorEffect="non-scaling-stroke" />;
    case "dining": {
      const n = f.n ?? 6;
      const perSide = Math.ceil(n / 2);
      const chairs = [];
      for (let i = 0; i < perSide; i++) {
        const cx = -hw + (w * (i + 0.5)) / perSide;
        chairs.push(<rect key={`a${i}`} x={cx - 0.22} y={-hd - 0.5} width={0.44} height={0.42} rx={0.07} {...common} fill="#f3ece0" />);
        if (i < n - perSide) chairs.push(<rect key={`b${i}`} x={cx - 0.22} y={hd + 0.08} width={0.44} height={0.42} rx={0.07} {...common} fill="#f3ece0" />);
      }
      return (
        <g>
          {chairs}
          <rect x={-hw} y={-hd} width={w} height={d} rx={0.06} {...common} fill="#efe3cf" />
        </g>
      );
    }
    case "counter":
      return (
        <g>
          <rect x={-hw} y={-hd} width={w} height={d} {...common} fill="#ece7dd" />
          {w > 1.8 && <rect x={-0.28} y={-hd + 0.1} width={0.56} height={d - 0.2} rx={0.04} {...common} fill="#fff" />}
          {w > 1.8 && <circle cx={w / 4} cy={0} r={0.07} {...common} fill="#ddd" />}
        </g>
      );
    case "island":
      return (
        <g>
          <circle cx={-hw * 0.5} cy={hd + 0.3} r={0.18} {...common} fill="#f3ece0" />
          <circle cx={hw * 0.5} cy={hd + 0.3} r={0.18} {...common} fill="#f3ece0" />
          <rect x={-hw} y={-hd} width={w} height={d} rx={0.04} {...common} fill="#ece7dd" />
        </g>
      );
    case "wardrobe":
      return (
        <g>
          <rect x={-hw} y={-hd} width={w} height={d} {...common} fill="#efe9de" />
          <path d={`M ${-hw} ${-hd} L ${hw} ${hd} M ${hw} ${-hd} L ${-hw} ${hd}`} stroke={LINE} strokeWidth={0.012} opacity={0.5} />
        </g>
      );
    case "desk":
      return (
        <g>
          <circle cx={0} cy={hd + 0.28} r={0.22} {...common} fill="#f3ece0" />
          <rect x={-hw} y={-hd} width={w} height={d} {...common} fill="#efe3cf" />
        </g>
      );
    case "wc":
      return (
        <g>
          <rect x={-hw} y={-hd} width={w} height={0.2} rx={0.03} {...common} />
          <ellipse cx={0} cy={0.08} rx={hw * 0.85} ry={hd * 0.6} {...common} />
        </g>
      );
    case "basin":
      return (
        <g>
          <rect x={-hw} y={-hd} width={w} height={d} rx={0.05} {...common} />
          <ellipse cx={0} cy={0.02} rx={hw * 0.6} ry={hd * 0.55} {...common} fill="#e8f0f2" />
        </g>
      );
    case "shower":
      return (
        <g>
          <rect x={-hw} y={-hd} width={w} height={d} {...common} fill="#e6f0f3" />
          <path d={`M ${-hw} ${-hd} L ${hw} ${hd}`} stroke={LINE} strokeWidth={0.012} opacity={0.6} />
          <circle cx={0} cy={0} r={0.05} {...common} />
        </g>
      );
    case "tub":
      return (
        <g>
          <rect x={-hw} y={-hd} width={w} height={d} rx={0.14} {...common} />
          <rect x={-hw + 0.08} y={-hd + 0.08} width={w - 0.16} height={d - 0.16} rx={0.22} {...common} fill="#e6f0f3" />
        </g>
      );
    case "plant":
      return (
        <g>
          <circle r={hw} {...common} fill="#cddabb" />
          <circle r={hw * 0.55} {...common} fill="#a9bf92" />
        </g>
      );
    case "tvunit":
      return <rect x={-hw} y={-hd} width={w} height={d} {...common} fill="#e5ded1" />;
    case "pooja":
      return (
        <g>
          <rect x={-hw} y={-hd} width={w} height={d} {...common} fill="#f4e6c8" />
          <circle cx={0} cy={0} r={0.07} fill="#d19a3a" stroke="none" />
        </g>
      );
    case "bench":
      return <rect x={-hw} y={-hd} width={w} height={d} rx={0.04} {...common} fill="#efe3cf" />;
    case "stairs": {
      const steps = Math.round(w / 0.25);
      const lines = [];
      for (let i = 1; i < steps; i++) lines.push(<path key={i} d={`M ${-hw + (w * i) / steps} ${-hd} V ${hd}`} stroke={LINE} strokeWidth={0.012} />);
      return (
        <g>
          <rect x={-hw} y={-hd} width={w} height={d} {...common} fill="#fbf9f4" />
          {lines}
          <path d={`M ${-hw + 0.2} 0 H ${hw - 0.25} M ${hw - 0.45} -0.12 L ${hw - 0.25} 0 L ${hw - 0.45} 0.12`} stroke={INK} strokeWidth={0.02} fill="none" />
          <circle cx={-hw + 0.12} cy={0} r={0.06} fill={INK} />
        </g>
      );
    }
    default:
      return null;
  }
}

function WallShape({ w }: { w: Wall }) {
  const t = w.ext ? 0.23 : 0.12;
  const h = t / 2;
  // wall body (extended by half thickness so corners meet cleanly)
  const body = w.horizontal
    ? { x: w.x1 - h, y: w.y1 - h, width: w.x2 - w.x1 + t, height: t }
    : { x: w.x1 - h, y: w.y1 - h, width: t, height: w.y2 - w.y1 + t };
  return (
    <g>
      <rect {...body} fill={INK} />
      {w.openings.map((o, i) => {
        const x0 = w.horizontal ? w.x1 + o.at - o.w / 2 : w.x1;
        const y0 = w.horizontal ? w.y1 : w.y1 + o.at - o.w / 2;
        const gap = w.horizontal
          ? { x: x0, y: w.y1 - h - 0.01, width: o.w, height: t + 0.02 }
          : { x: w.x1 - h - 0.01, y: y0, width: t + 0.02, height: o.w };
        const f = o.f ?? 1;
        return (
          <g key={i}>
            <rect {...gap} fill={PAPER} />
            {(o.kind === "window" || o.kind === "glass") && (
              <g stroke={INK} strokeWidth={0.03} fill="#dff0f5" vectorEffect="non-scaling-stroke">
                <rect {...gap} height={w.horizontal ? t : gap.height} width={w.horizontal ? gap.width : t} x={w.horizontal ? gap.x : w.x1 - h} y={w.horizontal ? w.y1 - h : gap.y} />
                {w.horizontal
                  ? <line x1={x0} x2={x0 + o.w} y1={w.y1} y2={w.y1} />
                  : <line y1={y0} y2={y0 + o.w} x1={w.x1} x2={w.x1} />}
              </g>
            )}
            {o.kind === "door" && (
              w.horizontal ? (
                <g stroke={INK} fill="none" strokeWidth={0.035} vectorEffect="non-scaling-stroke">
                  <line x1={x0} y1={w.y1} x2={x0} y2={w.y1 + f * o.w} />
                  <path d={`M ${x0 + o.w} ${w.y1} A ${o.w} ${o.w} 0 0 ${f === 1 ? 1 : 0} ${x0} ${w.y1 + f * o.w}`} strokeWidth={0.015} strokeDasharray="0.06 0.05" />
                </g>
              ) : (
                <g stroke={INK} fill="none" strokeWidth={0.035} vectorEffect="non-scaling-stroke">
                  <line x1={w.x1} y1={y0} x2={w.x1 + f * o.w} y2={y0} />
                  <path d={`M ${w.x1} ${y0 + o.w} A ${o.w} ${o.w} 0 0 ${f === 1 ? 0 : 1} ${w.x1 + f * o.w} ${y0}`} strokeWidth={0.015} strokeDasharray="0.06 0.05" />
                </g>
              )
            )}
          </g>
        );
      })}
    </g>
  );
}

function Dim({ x1, y1, x2, y2, label, vertical }: { x1: number; y1: number; x2: number; y2: number; label: string; vertical?: boolean }) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return (
    <g stroke={LINE} strokeWidth={0.02} fill={LINE} vectorEffect="non-scaling-stroke">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {vertical ? (
        <>
          <line x1={x1 - 0.12} y1={y1} x2={x1 + 0.12} y2={y1} />
          <line x1={x2 - 0.12} y1={y2} x2={x2 + 0.12} y2={y2} />
        </>
      ) : (
        <>
          <line x1={x1} y1={y1 - 0.12} x2={x1} y2={y1 + 0.12} />
          <line x1={x2} y1={y2 - 0.12} x2={x2} y2={y2 + 0.12} />
        </>
      )}
      <text x={mx} y={my} fontSize={0.3} stroke="none" textAnchor="middle" dominantBaseline="central"
        transform={vertical ? `rotate(-90 ${mx} ${my}) translate(0 -0.28)` : undefined}
        dy={vertical ? 0 : -0.28} fontFamily="var(--font-inter), sans-serif" letterSpacing="0.02em">
        {label}
      </text>
    </g>
  );
}

interface Props {
  house: House;
  floorIndex: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  showFurniture?: boolean;
  showDims?: boolean;
}

export default function FloorPlan2D({ house, floorIndex, selectedId, onSelect, showFurniture = true, showDims = true }: Props) {
  const uid = useId().replace(/:/g, "");
  const floor: Floor = house.floors[floorIndex];
  const { x, y, w, h } = useMemo(() => {
    const b = house.bounds;
    return { x: b.x, y: b.y, w: b.w, h: b.h };
  }, [house]);
  const pad = 2.2;
  const extra = floorIndex === 0 ? house.outdoors : [];
  const minX = Math.min(x, ...extra.map((o) => o.x)) - pad - 0.6;
  const minY = Math.min(y, ...extra.map((o) => o.y)) - pad;
  const maxX = Math.max(x + w, ...extra.map((o) => o.x + o.w)) + pad;
  const maxY = Math.max(y + h, ...extra.map((o) => o.y + o.h)) + pad * 0.7;
  const fx = floor.rooms.reduce((m, r) => Math.min(m, r.x), Infinity);
  const fy = floor.rooms.reduce((m, r) => Math.min(m, r.y), Infinity);
  const fX = floor.rooms.reduce((m, r) => Math.max(m, r.x + r.w), -Infinity);
  const fY = floor.rooms.reduce((m, r) => Math.max(m, r.y + r.h), -Infinity);

  return (
    <svg
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      className="w-full h-full select-none"
      role="img"
      aria-label={`${house.name} ${floor.label} plan`}
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <defs>
        <pattern id={`hatch-${uid}`} width="0.18" height="0.18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="0.18" stroke={LINE} strokeWidth="0.02" />
        </pattern>
      </defs>
      <rect x={minX} y={minY} width={maxX - minX} height={maxY - minY} fill={PAPER} />

      {/* outdoors */}
      {extra.map((o, i) =>
        o.kind === "pool" ? (
          <g key={i}>
            <rect x={o.x} y={o.y} width={o.w} height={o.h} rx={0.15} fill="#cfe8ee" stroke="#86b4c0" strokeWidth={0.04} />
            <text x={o.x + o.w / 2} y={o.y + o.h / 2} fontSize={0.3} textAnchor="middle" dominantBaseline="central" fill="#4e8796" letterSpacing="0.12em">POOL</text>
          </g>
        ) : (
          <rect key={i} x={o.x} y={o.y} width={o.w} height={o.h} fill={o.kind === "deck" ? "#e9ddc8" : "#e8e4db"} stroke={LINE} strokeWidth={0.02} strokeDasharray="0.12 0.08" />
        ),
      )}

      {/* rooms */}
      {floor.rooms.map((r) => {
        const active = selectedId === r.id;
        return (
          <g key={r.id} className="cursor-pointer" onClick={() => onSelect?.(r.id)}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={FLOOR_FILL[r.floor]} style={{ transition: "fill .25s" }}
              stroke="none" className="plan-room" data-active={active || undefined} />
            {active && <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="rgba(176,141,91,0.28)" />}
            {r.hole && (
              <g>
                <rect x={r.hole.x} y={r.hole.y} width={r.hole.w} height={r.hole.h} fill={`url(#hatch-${uid})`} stroke={LINE} strokeWidth={0.02} strokeDasharray="0.1 0.06" />
              </g>
            )}
          </g>
        );
      })}

      {showFurniture &&
        floor.rooms.flatMap((r) => r.furniture).map((f, i) => (
          <g key={i} transform={`translate(${f.x} ${f.y}) rotate(${f.r})`} pointerEvents="none">
            <FurnitureShape f={f} />
          </g>
        ))}

      {floor.walls.map((wl, i) => <WallShape key={i} w={wl} />)}

      {/* labels */}
      {floor.rooms.map((r) => {
        const small = Math.min(r.w, r.h) < 2.2;
        const fs = small ? 0.26 : 0.34;
        return (
          <g key={r.id} pointerEvents="none">
            <text x={r.x + r.w / 2} y={r.y + r.h / 2 - (small ? 0.05 : 0.08)} fontSize={fs} textAnchor="middle" fill={INK}
              letterSpacing="0.1em" fontWeight={600} paintOrder="stroke" stroke={PAPER} strokeWidth={0.12} strokeOpacity={0.85}>
              {r.name.toUpperCase()}
            </text>
            <text x={r.x + r.w / 2} y={r.y + r.h / 2 + (small ? 0.28 : 0.34)} fontSize={small ? 0.2 : 0.24} textAnchor="middle" fill="#6b6253"
              paintOrder="stroke" stroke={PAPER} strokeWidth={0.1} strokeOpacity={0.85}>
              {ft(r.w)} × {ft(r.h)}
            </text>
          </g>
        );
      })}

      {showDims && (
        <>
          <Dim x1={fx} y1={fy - 1.0} x2={fX} y2={fy - 1.0} label={ft(fX - fx)} />
          <Dim x1={fx - 1.0} y1={fy} x2={fx - 1.0} y2={fY} label={ft(fY - fy)} vertical />
        </>
      )}

      {/* north arrow */}
      <g transform={`translate(${maxX - 1.3} ${minY + 1.4})`}>
        <circle r={0.7} fill="none" stroke={LINE} strokeWidth={0.03} />
        <path d="M 0 -0.55 L 0.2 0.25 L 0 0.1 L -0.2 0.25 Z" fill={INK} />
        <text y={-0.82} fontSize={0.3} textAnchor="middle" fill={INK} fontWeight={600}>N</text>
      </g>
    </svg>
  );
}
