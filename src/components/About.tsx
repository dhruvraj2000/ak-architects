"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import Reveal from "./Reveal";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1800, bounce: 0 });
  useEffect(() => { if (inView) mv.set(to); }, [inView, to, mv]);
  useEffect(() => spring.on("change", (v) => { if (ref.current) ref.current.textContent = Math.floor(v) + suffix; }), [spring, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

const stats = [
  { to: 120, suffix: "+", label: "Projects delivered" },
  { to: 8, suffix: "+", label: "Years of practice" },
  { to: 40, suffix: "+", label: "Vastu consultations" },
  { to: 98, suffix: "%", label: "Client satisfaction" },
];

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="about" className="relative scroll-mt-20 bg-[#f5f2ea] py-24 md:py-36">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-5 md:px-10 lg:grid-cols-[1fr_1.05fr] lg:gap-24">
        <Reveal>
          <div ref={ref} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
              <motion.div style={{ y }} className="absolute inset-x-0 -inset-y-[10%]">
                <Image src="/images/noir-pavilion.webp" alt="A.K. Architects: dusk elevation of a modern residence" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="absolute -bottom-7 -right-2 rounded-2xl bg-[#15140f] px-8 py-6 text-[#f5f2ea] shadow-2xl md:-right-8"
            >
              <p className="font-display text-5xl text-[#d6b98a]">8+</p>
              <p className="mt-1 text-xs tracking-wide text-white/65">Years designing homes</p>
            </motion.div>
          </div>
        </Reveal>

        <div>
          <Reveal><p className="eyebrow eyebrow-dark mb-4">About the Studio</p></Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display mb-7 text-[2.6rem] leading-[1.02] md:text-6xl">
              Where structure <em className="text-[#b08d5b]">meets soul.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mb-5 leading-[1.8] text-[#15140f]/70">
              A.K. Architects is a full-service design studio in Nathdwara, Rajasthan, specialising in architectural planning, elevation design,
              interior styling and vastu consultancy. We believe good design is not decoration; it is the quiet alignment of light, layout and life.
            </p>
            <p className="mb-12 leading-[1.8] text-[#15140f]/70">
              From the first line on paper to the last coat of paint, we work alongside you, and show you the result in plan and 3D before a single
              brick is laid, so the home you approve is the home you receive.
            </p>
          </Reveal>
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 border-t border-black/10 pt-10 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={0.08 * i}>
                <p className="font-display text-5xl leading-none"><Counter to={s.to} suffix={s.suffix} /></p>
                <p className="mt-2 text-xs tracking-wide text-[#15140f]/55">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
