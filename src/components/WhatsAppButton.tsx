"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";

export default function WhatsAppButton() {
  return (
    <motion.a
      href={whatsappLink("Hello A.K. Architects, I have an enquiry.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with A.K. Architects on WhatsApp"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 2, type: "spring", stiffness: 260, damping: 18 }}
      className="fixed bottom-5 right-5 z-[55] grid h-14 w-14 place-items-center rounded-full bg-[#1f9d55] text-white shadow-xl shadow-black/25 transition hover:scale-110 md:bottom-8 md:right-8"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#1f9d55]/40 [animation-duration:2.6s]" />
      <MessageCircle size={26} />
    </motion.a>
  );
}
