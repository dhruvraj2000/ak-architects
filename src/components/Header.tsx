"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#projects", label: "Projects" },
  { href: "#process", label: "Process" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${
        scrolled
          ? "bg-[#f6f4ef]/90 backdrop-blur-md border-b border-[var(--line)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10 flex items-center justify-between h-20">
        <a href="#top" className="flex items-center gap-3 shrink-0">
          <Image
            src="/logo-mark.png"
            alt="A.K. Architects logo"
            width={44}
            height={44}
            className="h-10 w-10 rounded-full object-cover shrink-0"
            priority
          />
          <span className="hidden sm:flex flex-col leading-none whitespace-nowrap">
            <span className="font-serif text-lg tracking-wide">
              A.K. ARCHITECTS
            </span>
            <span className="hidden lg:block text-[10px] tracking-[0.2em] text-[var(--accent)] mt-1 whitespace-nowrap">
              PLAN · ELEVATION · INTERIOR &amp; VASTU
            </span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-4 lg:gap-9 shrink-0">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs lg:text-sm tracking-wide text-[#1c1b19]/80 hover:text-[var(--accent)] transition-colors whitespace-nowrap"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="text-xs lg:text-sm px-3.5 py-2 lg:px-5 lg:py-2.5 border border-[#1c1b19] rounded-full hover:bg-[#1c1b19] hover:text-[#f6f4ef] transition-colors whitespace-nowrap"
          >
            Get a Quote
          </a>
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="md:hidden overflow-hidden bg-[#f6f4ef] border-t border-[var(--line)]"
          >
            <div className="flex flex-col px-6 py-6 gap-5">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-base"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="text-sm px-5 py-2.5 border border-[#1c1b19] rounded-full text-center"
              >
                Get a Quote
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
