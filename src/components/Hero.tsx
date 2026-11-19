"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { SITE } from "@/lib/site";
import InstagramIcon from "./icons/InstagramIcon";

const HeroWire = dynamic(() => import("./HeroWire"), { ssr: false });

const SLIDES = [
  { src: "/images/hero-villa-pool.webp", caption: "Signature Villa · Udaipur" },
  { src: "/images/hero-tree-house.webp", caption: "Canopy House · Jaipur" },
  { src: "/images/hero-white-villa.webp", caption: "Sky Villa · Nathdwara" },
  { src: "/images/hero-pool-house.webp", caption: "Pool Residence · Kota" },
];

const LINES = [["We", "Design", "Spaces"], ["You'll", "Never", "Want"], ["To", "Leave."]];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const [wire, setWire] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 6500);
    return () => clearInterval(t);
  }, []);

  // Defer the WebGL accent until the page is idle so the first paint stays fast.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (n: number) => void;
    };
    const id = w.requestIdleCallback ? w.requestIdleCallback(() => setWire(true)) : setTimeout(() => setWire(true), 1200);
    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(id as number);
      else clearTimeout(id);
    };
  }, []);

  return (
    <section id="top" ref={ref} className="grain relative h-[100svh] min-h-[640px] overflow-hidden bg-[#15140f] text-[#f5f2ea]">
      {/* cinematic crossfading slides with slow push-in */}
      <motion.div style={{ y }} className="absolute inset-0 -top-[6%] h-[112%]">
        <AnimatePresence mode="sync">
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1.0 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.6 }, scale: { duration: 9, ease: "linear" } }}
            className="absolute inset-0"
          >
            <Image src={SLIDES[i].src} alt={SLIDES[i].caption} fill priority={i === 0} sizes="100vw" quality={80} className="object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-[#15140f] via-[#15140f]/35 to-[#15140f]/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#15140f]/70 via-transparent to-transparent" />
      </motion.div>

      {wire && (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full opacity-40 md:w-[58%] md:opacity-90" aria-hidden>
          <HeroWire />
        </div>
      )}

      <motion.div style={{ opacity: fade, y: textY }} className="relative z-10 flex h-full flex-col justify-end">
        <div className="mx-auto w-full max-w-[1400px] px-5 pb-24 md:px-10 md:pb-28">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="eyebrow mb-7"
          >
            Plan &nbsp;·&nbsp; Elevation &nbsp;·&nbsp; Interior &amp; Vastu Consultant
          </motion.p>

          <h1 className="font-display text-[clamp(2.9rem,9.4vw,8.2rem)] leading-[0.94]">
            {LINES.map((line, li) => (
              <span key={li} className="block overflow-hidden pb-[0.08em]">
                {line.map((word, wi) => (
                  <span key={wi} className="mr-[0.22em] inline-block overflow-hidden align-bottom">
                    <motion.span
                      className={`inline-block ${li === 2 ? "italic text-[#d6b98a]" : ""}`}
                      initial={{ y: "115%", rotate: 3 }}
                      animate={{ y: "0%", rotate: 0 }}
                      transition={{ duration: 1.05, delay: 0.45 + (li * 3 + wi) * 0.07, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.35, duration: 0.8 }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5"
          >
            <a href="#visualizer" className="group relative overflow-hidden rounded-full bg-[#f5f2ea] px-8 py-4 text-sm font-medium tracking-wide text-[#15140f]">
              <span className="absolute inset-0 -translate-x-full bg-[#b08d5b] transition-transform duration-500 group-hover:translate-x-0" />
              <span className="relative transition-colors group-hover:text-white">Explore Homes in 3D</span>
            </a>
            <a href="#projects" className="group flex items-center gap-2 text-sm tracking-wide text-white/85 transition hover:text-[#d6b98a]">
              View our projects
              <span className="h-px w-8 bg-current transition-all duration-300 group-hover:w-14" />
            </a>
            <a href={SITE.instagram} target="_blank" rel="noreferrer" className="hidden items-center gap-2 text-sm text-white/70 transition hover:text-[#d6b98a] sm:flex">
              <InstagramIcon size={17} /> {SITE.instagramHandle}
            </a>
          </motion.div>
        </div>

        {/* slide index + caption */}
        <div className="absolute bottom-7 left-0 right-0 hidden md:block">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-10">
            <div className="flex items-center gap-3">
              {SLIDES.map((s, k) => (
                <button key={k} onClick={() => setI(k)} aria-label={`Show ${s.caption}`} className="group py-3">
                  <span className="block h-px w-12 overflow-hidden bg-white/25">
                    <motion.span
                      key={k === i ? `a${i}` : `b${k}`}
                      className="block h-full bg-[#d6b98a]"
                      initial={{ width: k < i ? "100%" : "0%" }}
                      animate={{ width: k === i ? "100%" : k < i ? "100%" : "0%" }}
                      transition={{ duration: k === i ? 6.5 : 0.3, ease: "linear" }}
                    />
                  </span>
                </button>
              ))}
              <span className="ml-3 text-[11px] tracking-[0.2em] text-white/55 uppercase">{SLIDES[i].caption}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] text-white/55 uppercase">
              Scroll
              <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}>
                <ArrowDown size={14} />
              </motion.span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
