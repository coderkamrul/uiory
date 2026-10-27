"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Hero from "./Hero";
import HomeExplorer from "./HomeExplorer";
import PromptDetailPanel from "./PromptDetailPanel";
import PricingSection from "@/components/ui/pricing";
import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";
import TimelineContent from "@/components/ui/timeline-animation";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How do I use these prompts in my workflow?",
    a: "Click on any component in the showcase to view its detail view. You can copy the full prompt blueprint with one click and paste it into Claude 3.7 Sonnet, Cursor, v0, ChatGPT, or your preferred AI builder to regenerate or customize the component. If the author included code, you can also copy the source directly.",
  },
  {
    q: "Can I use these components in commercial client projects?",
    a: "Yes, absolutely! All prompts and showcase components are designed to be freely adapted, modified, and shipped in your personal, client, or commercial applications without attribution requirements.",
  },
  {
    q: "Which AI models provide the best results with these prompts?",
    a: "Our prompts are extensively benchmarked against frontier coding models. Currently, Anthropic's Claude 3.7 Sonnet (Thinking), OpenAI's GPT-4o, and Google's Gemini 2.5 Pro yield the highest fidelity for complex WebGL shaders, responsive flex grids, and interactive states.",
  },
  {
    q: "Do you offer custom component design and engineering services?",
    a: "Yes! Our studio team specializes in bespoke interactive component engineering, custom WebGL shaders, and full design system architecture for ambitious startups and product teams. Visit our Services page or contact us to start a project.",
  },
  {
    q: "How often are new components and prompts published?",
    a: "We publish fresh components, comparisons, and prompt blueprints weekly. Check back regularly or explore different category filters to find new hero sections, cards, navigation bars, and micro-interactions.",
  },
];

export default function HomeShell() {
  const params = useSearchParams();
  const promptSlug = params.get("prompt");
  const typeParam = params.get("type");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /* ?prompt=[slug]: the fixed full-screen detail overlay takes over
     the homepage entirely */
  if (promptSlug) {
    return <PromptDetailPanel slug={promptSlug} />;
  }

  return (
    <>
      <Hero />

      {/* Main Showcase Gallery — Left completely untouched */}
      <section id="showcase" className="w-full scroll-mt-28 px-4 pb-16 pt-2 sm:px-6">
        <HomeExplorer
          key={typeParam ?? "all"}
          initialType={typeParam === "compare" ? "compare" : "all"}
        />
      </section>

      {!promptSlug && (
        <>
          {/* ── SECTION: TRANSPARENT PRICING & TIERS ── */}
          <section id="pricing" className="w-full scroll-mt-24">
            <PricingSection />
          </section>

          {/* ── SECTION 2: REBUILT INTERACTIVE FAQ ── */}
          <section id="faq" className="w-full scroll-mt-24 px-4 pb-24 sm:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <span className="grad-ring mb-2 inline-flex items-center rounded-full">
                  <span className="grad-text px-[10px] py-[4px] text-[10px] font-bold uppercase leading-none">
                    Frequently Asked Questions
                  </span>
                </span>
                <TimelineContent as="h2" animationNum={0} className="text-3xl sm:text-5xl font-black uppercase tracking-[-0.03em] leading-tight text-[#e5e5e5]">
                  <VerticalCutReveal
                    splitBy="words"
                    staggerDuration={0.12}
                    staggerFrom="first"
                    reverse={true}
                    containerClassName="justify-center text-center"
                    transition={{
                      type: "spring",
                      stiffness: 250,
                      damping: 40,
                      delay: 0,
                    }}
                  >
                    Everything you need to know
                  </VerticalCutReveal>
                </TimelineContent>
                <TimelineContent
                  as="p"
                  animationNum={1}
                  className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-lg mx-auto"
                >
                  Answers to common questions about our prompt gallery, commercial licensing, and custom engineering sprints.
                </TimelineContent>
              </div>

              <div className="mt-12 max-w-3xl mx-auto space-y-3">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <TimelineContent
                      key={idx}
                      as="div"
                      animationNum={2 + idx}
                      className={cn(
                        "rounded-2xl border transition-all duration-300 overflow-hidden group",
                        isOpen
                          ? "border-orange-500/50 bg-gradient-to-b from-[#1c1410] via-[#121217] to-[#0c0c0f] shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/30"
                          : "border-white/[0.08] bg-[#111116]/80 hover:border-white/20 shadow-sm"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="cursor-pointer flex w-full items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-white transition-colors hover:bg-white/[0.03]"
                      >
                        <span className={cn(isOpen ? "text-orange-400" : "text-white")}>
                          {faq.q}
                        </span>
                        <ChevronDown
                          size={17}
                          className={`text-neutral-500 shrink-0 ml-4 transition-transform duration-300 ${isOpen
                            ? "rotate-180 text-orange-400"
                            : ""}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed text-neutral-300 border-t border-white/[0.06]">
                          {faq.a}
                        </div>
                      )}
                    </TimelineContent>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── SECTION 3: MINIMAL CTA BANNER ── */}
          <section id="cta" className="w-full scroll-mt-24 px-4 pb-28 sm:px-6">
            <div className="max-w-7xl mx-auto relative overflow-hidden">
              <div className="relative flex w-full flex-col items-center justify-center gap-6 overflow-hidden rounded-[2rem] border border-orange-500/30 bg-gradient-to-br from-[#1c1410] via-[#121217] to-[#0c0c0f] p-8 sm:p-12 lg:p-16 shadow-2xl shadow-orange-500/10 ring-1 ring-orange-500/20 text-center">

                {/* Ambient lighting glows */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full bg-orange-500/10 blur-[128px]" />
                <div className="pointer-events-none absolute -left-20 -bottom-20 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[128px]" />

                <span className="z-10 grad-ring mb-1 inline-flex items-center rounded-full">
                  <span className="grad-text px-[10px] py-[4px] text-[10px] font-bold uppercase leading-none">
                    Component Forge
                  </span>
                </span>

                <TimelineContent as="h2" animationNum={0} className="z-10 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-[-0.03em] leading-tight text-white">
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
                    Ready to build what you remember?
                  </VerticalCutReveal>
                </TimelineContent>

                <TimelineContent
                  as="p"
                  animationNum={1}
                  className="z-10 mt-2 text-xs sm:text-sm font-medium text-neutral-300 max-w-lg mx-auto"
                >
                  Copy production-proven prompts, or work with our studio on bespoke builds.
                </TimelineContent>

                <TimelineContent
                  as="div"
                  animationNum={2}
                  className="z-10 mt-6 flex flex-col sm:flex-row items-center justify-center gap-3"
                >
                  <Link
                    href="/contact"
                    className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-6 py-3.5 shadow-lg shadow-orange-500/30 border border-orange-400/40 text-sm font-bold text-white transition-all hover:opacity-95 active:scale-95"
                  >
                    <span>Book a Project Sprint</span>
                    <ArrowUpRight size={15} />
                  </Link>

                  <a
                    href="#showcase"
                    className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/[0.09] active:scale-95"
                  >
                    <span>Explore Free Showcase</span>
                  </a>
                </TimelineContent>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
