"use client";

import { motion } from "framer-motion";
import Reveal from "./Reveal";
import InstagramIcon from "./icons/InstagramIcon";

const shots = [
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=600&auto=format&fit=crop",
];

export default function InstagramCTA() {
  return (
    <section className="py-24 md:py-32 bg-[#efeae0]">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal className="flex flex-col items-center text-center mb-14">
          <div className="h-14 w-14 rounded-full bg-[#1c1b19] text-[var(--accent)] grid place-items-center mb-6">
            <InstagramIcon size={22} />
          </div>
          <p className="text-xs tracking-[0.3em] text-[var(--accent)] mb-4">
            FOLLOW ALONG
          </p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-5">
            @a.k._architects
          </h2>
          <p className="text-[#1c1b19]/65 max-w-lg mb-8">
            Behind-the-scenes site visits, fresh elevation concepts and
            finished interiors — new work posted regularly.
          </p>
          <a
            href="https://www.instagram.com/a.k._architects/"
            target="_blank"
            rel="noreferrer"
            className="px-7 py-3.5 bg-[#1c1b19] text-[#f6f4ef] rounded-full text-sm tracking-wide hover:bg-[var(--accent)] hover:text-[#1c1b19] transition-colors"
          >
            Visit Instagram Profile
          </a>
        </Reveal>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {shots.map((src, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <motion.a
                href="https://www.instagram.com/a.k._architects/"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="block aspect-square rounded-xl overflow-hidden"
              >
                <img
                  src={src}
                  alt="A.K. Architects Instagram post"
                  className="h-full w-full object-cover"
                />
              </motion.a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
