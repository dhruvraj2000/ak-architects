"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import Reveal from "./Reveal";

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <section id="contact" className="scroll-mt-24 py-28 md:py-36 bg-[#f6f4ef]">
      <div className="mx-auto max-w-7xl px-6 md:px-10 grid md:grid-cols-2 gap-14 md:gap-20">
        <div>
          <Reveal>
            <p className="text-xs tracking-[0.3em] text-[var(--accent)] mb-4">
              GET IN TOUCH
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
              Let&apos;s design your next space.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-[#1c1b19]/70 leading-relaxed mb-10 max-w-md">
              Share your plot details or renovation brief and our team will get
              back to you with next steps within 24 hours.
            </p>
          </Reveal>

          <div className="space-y-6">
            <Reveal delay={0.25}>
              <a
                href="tel:+919509692328"
                className="flex items-center gap-4 group"
              >
                <span className="h-11 w-11 rounded-full bg-[#1c1b19] text-[var(--accent)] grid place-items-center shrink-0">
                  <Phone size={17} />
                </span>
                <span className="text-[#1c1b19]/80 group-hover:text-[var(--accent)] transition-colors">
                  +91 95096 92328 &mdash; Avinash Kumawat
                </span>
              </a>
            </Reveal>
            <Reveal delay={0.3}>
              <a
                href="mailto:Avinashkum1997@gmail.com"
                className="flex items-center gap-4 group"
              >
                <span className="h-11 w-11 rounded-full bg-[#1c1b19] text-[var(--accent)] grid place-items-center shrink-0">
                  <Mail size={17} />
                </span>
                <span className="text-[#1c1b19]/80 group-hover:text-[var(--accent)] transition-colors">
                  Avinashkum1997@gmail.com
                </span>
              </a>
            </Reveal>
            <Reveal delay={0.35}>
              <div className="flex items-center gap-4">
                <span className="h-11 w-11 rounded-full bg-[#1c1b19] text-[var(--accent)] grid place-items-center shrink-0">
                  <MapPin size={17} />
                </span>
                <span className="text-[#1c1b19]/80">
                  Nathdwara, Rajasthan, India
                </span>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.15}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="bg-[#efeae0] rounded-2xl p-8 md:p-10 border border-[var(--line)]"
          >
            <div className="grid sm:grid-cols-2 gap-5 mb-5">
              <input
                required
                placeholder="Full name"
                className="bg-[#f6f4ef] border border-[var(--line)] rounded-lg px-4 py-3 text-sm outline-none focus:border-[var(--accent)] transition-colors"
              />
              <input
                required
                type="tel"
                placeholder="Phone number"
                className="bg-[#f6f4ef] border border-[var(--line)] rounded-lg px-4 py-3 text-sm outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <input
              required
              type="email"
              placeholder="Email address"
              className="w-full bg-[#f6f4ef] border border-[var(--line)] rounded-lg px-4 py-3 text-sm outline-none focus:border-[var(--accent)] transition-colors mb-5"
            />
            <textarea
              required
              rows={4}
              placeholder="Tell us about your project — plot size, location, requirements..."
              className="w-full bg-[#f6f4ef] border border-[var(--line)] rounded-lg px-4 py-3 text-sm outline-none focus:border-[var(--accent)] transition-colors mb-6 resize-none"
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full py-3.5 bg-[#1c1b19] text-[#f6f4ef] rounded-full text-sm tracking-wide hover:bg-[var(--accent)] hover:text-[#1c1b19] transition-colors"
            >
              {sent ? "Thank you — we'll be in touch!" : "Send Enquiry"}
            </motion.button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
