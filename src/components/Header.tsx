"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV, SITE, whatsappLink } from "@/lib/site";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const light = !scrolled && !open;

  return (
    <>
      <motion.header
        initial={{ y: -90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className={`fixed inset-x-0 top-0 z-[60] transition-all duration-500 ${
          scrolled ? "border-b border-black/5 bg-[#f5f2ea]/85 backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className={`mx-auto flex max-w-[1400px] items-center justify-between px-5 md:px-10 ${scrolled ? "h-[68px]" : "h-20"} transition-all duration-500`}>
          <a href="#top" className="flex shrink-0 items-center gap-3" aria-label="A.K. Architects home">
            <Image src="/logo-mark.png" alt="" width={44} height={44} priority className="h-10 w-10 rounded-full object-cover" />
            <span className={`flex flex-col leading-none transition-colors ${light ? "text-white" : "text-[#15140f]"}`}>
              <span className="font-display text-[1.35rem] tracking-[0.06em]">A.K. ARCHITECTS</span>
              <span className="mt-1 hidden text-[9px] uppercase tracking-[0.3em] text-[#b08d5b] sm:block">Plan · Elevation · Interior · Vastu</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {NAV.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`group relative text-[13px] tracking-wide transition-colors ${light ? "text-white/85 hover:text-white" : "text-[#15140f]/75 hover:text-[#15140f]"}`}
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#b08d5b] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={whatsappLink("Hello A.K. Architects, I'd like to book a consultation.")}
              target="_blank"
              rel="noreferrer"
              className={`hidden rounded-full px-5 py-2.5 text-[13px] font-medium tracking-wide transition sm:inline-block ${
                light ? "bg-white/95 text-[#15140f] hover:bg-[#b08d5b] hover:text-white" : "bg-[#15140f] text-white hover:bg-[#b08d5b]"
              }`}
            >
              Book a Consultation
            </a>
            <button
              className={`grid h-11 w-11 place-items-center rounded-full lg:hidden ${light ? "text-white" : "text-[#15140f]"}`}
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "circle(0% at 92% 4%)" }}
            animate={{ clipPath: "circle(150% at 92% 4%)" }}
            exit={{ clipPath: "circle(0% at 92% 4%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-50 flex flex-col justify-center bg-[#15140f] px-8 text-[#f5f2ea] lg:hidden"
          >
            <nav className="flex flex-col gap-2" aria-label="Mobile">
              {NAV.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.25 + i * 0.06, duration: 0.6 } }}
                  className="font-display border-b border-white/10 py-3 text-4xl"
                >
                  {l.label}
                </motion.a>
              ))}
            </nav>
            <div className="mt-10 text-sm text-white/55">
              <p>{SITE.phone}</p>
              <p>{SITE.email}</p>
              <p>{SITE.location}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
