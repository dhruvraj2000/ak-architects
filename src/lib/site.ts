export const SITE = {
  name: "A.K. Architects",
  tagline: "Plan · Elevation · Interior & Vastu Consultant",
  phone: "+91 95096 92328",
  phoneHref: "tel:+919509692328",
  whatsappNumber: "919509692328",
  email: "Avinashkum1997@gmail.com",
  contactPerson: "Avinash Kumawat",
  location: "Nathdwara, Rajasthan, India",
  instagram: "https://www.instagram.com/a.k._architects/",
  instagramHandle: "@a.k._architects",
} as const;

export function whatsappLink(message: string) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const NAV = [
  { href: "#about", label: "Studio" },
  { href: "#visualizer", label: "Explore Homes" },
  { href: "#projects", label: "Projects" },
  { href: "#services", label: "Services" },
  { href: "#process", label: "Process" },
  { href: "#contact", label: "Contact" },
];
