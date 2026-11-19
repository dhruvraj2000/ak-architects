"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  Box, Expand, Footprints, Layers, Minimize, MoveRight, RotateCw, Ruler, Sofa, Square, Sun, Sunrise, Moon, Hand, MessageCircle,
} from "lucide-react";
import { HOUSES, SQM_TO_SQFT, type House } from "@/lib/houses";
import { whatsappLink } from "@/lib/site";
import FloorPlan2D, { ft } from "./FloorPlan2D";
import type { Quality, TimeOfDay, View } from "./Scene";
import Reveal from "../Reveal";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

function Seg<T extends string>({ value, onChange, options, small }: {
  value: T; onChange: (v: T) => void; small?: boolean;
  options: { id: T; label: string; icon?: React.ReactNode; hideLabelOnMobile?: boolean }[];
}) {
  return (
    <div className="inline-flex rounded-full bg-black/55 p-1 backdrop-blur-md ring-1 ring-white/10" role="tablist">
      {options.map((o) => (
        <button
          key={o.id}
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={`relative flex items-center gap-1.5 rounded-full ${small ? "px-3 py-1.5 text-[11px]" : "px-4 py-2 text-xs"} font-medium tracking-wide transition-colors ${
            value === o.id ? "text-[#15140f]" : "text-white/80 hover:text-white"
          }`}
        >
          {value === o.id && <motion.span layoutId={`seg-${options.map((x) => x.id).join("")}`} className="absolute inset-0 rounded-full bg-[#f5f2ea]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
          <span className="relative flex items-center gap-1.5">
            {o.icon}
            <span className={o.hideLabelOnMobile ? "hidden sm:inline" : ""}>{o.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

interface Env { webgl: boolean; coarse: boolean; quality: Quality; canFs: boolean }
let envCache: Env | null = null;
function readEnv(): Env {
  if (envCache) return envCache;
  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { webgl = false; }
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8;
  envCache = {
    webgl, coarse,
    quality: !coarse && navigator.hardwareConcurrency > 4 && mem > 4 ? "high" : "balanced",
    canFs: typeof document.documentElement.requestFullscreen === "function",
  };
  return envCache;
}
const noop = () => () => {};
/** Browser capabilities; null during SSR/hydration so server and client markup agree. */
function useEnv(): Env | null {
  return useSyncExternalStore(noop, readEnv, () => null);
}

export default function Visualizer() {
  const [hid, setHid] = useState(HOUSES[0].id);
  const house: House = HOUSES.find((h) => h.id === hid)!;
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [view, setView] = useState<View>("exterior");
  const [floorIndex, setFloorIndex] = useState(0);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [time, setTime] = useState<TimeOfDay>("day");
  const [auto, setAuto] = useState(false);
  const [introKey, setIntroKey] = useState(0);
  const [ready, setReady] = useState(false);
  const [mounted3d, setMounted3d] = useState(false);
  const [furniture, setFurniture] = useState(true);
  const [dims, setDims] = useState(true);
  const [locked, setLocked] = useState(true);
  const [fs, setFs] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { margin: "200px" });
  const [visible, setVisible] = useState(true);
  const env = useEnv();
  const webgl = env ? env.webgl : null;
  const coarse = env?.coarse ?? false;
  const quality: Quality = env?.quality ?? "balanced";
  const canFs = env?.canFs ?? false;

  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener("visibilitychange", onVis);
    document.addEventListener("fullscreenchange", onFs);
    return () => { document.removeEventListener("visibilitychange", onVis); document.removeEventListener("fullscreenchange", onFs); };
  }, []);

  const floor = house.floors[Math.min(floorIndex, house.floors.length - 1)];
  const room = floor.rooms.find((r) => r.id === roomId) ?? null;
  const running = mode === "3d" && inView && visible;

  const go3d = () => {
    setMode("3d");
    setMounted3d(true);
    setView("exterior");
    setRoomId(null);
    setIntroKey((k) => k + 1);
    setAuto(!coarse);
    setLocked(true);
  };

  const pickHouse = (id: string) => {
    setHid(id);
    setFloorIndex(0);
    setRoomId(null);
    setView("exterior");
    if (mode === "3d") setIntroKey((k) => k + 1);
  };

  const biggest = (i: number) => [...house.floors[i].rooms].sort((a, b) => b.w * b.h - a.w * a.h)[0];

  const changeView = (v: View) => {
    setView(v);
    if (v === "walk") setRoomId((cur) => (cur && floor.rooms.some((r) => r.id === cur) ? cur : biggest(floorIndex).id));
    else setRoomId(null);
    if (v !== "exterior") setAuto(false);
  };

  const changeFloor = (i: number) => {
    setFloorIndex(i);
    setRoomId(null);
    if (mode === "3d" && view === "exterior") setView("cutaway");
    if (mode === "3d" && view === "walk") setRoomId(biggest(i).id);
  };

  const pickRoom = (id: string) => {
    setRoomId(id);
    if (mode === "3d") { setView("walk"); setAuto(false); }
  };

  const toggleFs = () => {
    if (!stage.current) return;
    if (document.fullscreenElement) document.exitFullscreen(); else stage.current.requestFullscreen?.();
  };

  const sqft = house.area;
  const msg = `Hello A.K. Architects, I'd like to discuss a design similar to "${house.name}" (${house.style}, ~${sqft} sq ft).`;
  const canvasActive = mode === "3d" && mounted3d && webgl;

  return (
    <section id="visualizer" className="relative scroll-mt-20 bg-[#15140f] py-24 text-[#f5f2ea] md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">Interactive Home Visualizer</p>
            <h2 className="font-display text-[2.6rem] leading-[1.02] md:text-6xl">
              Walk through a home <em className="text-[#c9a878]">before it is built.</em>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#f5f2ea]/60">
            Four design collections, each fully modelled. Study the dimensioned floor plan, then switch to 3D to orbit the house, cut through the
            floors and step inside every room.
          </p>
        </Reveal>

        {/* collection picker */}
        <div className="no-scrollbar -mx-5 mb-6 flex snap-x gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {HOUSES.map((h) => {
            const active = h.id === hid;
            return (
              <button
                key={h.id}
                onClick={() => pickHouse(h.id)}
                aria-pressed={active}
                className={`group relative aspect-[16/10] w-[72%] shrink-0 snap-start overflow-hidden rounded-2xl text-left ring-1 transition md:w-auto ${active ? "ring-2 ring-[#b08d5b]" : "ring-white/10 hover:ring-white/30"}`}
              >
                <Image src={h.photo} alt="" fill sizes="(max-width: 768px) 72vw, 25vw" className={`object-cover transition duration-700 ${active ? "scale-105" : "scale-100 group-hover:scale-105"}`} />
                <div className={`absolute inset-0 transition ${active ? "bg-gradient-to-t from-black/80 via-black/20 to-transparent" : "bg-gradient-to-t from-black/85 via-black/45 to-black/20"}`} />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#d6b98a]">{h.style}</p>
                  <p className="font-display text-xl leading-tight">{h.name}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* ─────────────── stage ─────────────── */}
          <div
            ref={stage}
            className="relative h-[68vh] min-h-[460px] overflow-hidden rounded-3xl bg-[#faf8f3] ring-1 ring-white/10 lg:h-[720px]"
          >
            {/* 2D */}
            <AnimatePresence>
              {mode === "2d" && (
                <motion.div
                  key="plan"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.12, filter: "blur(6px)" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 p-3 pt-16 text-[#15140f] md:p-8 md:pt-16"
                >
                  <FloorPlan2D house={house} floorIndex={Math.min(floorIndex, house.floors.length - 1)} selectedId={roomId} onSelect={pickRoom} showFurniture={furniture} showDims={dims} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3D */}
            {mounted3d && webgl && (
              <motion.div
                className="absolute inset-0 bg-[#cfdcea]"
                initial={false}
                animate={{ opacity: mode === "3d" ? 1 : 0 }}
                transition={{ duration: 0.7 }}
                style={{ pointerEvents: mode === "3d" ? "auto" : "none" }}
              >
                <Scene
                  house={house}
                  view={view}
                  floorIndex={Math.min(floorIndex, house.floors.length - 1)}
                  roomId={roomId}
                  time={time}
                  autoRotate={auto}
                  quality={quality}
                  introKey={introKey}
                  running={running}
                  onRoomPick={pickRoom}
                  onReady={() => setReady(true)}
                />
                {!ready && (
                  <div className="absolute inset-0 grid place-items-center bg-[#15140f]/60 text-xs tracking-[0.3em] text-white/80">
                    <span className="animate-pulse">PREPARING MODEL…</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* touch-lock overlay so the page can still scroll on phones */}
            {canvasActive && coarse && locked && (
              <button
                onClick={() => setLocked(false)}
                aria-label="Tap to interact with the 3D model"
                className="absolute inset-0 z-10 flex items-end justify-center pb-24"
                style={{ touchAction: "pan-y" }}
              >
                <span className="flex items-center gap-2 rounded-full bg-black/65 px-4 py-2.5 text-xs font-medium text-white backdrop-blur">
                  <Hand size={14} /> Tap to explore in 3D
                </span>
              </button>
            )}

            {/* top bar */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-2 p-3 md:p-5">
              <div className="pointer-events-auto">
                <Seg
                  value={mode}
                  onChange={(m) => (m === "3d" ? go3d() : setMode("2d"))}
                  options={[
                    { id: "2d", label: "2D Plan", icon: <Square size={13} /> },
                    { id: "3d", label: "3D Model", icon: <Box size={13} /> },
                  ]}
                />
              </div>
              <div className="pointer-events-auto flex items-center gap-2">
                {house.floors.length > 1 && (mode === "2d" || view !== "exterior") && (
                  <Seg small value={String(floorIndex)} onChange={(v) => changeFloor(Number(v))}
                    options={house.floors.map((f, i) => ({ id: String(i), label: f.label.replace(" Floor", ""), icon: <Layers size={12} /> }))} />
                )}
                {canvasActive && coarse && !locked && (
                  <button onClick={() => setLocked(true)} className="rounded-full bg-[#b08d5b] px-3.5 py-2 text-xs font-medium text-white">Done</button>
                )}
                {canFs && (
                  <button onClick={toggleFs} aria-label="Toggle fullscreen" className="grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md ring-1 ring-white/10 hover:bg-black/75">
                    {fs ? <Minimize size={15} /> : <Expand size={15} />}
                  </button>
                )}
              </div>
            </div>

            {/* 2D bottom bar */}
            {mode === "2d" && (
              <div className="absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-center justify-between gap-2 p-3 md:p-5">
                <div className="flex gap-2">
                  <Toggle on={furniture} onClick={() => setFurniture((v) => !v)} icon={<Sofa size={13} />} label="Furniture" />
                  <Toggle on={dims} onClick={() => setDims((v) => !v)} icon={<Ruler size={13} />} label="Dimensions" />
                </div>
                <button onClick={go3d} className="group flex items-center gap-2 rounded-full bg-[#15140f] px-5 py-2.5 text-xs font-medium tracking-wide text-white transition hover:bg-[#b08d5b]">
                  View in 3D <MoveRight size={14} className="transition group-hover:translate-x-1" />
                </button>
              </div>
            )}

            {/* 3D bottom bar */}
            {mode === "3d" && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-end justify-between gap-2 p-3 md:p-5">
                <div className="pointer-events-auto flex flex-wrap gap-2">
                  <Seg small value={view} onChange={changeView}
                    options={[
                      { id: "exterior", label: "Exterior", icon: <Box size={12} /> },
                      { id: "cutaway", label: "Cutaway", icon: <Layers size={12} /> },
                      { id: "walk", label: "Walk-in", icon: <Footprints size={12} /> },
                    ]} />
                </div>
                <div className="pointer-events-auto flex flex-wrap gap-2">
                  <Seg small value={time} onChange={setTime}
                    options={[
                      { id: "day", label: "Day", icon: <Sun size={12} />, hideLabelOnMobile: true },
                      { id: "golden", label: "Golden", icon: <Sunrise size={12} />, hideLabelOnMobile: true },
                      { id: "dusk", label: "Dusk", icon: <Moon size={12} />, hideLabelOnMobile: true },
                    ]} />
                  {view === "exterior" && (
                    <button
                      onClick={() => setAuto((a) => !a)}
                      aria-pressed={auto}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-medium backdrop-blur-md ring-1 ring-white/10 transition ${auto ? "bg-[#b08d5b] text-white" : "bg-black/55 text-white/85 hover:text-white"}`}
                    >
                      <RotateCw size={12} className={auto ? "animate-spin [animation-duration:6s]" : ""} /> 360°
                    </button>
                  )}
                </div>
              </div>
            )}

            {mode === "3d" && ready && (
              <p className="pointer-events-none absolute left-1/2 top-16 z-10 hidden -translate-x-1/2 rounded-full bg-black/40 px-4 py-1.5 text-[11px] tracking-wide text-white/80 backdrop-blur md:block">
                {view === "walk" ? "Drag to look around" : "Drag to orbit · Scroll to zoom · Right-drag to pan"}
              </p>
            )}

            {webgl === false && (
              <div className="absolute inset-0 z-30 grid place-items-center bg-[#15140f]/80 p-8 text-center text-sm text-white/80">
                3D view needs WebGL, which this browser has disabled. The 2D plans remain fully available.
              </div>
            )}
          </div>

          {/* ─────────────── sidebar ─────────────── */}
          <aside className="flex flex-col gap-5">
            <div className="rounded-3xl bg-[#1f1e18] p-6 ring-1 ring-white/10">
              <p className="eyebrow mb-3">{house.style} collection</p>
              <h3 className="font-display text-3xl leading-tight">{house.name}</h3>
              <p className="mt-1 text-xs tracking-wide text-white/45">{house.location}</p>
              <p className="mt-4 text-sm leading-relaxed text-white/65">{house.blurb}</p>
              <dl className="mt-6 grid grid-cols-3 gap-y-5 border-t border-white/10 pt-5 text-center">
                {[
                  [`${sqft.toLocaleString("en-IN")}`, "sq ft"],
                  [`${house.beds}`, "Bedrooms"],
                  [`${house.baths}`, "Bathrooms"],
                  [house.plot, "Plot"],
                  [`${house.floors.length}`, "Floors"],
                  [`${Math.round(sqft / SQM_TO_SQFT)}`, "sq m"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <dt className="font-display text-xl">{v}</dt>
                    <dd className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-white/40">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex-1 rounded-3xl bg-[#1f1e18] p-6 ring-1 ring-white/10">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">{floor.label} · rooms</p>
                {mode === "3d" && view !== "walk" && <span className="text-[10px] text-white/35">tap to walk in</span>}
              </div>
              <ul className="no-scrollbar max-h-[280px] space-y-1 overflow-y-auto pr-1 lg:max-h-[300px]">
                {floor.rooms.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => pickRoom(r.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${roomId === r.id ? "bg-[#b08d5b] text-white" : "text-white/75 hover:bg-white/5"}`}
                    >
                      <span>{r.name}</span>
                      <span className={`text-xs ${roomId === r.id ? "text-white/85" : "text-white/35"}`}>{ft(r.w)} × {ft(r.h)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {room && (
                <p className="mt-3 border-t border-white/10 pt-3 text-xs text-white/45">
                  {room.name}: {(room.w * room.h).toFixed(1)} m² · {Math.round(room.w * room.h * SQM_TO_SQFT)} sq ft
                </p>
              )}
            </div>

            <a
              href={whatsappLink(msg)}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-2xl bg-[#f5f2ea] px-6 py-4 text-sm font-medium text-[#15140f] transition hover:bg-[#b08d5b] hover:text-white"
            >
              <span className="flex items-center gap-2"><MessageCircle size={16} /> Enquire about this design</span>
              <MoveRight size={16} className="transition group-hover:translate-x-1" />
            </a>
          </aside>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-white/35">
          Plans and 3D models are indicative concept designs. Final drawings are tailored to your plot, orientation and vastu requirements.
        </p>
      </div>
    </section>
  );
}

function Toggle({ on, onClick, icon, label }: { on: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-medium ring-1 transition ${on ? "bg-[#15140f] text-white ring-[#15140f]" : "bg-white text-[#15140f]/70 ring-black/10 hover:text-[#15140f]"}`}
    >
      {icon} {label}
    </button>
  );
}
