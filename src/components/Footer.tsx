import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import InstagramIcon from "./icons/InstagramIcon";

export default function Footer() {
  return (
    <footer className="bg-[#1c1b19] text-[#f6f4ef]/70 py-12">
      <div className="mx-auto max-w-7xl px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-mark.png"
            alt="A.K. Architects logo"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="font-serif text-[#f6f4ef]">A.K. ARCHITECTS</span>
        </div>

        <p className="text-xs text-center">
          {`© ${new Date().getFullYear()} A.K. Architects. Plan · Elevation · Interior & Vastu Consultant.`}
        </p>

        <div className="flex items-center gap-4">
          <a
            href="https://www.instagram.com/a.k._architects/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--accent)] transition-colors"
            aria-label="Instagram"
          >
            <InstagramIcon size={18} />
          </a>
          <a
            href="mailto:Avinashkum1997@gmail.com"
            className="hover:text-[var(--accent)] transition-colors"
            aria-label="Email"
          >
            <Mail size={18} />
          </a>
          <a
            href="tel:+919509692328"
            className="hover:text-[var(--accent)] transition-colors"
            aria-label="Phone"
          >
            <Phone size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
