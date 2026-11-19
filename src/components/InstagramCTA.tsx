"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SITE } from "@/lib/site";
import Reveal from "./Reveal";
import InstagramIcon from "./icons/InstagramIcon";

const shots = ["int-green", "hillside-timber", "int-dining", "sunset-lodge", "int-stair", "pool-pavilion"];

export default function InstagramCTA() {
  return (
    <section className="bg-[#f5f2ea] py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal className="mb-12 flex flex-col items-center text-center">
          <span className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-[#15140f] text-[#d6b98a]"><InstagramIcon size={22} /></span>
          <p className="eyebrow eyebrow-dark mb-4">Follow Along</p>
          <h2 className="font-display mb-4 text-5xl md:text-6xl">{SITE.instagramHandle}</h2>
          <p className="mb-8 max-w-lg text-[#15140f]/60">Site visits, fresh elevation concepts and finished interiors, with new work posted regularly.</p>
          <a href={SITE.instagram} target="_blank" rel="noreferrer" className="rounded-full bg-[#15140f] px-8 py-4 text-sm tracking-wide text-white transition hover:bg-[#b08d5b]">
            Visit Instagram Profile
          </a>
        </Reveal>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-4">
          {shots.map((s, i) => (
            <Reveal key={s} delay={i * 0.05}>
              <motion.a href={SITE.instagram} target="_blank" rel="noreferrer" whileHover={{ y: -6 }} className="relative block aspect-square overflow-hidden rounded-xl md:rounded-2xl" aria-label="A.K. Architects on Instagram">
                <Image src={`/images/${s}.webp`} alt="" fill sizes="(max-width: 768px) 33vw, 16vw" className="object-cover transition duration-700 hover:scale-110" />
              </motion.a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
