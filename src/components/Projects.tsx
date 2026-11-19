"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, MessageCircle, X } from "lucide-react";
import { PROJECTS, type Project, type ProjectType } from "@/lib/projects";
import { SITE, whatsappLink } from "@/lib/site";
import Reveal from "./Reveal";

const TYPES: ("All" | ProjectType)[] = ["All", "Residential", "Commercial", "Interiors"];
const STYLES = ["All styles", "Modern", "Contemporary", "Traditional", "Luxury"] as const;

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-[13px] tracking-wide transition ${
        active ? "bg-[#15140f] text-white" : "text-[#15140f]/65 ring-1 ring-black/10 hover:text-[#15140f] hover:ring-black/30"
      }`}
    >
      {children}
    </button>
  );
}

function Lightbox({ project, onClose }: { project: Project; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const n = project.gallery.length;
  const prev = useCallback(() => setIdx((i) => (i - 1 + n) % n), [n]);
  const next = useCallback(() => setIdx((i) => (i + 1) % n), [n]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", key);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", key); document.body.style.overflow = ""; };
  }, [onClose, prev, next]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex flex-col bg-[#0d0c09]/95 text-[#f5f2ea] backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      onClick={onClose}
    >
      <div className="flex items-center justify-between p-4 md:px-10 md:py-6" onClick={(e) => e.stopPropagation()}>
        <div>
          <p className="eyebrow">{project.type} · {project.style}</p>
          <h3 className="font-display text-2xl md:text-3xl">{project.title}</h3>
        </div>
        <button onClick={onClose} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20">
          <X size={20} />
        </button>
      </div>

      <div className="relative min-h-0 flex-1" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => { if (info.offset.x < -60) next(); else if (info.offset.x > 60) prev(); }}
            className="absolute inset-0 px-4 md:px-24"
          >
            <div className="relative h-full w-full">
              <Image src={project.gallery[idx]} alt={`${project.title} view ${idx + 1}`} fill sizes="100vw" className="object-contain" priority />
            </div>
          </motion.div>
        </AnimatePresence>
        {n > 1 && (
          <>
            <button onClick={prev} aria-label="Previous image" className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 md:grid md:left-6">
              <ChevronLeft />
            </button>
            <button onClick={next} aria-label="Next image" className="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 md:grid md:right-6">
              <ChevronRight />
            </button>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 md:px-10 md:py-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-2">
          {project.gallery.map((g, k) => (
            <button key={g + k} onClick={() => setIdx(k)} aria-label={`View image ${k + 1}`}
              className={`relative h-12 w-16 overflow-hidden rounded-lg ring-2 transition md:h-14 md:w-20 ${k === idx ? "ring-[#b08d5b]" : "opacity-50 ring-transparent hover:opacity-90"}`}>
              <Image src={g} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs text-white/60">
          <span>{project.location}</span><span>{project.year}</span><span>{project.area}</span><span>{project.scope}</span>
          <a href={whatsappLink(`Hello A.K. Architects, I liked the "${project.title}" project and would like something similar.`)} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#b08d5b] px-4 py-2 text-white">
            <MessageCircle size={14} /> Discuss a similar project
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const [type, setType] = useState<"All" | ProjectType>("All");
  const [style, setStyle] = useState<(typeof STYLES)[number]>("All styles");
  const [open, setOpen] = useState<Project | null>(null);

  const list = PROJECTS.filter((p) => (type === "All" || p.type === type) && (style === "All styles" || p.style === style));

  return (
    <section id="projects" className="scroll-mt-20 bg-[#f5f2ea] py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="eyebrow eyebrow-dark mb-4">Selected Work</p>
            <h2 className="font-display text-[2.6rem] leading-[1.02] md:text-6xl">
              Residential, commercial &amp; interiors, <em className="text-[#b08d5b]">designed with intent.</em>
            </h2>
          </div>
          <a href={SITE.instagram} target="_blank" rel="noreferrer" className="group flex items-center gap-2 border-b border-[#15140f] pb-1 text-sm transition hover:border-[#b08d5b] hover:text-[#b08d5b]">
            More on Instagram <ArrowUpRight size={15} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </Reveal>

        <div className="mb-10 flex flex-col gap-4">
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
            {TYPES.map((t) => <Chip key={t} active={type === t} onClick={() => setType(t)}>{t}</Chip>)}
          </div>
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
            {STYLES.map((s) => <Chip key={s} active={style === s} onClick={() => setStyle(s)}>{s}</Chip>)}
          </div>
        </div>

        <motion.div layout className="grid auto-rows-[220px] grid-cols-2 gap-3 md:auto-rows-[260px] md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((p) => (
              <motion.button
                layout
                key={p.id}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setOpen(p)}
                className={`group relative overflow-hidden rounded-2xl text-left ${p.tall ? "row-span-2" : ""}`}
                aria-label={`Open ${p.title}`}
              >
                <Image src={p.image} alt={`${p.title}, ${p.style} ${p.type.toLowerCase()} project in ${p.location}`} fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition duration-[900ms] ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-[#f5f2ea] md:p-5">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#d6b98a]">{p.style} · {p.location}</p>
                  <p className="font-display text-xl leading-tight md:text-2xl">{p.title}</p>
                  <p className="mt-1 max-h-0 overflow-hidden text-xs text-white/70 opacity-0 transition-all duration-500 group-hover:max-h-10 group-hover:opacity-100">
                    {p.scope}
                  </p>
                </div>
                <span className="absolute right-3 top-3 grid h-9 w-9 scale-75 place-items-center rounded-full bg-white/90 text-[#15140f] opacity-0 transition group-hover:scale-100 group-hover:opacity-100">
                  <ArrowUpRight size={16} />
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {list.length === 0 && <p className="py-20 text-center text-[#15140f]/50">No projects match this filter yet.</p>}
      </div>

      <AnimatePresence>{open && <Lightbox project={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  );
}
