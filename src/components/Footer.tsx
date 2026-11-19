import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { NAV, SITE } from "@/lib/site";
import InstagramIcon from "./icons/InstagramIcon";

export default function Footer() {
  return (
    <footer className="grain relative overflow-hidden bg-[#0f0e0a] text-[#f5f2ea]/65">
      <div className="mx-auto max-w-[1400px] px-5 pt-20 pb-10 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <Image src="/logo-mark.png" alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
              <span className="font-display text-2xl tracking-[0.06em] text-[#f5f2ea]">A.K. ARCHITECTS</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed">{SITE.tagline}. Homes, villas and commercial spaces designed with light, layout and life in mind.</p>
          </div>
          <div>
            <p className="eyebrow mb-5">Explore</p>
            <ul className="space-y-3 text-sm">
              {NAV.map((l) => <li key={l.href}><a href={l.href} className="transition hover:text-[#d6b98a]">{l.label}</a></li>)}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-5">Services</p>
            <ul className="space-y-3 text-sm">
              <li>Architectural Planning</li><li>Elevation Design</li><li>Interior Design</li><li>Vastu Consultancy</li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-5">Studio</p>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-[#b08d5b]" />{SITE.location}</li>
              <li><a href={SITE.phoneHref} className="flex gap-3 transition hover:text-[#d6b98a]"><Phone size={16} className="mt-0.5 shrink-0 text-[#b08d5b]" />{SITE.phone}</a></li>
              <li><a href={`mailto:${SITE.email}`} className="flex gap-3 break-all transition hover:text-[#d6b98a]"><Mail size={16} className="mt-0.5 shrink-0 text-[#b08d5b]" />{SITE.email}</a></li>
              <li><a href={SITE.instagram} target="_blank" rel="noreferrer" className="flex gap-3 transition hover:text-[#d6b98a]"><InstagramIcon size={16} />{SITE.instagramHandle}</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-xs md:flex-row">
          <p>{`© ${new Date().getFullYear()} A.K. Architects. All rights reserved.`}</p>
          <p>Concept plans and 3D models are indicative and subject to site conditions.</p>
        </div>
      </div>
    </footer>
  );
}
