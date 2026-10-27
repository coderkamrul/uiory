"use client";

import { usePathname } from "next/navigation";
import HalftoneWordmarkFooter, { FooterColumn } from "@/components/ui/halftone-wordmark-footer";

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Showcase",
    links: [
      { label: "Components", href: "/#showcase" },
      { label: "A/B Compare", href: "/?type=compare" },
      { label: "Physics Shaders", href: "/#showcase" },
      { label: "Interactive Prompts", href: "/#showcase" },
    ],
  },
  {
    title: "Studio",
    links: [
      { label: "Services & Design", href: "/services" },
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Admin Portal", href: "/admin" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "hello@uiory.com", href: "mailto:hello@uiory.com" },
      { label: "+1 (415) 890-3490", href: "/contact" },
      { label: "GitHub & Docs", href: "https://github.com" },
      { label: "Terms & Privacy", href: "/about" },
    ],
  },
];

/** Footer layout: hidden automatically on all /admin pages */
export default function Footer() {
  const pathname = usePathname();

  // Do not render footer on admin dashboard or any admin subroutes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="w-full border-t border-white/[0.08] bg-[#0c0c0b]">
      <      HalftoneWordmarkFooter
        wordmark="uiory"
        label="uiory Studio"
        meta="© 2026 · AI UI & Frontend Engineering"
        columns={FOOTER_COLUMNS}
        preset="night"
        palette={{
          background: "#08080a",
          ink: "#dedbd2",
          warm: "#f97316",
        }}
        dotGap={6}
        radius={85}
        crop={0.18}
        grain={0.4}
        interactive={true}
        height="500px"
      />
    </div>
  );
}
