"use client";

import { motion } from "framer-motion";
import { Compass, Layers, Sofa, Sparkles } from "lucide-react";
import Reveal from "./Reveal";

const services = [
  {
    icon: Compass,
    title: "Architectural Planning",
    desc: "Site-sensitive layouts and floor plans engineered for light, flow and long-term function.",
  },
  {
    icon: Layers,
    title: "Elevation Design",
    desc: "Distinctive facades and elevations that give your home a presence of its own.",
  },
  {
    icon: Sofa,
    title: "Interior Design",
    desc: "Cohesive interiors — material, colour and furniture — tailored to how you live and entertain.",
  },
  {
    icon: Sparkles,
    title: "Vastu Consultancy",
    desc: "Traditional vastu principles woven into modern planning for balance and wellbeing.",
  },
];

export default function Services() {
  return (
    <section id="services" className="scroll-mt-24 py-28 md:py-36 bg-[#efeae0]">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal className="max-w-2xl mb-16">
          <p className="text-xs tracking-[0.3em] text-[var(--accent)] mb-4">
            WHAT WE DO
          </p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">
            Services built around your plot, your family, your life.
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="h-full bg-[#f6f4ef] rounded-2xl p-8 border border-[var(--line)] hover:border-[var(--accent)] hover:shadow-lg transition-all"
              >
                <div className="h-12 w-12 rounded-full bg-[#1c1b19] text-[var(--accent)] grid place-items-center mb-6">
                  <s.icon size={20} />
                </div>
                <h3 className="font-serif text-xl mb-3">{s.title}</h3>
                <p className="text-sm text-[#1c1b19]/65 leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
