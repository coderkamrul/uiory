import Link from "next/link";
import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";
import { ArrowRight, Zap } from "lucide-react";

export const metadata = {
  title: "Page not found — uiory",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <section className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 sm:px-6 text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0c0c0b]/80 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-neutral-400 backdrop-blur-sm">
        <Zap size={12} className="text-orange-400" />
        Not Found
      </span>

      <div className="mt-6 max-w-md">
        <VerticalCutReveal
          splitBy="words"
          staggerDuration={0.1}
          staggerFrom="first"
          reverse={true}
          containerClassName="justify-center text-center"
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 35,
            delay: 0,
          }}
        >
          <span className="text-4xl sm:text-6xl font-black uppercase tracking-[-0.04em] text-white leading-tight">
            404
          </span>
        </VerticalCutReveal>
        <p className="mt-4 text-sm sm:text-base text-neutral-400 leading-relaxed">
          This page isn&apos;t part of the showcase. Head back to the gallery or
          start something new.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-6 py-3.5 shadow-lg shadow-orange-500/30 border border-orange-400/40 text-sm font-bold text-white transition-all hover:opacity-95 active:scale-95"
          >
            <span>Back to Showcase</span>
            <ArrowRight size={15} />
          </Link>

          <a
            href="/services"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/[0.09] active:scale-95"
          >
            Explore Services
          </a>
        </div>
      </div>
    </section>
  );
}
