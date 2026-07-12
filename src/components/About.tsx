"use client";

import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import Reveal from "./Reveal";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 1.6, bounce: 0 });

  useEffect(() => {
    if (inView) motionVal.set(to);
  }, [inView, to, motionVal]);

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.floor(v) + suffix;
    });
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

const stats = [
  { to: 120, suffix: "+", label: "Projects Delivered" },
  { to: 8, suffix: "+", label: "Years of Practice" },
  { to: 40, suffix: "+", label: "Vastu Consultations" },
  { to: 98, suffix: "%", label: "Client Satisfaction" },
];

export default function About() {
  return (
    <section id="about" className="scroll-mt-24 py-28 md:py-36 bg-[#f6f4ef]">
      <div className="mx-auto max-w-7xl px-6 md:px-10 grid md:grid-cols-2 gap-14 md:gap-20 items-center">
        <Reveal className="reveal-mask">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1400&auto=format&fit=crop"
              alt="Architectural drafting and planning"
              className="w-full h-[460px] object-cover rounded-2xl"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute -bottom-8 -left-6 md:-left-10 bg-[#1c1b19] text-[#f6f4ef] rounded-2xl px-8 py-6 shadow-xl"
            >
              <p className="font-serif text-3xl">8+</p>
              <p className="text-xs tracking-wide text-[#f6f4ef]/70 mt-1">
                Years Designing Homes
              </p>
            </motion.div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="text-xs tracking-[0.3em] text-[var(--accent)] mb-4">
              ABOUT THE STUDIO
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
              Where structure meets soul.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-[#1c1b19]/75 leading-relaxed mb-5">
              A.K. Architects is a full-service design studio specialising in
              architectural planning, elevation design, interior styling and
              vastu consultancy. We believe good design is not decoration —
              it&apos;s the quiet alignment of light, layout and life.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="text-[#1c1b19]/75 leading-relaxed mb-10">
              From the first line on paper to the last coat of paint, our team
              works alongside you to shape spaces that are functional,
              beautiful and rooted in vastu principles — built for how you
              actually live.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 gap-8">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={0.1 * i}>
                <p className="font-serif text-4xl text-[#1c1b19]">
                  <Counter to={s.to} suffix={s.suffix} />
                </p>
                <p className="text-sm text-[#1c1b19]/60 mt-1">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
