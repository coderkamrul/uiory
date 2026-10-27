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
export const metadata: Metadata = {
  title: "uiory — AI-Built Components, Shown With Their Prompts",
  description:
    "A showcase of UI components built with AI tools, including same-prompt comparisons (Muse AI vs Claude). Every component includes the exact prompt so anyone can rebuild it.",
  icons: [
    { rel: "icon", type: "image/png", sizes: "any", url: "/logo-u.png" },
    { rel: "apple-touch-icon", url: "/logo-u.png" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
