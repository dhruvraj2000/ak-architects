"use client";

import { useState } from "react";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";
import Reveal from "./Reveal";

const TYPES = ["New home / villa", "Elevation design", "Interior design", "Vastu consultation", "Commercial space", "Renovation"];

const field =
  "w-full rounded-xl border border-black/10 bg-white/70 px-4 py-3.5 text-sm outline-none transition focus:border-[#b08d5b] focus:bg-white focus:ring-4 focus:ring-[#b08d5b]/15";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const text = [
      "Hello A.K. Architects, I'd like a consultation.",
      "",
      `Name: ${d.get("name")}`,
      `Phone: ${d.get("phone")}`,
      d.get("email") ? `Email: ${d.get("email")}` : "",
      `Project: ${d.get("type")}`,
      d.get("plot") ? `Plot size / location: ${d.get("plot")}` : "",
      "",
      `${d.get("message")}`,
    ].filter((l) => l !== "").join("\n");
    setMsg(text);
    setSent(true);
    window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
  }

  return (
    <section id="contact" className="scroll-mt-20 bg-[#ebe6da] py-24 md:py-36">
      <div className="mx-auto grid max-w-[1400px] gap-14 px-5 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div>
          <Reveal><p className="eyebrow eyebrow-dark mb-4">Get in Touch</p></Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display mb-6 text-[2.6rem] leading-[1.02] md:text-6xl">
              Let&apos;s design <em className="text-[#b08d5b]">your next space.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mb-10 max-w-md leading-[1.8] text-[#15140f]/65">
              Share your plot details or renovation brief and we will reply with next steps within 24 hours. The fastest way to reach us is WhatsApp.
            </p>
          </Reveal>

          <div className="space-y-5">
            {[
              { icon: Phone, href: SITE.phoneHref, text: `${SITE.phone} · ${SITE.contactPerson}` },
              { icon: Mail, href: `mailto:${SITE.email}`, text: SITE.email },
              { icon: MapPin, href: "https://maps.google.com/?q=Nathdwara,Rajasthan", text: SITE.location },
            ].map((c, i) => (
              <Reveal key={c.text} delay={0.2 + i * 0.05}>
                <a href={c.href} target={c.icon === MapPin ? "_blank" : undefined} rel="noreferrer" className="group flex items-center gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#15140f] text-[#d6b98a] transition group-hover:bg-[#b08d5b] group-hover:text-white"><c.icon size={18} /></span>
                  <span className="text-[#15140f]/80 transition group-hover:text-[#b08d5b]">{c.text}</span>
                </a>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.4}>
            <a href={whatsappLink("Hello A.K. Architects, I'd like to book a consultation.")} target="_blank" rel="noreferrer"
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#1f9d55] px-7 py-4 text-sm font-medium text-white transition hover:bg-[#178a49]">
              <MessageCircle size={18} /> Chat on WhatsApp
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <form onSubmit={onSubmit} className="rounded-[2rem] bg-[#f5f2ea] p-7 shadow-xl shadow-black/5 ring-1 ring-black/5 md:p-10">
            <h3 className="font-display mb-6 text-3xl">Request a consultation</h3>
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs tracking-wide text-[#15140f]/60">Full name *</span>
                <input required name="name" autoComplete="name" className={field} placeholder="Your name" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs tracking-wide text-[#15140f]/60">Phone / WhatsApp *</span>
                <input required name="phone" type="tel" inputMode="tel" pattern="[+0-9 ()\-]{8,16}" title="Enter a valid phone number" autoComplete="tel" className={field} placeholder="+91 …" />
              </label>
            </div>
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs tracking-wide text-[#15140f]/60">Email</span>
                <input name="email" type="email" autoComplete="email" className={field} placeholder="you@email.com" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs tracking-wide text-[#15140f]/60">Project type</span>
                <select name="type" className={field} defaultValue={TYPES[0]}>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
            </div>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs tracking-wide text-[#15140f]/60">Plot size &amp; location</span>
              <input name="plot" className={field} placeholder="e.g. 40 × 60 ft, Udaipur" />
            </label>
            <label className="mb-6 block">
              <span className="mb-1.5 block text-xs tracking-wide text-[#15140f]/60">Tell us about your project *</span>
              <textarea required name="message" rows={4} className={`${field} resize-none`} placeholder="Rooms needed, style you like, budget, timeline…" />
            </label>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-[#15140f] py-4 text-sm font-medium tracking-wide text-white transition hover:bg-[#b08d5b]">
              <MessageCircle size={17} /> Send enquiry on WhatsApp
            </button>
            {sent ? (
              <p role="status" className="mt-4 text-center text-sm text-[#15140f]/65">
                Thank you! WhatsApp should have opened with your enquiry. If it didn&apos;t,{" "}
                <a className="underline" href={`mailto:${SITE.email}?subject=Consultation enquiry&body=${encodeURIComponent(msg)}`}>send it by email</a>.
              </p>
            ) : (
              <p className="mt-4 text-center text-xs text-[#15140f]/45">Your enquiry opens in WhatsApp, ready to send.</p>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
