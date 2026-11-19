"use client";

import Image from "next/image";
import { Compass, Layers, Sofa, Sparkles } from "lucide-react";
import Reveal from "./Reveal";

const services = [
  { icon: Compass, n: "01", title: "Architectural Planning", img: "/images/courtyard-white.webp",
    desc: "Site-sensitive layouts and dimensioned floor plans engineered for light, ventilation, flow and long-term function." },
  { icon: Layers, n: "02", title: "Elevation Design", img: "/images/timber-white.webp",
    desc: "Distinctive facades and elevations with real materials and 3D views, so you approve the look before construction." },
  { icon: Sofa, n: "03", title: "Interior Design", img: "/images/int-kitchen.webp",
    desc: "Cohesive interiors covering material, colour, lighting and furniture, tailored to how you live and entertain." },
  { icon: Sparkles, n: "04", title: "Vastu Consultancy", img: "/images/int-warm.webp",
    desc: "Traditional vastu principles woven into modern planning, for balance and wellbeing without compromising design." },
];

export default function Services() {
  return (
    <section id="services" className="scroll-mt-20 bg-[#f5f2ea] py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal className="mb-14 max-w-3xl">
          <p className="eyebrow eyebrow-dark mb-4">What We Do</p>
          <h2 className="font-display text-[2.6rem] leading-[1.02] md:text-6xl">
            Services built around your plot, your family, <em className="text-[#b08d5b]">your life.</em>
          </h2>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-[#ebe6da] ring-1 ring-black/5 transition-shadow duration-500 hover:shadow-2xl hover:shadow-black/10">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={s.img} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-[900ms] group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="font-display absolute bottom-3 left-5 text-4xl text-white/90">{s.n}</span>
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <span className="mb-5 grid h-11 w-11 place-items-center rounded-full bg-[#15140f] text-[#d6b98a] transition group-hover:bg-[#b08d5b] group-hover:text-white"><s.icon size={18} /></span>
                  <h3 className="font-display mb-3 text-2xl leading-tight">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-[#15140f]/65">{s.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
