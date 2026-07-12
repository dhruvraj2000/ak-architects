"use client";

import { motion } from "framer-motion";
import Reveal from "./Reveal";

const projects = [
  {
    title: "Serene Villa",
    tag: "Residential · Elevation",
    img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
    span: "md:row-span-2",
  },
  {
    title: "Sunlit Living",
    tag: "Interior Design",
    img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop",
    span: "",
  },
  {
    title: "Courtyard House",
    tag: "Vastu · Planning",
    img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
    span: "",
  },
  {
    title: "Minimal Facade",
    tag: "Elevation",
    img: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop",
    span: "",
  },
  {
    title: "Warm Interiors",
    tag: "Interior Design",
    img: "https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=1200&auto=format&fit=crop",
    span: "",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="scroll-mt-24 py-28 md:py-36 bg-[#f6f4ef]">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal className="flex flex-wrap items-end justify-between gap-6 mb-16">
          <div className="max-w-xl">
            <p className="text-xs tracking-[0.3em] text-[var(--accent)] mb-4">
              SELECTED WORK
            </p>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight">
              A few spaces we&apos;ve shaped
            </h2>
          </div>
          <a
            href="https://www.instagram.com/a.k._architects/"
            target="_blank"
            rel="noreferrer"
            className="text-sm border-b border-[#1c1b19] pb-1 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
          >
            More on Instagram →
          </a>
        </Reveal>

        <div className="grid md:grid-cols-3 auto-rows-[240px] gap-5">
          {projects.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08} className={p.span}>
              <motion.div
                whileHover="hover"
                className="relative h-full w-full rounded-2xl overflow-hidden group"
              >
                <motion.img
                  variants={{ hover: { scale: 1.08 } }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  src={p.img}
                  alt={p.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1b19]/85 via-[#1c1b19]/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                <motion.div
                  variants={{ hover: { y: -4 } }}
                  className="absolute bottom-0 left-0 p-6 text-[#f6f4ef]"
                >
                  <p className="text-[10px] tracking-[0.25em] text-[var(--accent)] mb-1">
                    {p.tag.toUpperCase()}
                  </p>
                  <p className="font-serif text-xl">{p.title}</p>
                </motion.div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
