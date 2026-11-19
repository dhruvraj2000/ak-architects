"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/projects";
import Reveal from "./Reveal";

export default function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % TESTIMONIALS.length), 7000);
    return () => clearInterval(t);
  }, []);
  const t = TESTIMONIALS[i];

  return (
    <section className="bg-[#ebe6da] py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-5 text-center md:px-10">
        <Reveal>
          <Quote className="mx-auto mb-8 text-[#b08d5b]" size={36} strokeWidth={1.2} />
          <div className="relative min-h-[270px] md:min-h-[220px]" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.6 }}>
                <p className="font-display text-[1.7rem] leading-snug md:text-4xl">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-8 text-sm tracking-wide text-[#15140f]/60">{t.name} <span className="mx-2 text-[#b08d5b]">·</span> {t.role}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-8 flex justify-center gap-2">
            {TESTIMONIALS.map((_, k) => (
              <button key={k} onClick={() => setI(k)} aria-label={`Testimonial ${k + 1}`} className="p-2">
                <span className={`block h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-[#b08d5b]" : "w-1.5 bg-black/20"}`} />
              </button>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
