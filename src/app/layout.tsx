import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "A.K. Architects | Architecture, Elevation, Interior & Vastu — Nathdwara, Rajasthan",
  description:
    "A.K. Architects designs homes, villas and commercial spaces: architectural planning, elevation design, interior design and vastu consultancy. Explore our homes in interactive 2D plans and 3D.",
  openGraph: {
    title: "A.K. Architects — Plan · Elevation · Interior & Vastu",
    description: "Explore dimensioned floor plans and walk through our homes in 3D before they are built.",
    images: ["/images/hero-villa-pool.webp"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#15140f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
