"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import InstagramIcon from "./icons/InstagramIcon";

const words = ["We", "Design", "Spaces", "You'll", "Never", "Want", "To", "Leave."];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative h-[100svh] min-h-[640px] overflow-hidden flex items-end"
    >
      <motion.div style={{ y }} className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1920&auto=format&fit=crop"
          alt="Modern architectural interior"
          className="h-[120%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1b19]/90 via-[#1c1b19]/40 to-[#1c1b19]/60" />
      </motion.div>

      <motion.div style={{ opacity }} className="w-full">
        <div className="mx-auto max-w-7xl px-6 md:px-10 pb-24 md:pb-28 text-[#f6f4ef]">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[11px] md:text-xs tracking-[0.35em] text-[var(--accent)] mb-6"
          >
            PLAN &nbsp;·&nbsp; ELEVATION &nbsp;·&nbsp; INTERIOR &amp; VASTU CONSULTANT
          </motion.p>

          <h1 className="font-serif text-[13vw] leading-[0.95] md:text-[6vw] md:leading-[0.95] max-w-5xl flex flex-wrap gap-x-4">
            {words.map((word, i) => (
              <span key={i} className="overflow-hidden py-1">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{
                    duration: 0.8,
                    delay: 0.25 + i * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center gap-6"
          >
            <a
              href="#projects"
              className="px-7 py-3.5 bg-[var(--accent)] text-[#1c1b19] rounded-full text-sm tracking-wide font-medium hover:bg-[#f6f4ef] transition-colors"
            >
              View Our Work
            </a>
            <a
              href="https://www.instagram.com/a.k._architects/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-[#f6f4ef]/80 hover:text-[var(--accent)] transition-colors"
            >
              <InstagramIcon size={18} />
              @a.k._architects
            </a>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute right-6 md:right-10 bottom-8 hidden sm:flex flex-col items-center gap-2 text-[#f6f4ef]/70"
      >
        <span className="text-[10px] tracking-[0.3em] [writing-mode:vertical-rl]">
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          <ArrowDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}
