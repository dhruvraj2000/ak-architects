"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Reveal from "./Reveal";

const steps = [
  { n: "01", title: "Consultation", desc: "We visit your site and understand your brief, budget, family needs and vastu preferences.", out: "Site study · Brief · Budget" },
  { n: "02", title: "Plan & Elevation", desc: "Layouts and facade concepts are drafted, reviewed in 2D and 3D, and refined with you.", out: "Floor plans · 3D elevation" },
  { n: "03", title: "Interior Detailing", desc: "Materials, finishes, lighting and furniture layouts are designed room by room.", out: "Material board · Furniture plan" },
  { n: "04", title: "Execution Support", desc: "We guide the build on site so the finished result matches the design intent.", out: "Working drawings · Site visits" },
];

export default function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <section id="process" className="grain relative scroll-mt-20 overflow-hidden bg-[#15140f] py-24 text-[#f5f2ea] md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal className="mb-16 max-w-3xl">
          <p className="eyebrow mb-4">How We Work</p>
          <h2 className="font-display text-[2.6rem] leading-[1.02] md:text-6xl">
            A clear process, <em className="text-[#d6b98a]">from plot to move-in.</em>
          </h2>
        </Reveal>

        <div ref={ref} className="relative">
          <div className="absolute bottom-0 left-[19px] top-0 w-px bg-white/10 md:left-1/2">
            <motion.div style={{ scaleY, transformOrigin: "top" }} className="h-full w-full bg-[#b08d5b]" />
          </div>
          <div className="space-y-14 md:space-y-24">
            {steps.map((s, i) => (
              <Reveal key={s.n} y={40}>
                <div className={`relative grid items-start gap-6 pl-14 md:grid-cols-2 md:gap-24 md:pl-0 ${i % 2 ? "md:[&>*:nth-child(2)]:order-first" : ""}`}>
                  <span className="absolute left-0 top-1 grid h-10 w-10 place-items-center rounded-full bg-[#b08d5b] text-xs font-semibold text-white md:left-1/2 md:-translate-x-1/2">{s.n}</span>
                  <div className={i % 2 ? "md:text-left" : "md:text-right"}>
                    <h3 className="font-display text-4xl md:text-5xl">{s.title}</h3>
                  </div>
                  <div className="max-w-md">
                    <p className="leading-[1.8] text-white/65">{s.desc}</p>
                    <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-[#d6b98a]">{s.out}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
