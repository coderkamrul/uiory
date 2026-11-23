import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "900"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://uiory.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "uiory — AI-Built Components, Shown With Their Prompts",
  description:
    "A showcase of UI components built with AI tools, including same-prompt comparisons (Muse AI vs Claude). Every component includes the exact prompt so anyone can rebuild it.",
  alternates: {
    canonical: "/",
  },
  icons: [
    { rel: "icon", type: "image/png", sizes: "any", url: "/logo-u.png" },
    { rel: "apple-touch-icon", url: "/logo-u.png" },
  ],
  openGraph: {
    title: "uiory — AI-Built Components, Shown With Their Prompts",
    description:
      "A showcase of UI components built with AI tools, including same-prompt comparisons (Muse AI vs Claude). Every component includes the exact prompt so anyone can rebuild it.",
    url: siteUrl,
    siteName: "Uiory",
    images: [
      {
        url: "/logo-black-bg.png",
        width: 1200,
        height: 630,
        alt: "Uiory — AI Component Showcase & Prompts",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "uiory — AI-Built Components, Shown With Their Prompts",
    description:
      "A showcase of UI components built with AI tools, including same-prompt comparisons. Every component includes the exact prompt so anyone can rebuild it.",
    images: ["/logo-black-bg.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Uiory",
      description:
        "A curated showcase of UI components built with AI tools, including exact prompt blueprints.",
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Uiory",
      url: siteUrl,
      logo: `${siteUrl}/logo-u.png`,
      email: "hello@uiory.com",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
