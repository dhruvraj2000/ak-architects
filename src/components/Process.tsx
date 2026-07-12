"use client";

import Reveal from "./Reveal";

const steps = [
  {
    n: "01",
    title: "Consultation",
    desc: "We visit your site, understand your brief, budget and vastu preferences.",
  },
  {
    n: "02",
    title: "Plan & Elevation",
    desc: "Layouts and facade concepts are drafted, reviewed and refined with you.",
  },
  {
    n: "03",
    title: "Interior Detailing",
    desc: "Materials, finishes and furniture layouts are designed room by room.",
  },
  {
    n: "04",
    title: "Execution Support",
    desc: "We guide execution on-site so the built result matches the design intent.",
  },
];

export default function Process() {
  return (
    <section id="process" className="scroll-mt-24 py-28 md:py-36 bg-[#1c1b19] text-[#f6f4ef]">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal className="max-w-2xl mb-16">
          <p className="text-xs tracking-[0.3em] text-[var(--accent)] mb-4">
            HOW WE WORK
          </p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">
            A clear process, from plot to move-in
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-4 gap-10">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <div className="relative pl-0">
                <p className="font-serif text-5xl text-[var(--accent)]/70 mb-6">
                  {s.n}
                </p>
                <h3 className="text-lg mb-3">{s.title}</h3>
                <p className="text-sm text-[#f6f4ef]/60 leading-relaxed">
                  {s.desc}
                </p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[110%] w-[80%] h-px bg-[#f6f4ef]/15" />
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
