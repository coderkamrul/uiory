import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Code2, Cpu, Eye, Layers, Sparkles, Zap } from "lucide-react";
import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";

export const metadata = {
  title: "About Us — uiory",
  description: "Learn about uiory, our mission to elevate AI-generated frontend architecture, and how our verified prompts are crafted.",
};

export default function AboutPage() {
  const principles = [
    {
      icon: <Cpu className="text-purple-400" size={20} />,
      title: "Zero-Hallucination Prompts",
      desc: "Every prompt in our gallery is engineered with explicit design constraints, state machines, and fail-safe instructions to eliminate broken syntax and AI hallucinations.",
    },
    {
      icon: <Layers className="text-sky-400" size={20} />,
      title: "Framework-Agnostic Architecture",
      desc: "Components are built with standard HTML5, modern vanilla CSS, and clean TypeScript/React. Drop them seamlessly into Next.js, Vite, Vue, Svelte, or static sites.",
    },
    {
      icon: <Eye className="text-emerald-400" size={20} />,
      title: "Rigorously Benchmarked",
      desc: "We test every prompt against leading frontier coding models (Claude Sonnet, GPT-4o, Gemini 2.5 Pro) and publish true side-by-side comparisons so you see real outputs before shipping.",
    },
    {
      icon: <Sparkles className="text-amber-400" size={20} />,
      title: "Design-First Aesthetics",
      desc: "No bland default templates. We curate harmonic HSL color scales, authentic physics animations, and fluid micro-interactions that feel polished and premium at first glance.",
    },
  ];

  const milestones = [
    { value: "100+", label: "Verified Prompts" },
    { value: "50,000+", label: "Developer Copies" },
    { value: "100%", label: "Open & Free Prompts" },
    { value: "< 50ms", label: "Interactive Benchmarks" },
  ];

  return (
    <div className="min-h-screen bg-[#08080a] text-[#e5e5e5] pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-20">

        {/* ── HERO SECTION ── */}
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3.5 py-1 text-xs font-medium text-purple-300">
            <Sparkles size={13} />
            <span>The uiory Story</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
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
              Crafting the future of AI-assisted UI development.
            </VerticalCutReveal>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            uiory bridges the gap between raw AI code generation and production-grade frontend architecture. We turn vague design prompts into pixel-perfect, interactive reality.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/#showcase"
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Explore Showcase <ArrowUpRight size={15} />
            </Link>
            <Link
              href="/services"
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              Custom Services
            </Link>
          </div>
        </div>

        {/* ── STATS BAR ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl border border-white/[0.08] bg-[#111115] p-6 text-center">
          {milestones.map((m, i) => (
            <div key={i} className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white tabular-nums">
                {m.value}
              </p>
              <p className="text-xs font-medium text-zinc-500">{m.label}</p>
            </div>
          ))}
        </div>

        {/* ── THE PROBLEM & SOLUTION ── */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] p-7 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
                The Problem
              </span>
              <h3 className="text-xl font-bold text-white">
                Generic AI Code is Often Slop
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Asking an LLM to "build a nice navbar" usually results in broken responsive breakpoints, missing state transitions, missing CSS variables, and inaccessible DOM trees that cost hours to refactor.
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-rose-500/10 space-y-2 text-xs text-zinc-400">
              <p className="flex items-center gap-2 text-rose-300">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                Unpredictable syntax and missing dependencies
              </p>
              <p className="flex items-center gap-2 text-rose-300">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                Generic colors and lack of micro-interactions
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-7 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                The uiory Solution
              </span>
              <h3 className="text-xl font-bold text-white">
                Engineered Prompt Blueprints
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We craft prompt specifications with explicit architectural constraints: exact shaders, CSS custom properties, reactive state management, and real-time live preview benchmarks.
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-emerald-500/10 space-y-2 text-xs text-zinc-400">
              <p className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 size={13} className="text-emerald-400" />
                1-Click copy of full prompts with proven outputs
              </p>
              <p className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Self-contained, production-ready code you can trust
              </p>
            </div>
          </div>
        </div>

        {/* ── CORE PILLARS ── */}
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Built on Craft, Not Shortcuts
            </h2>
            <p className="text-sm text-zinc-400">
              Four non-negotiable principles that power every component in our showcase.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {principles.map((p, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-white/[0.08] bg-[#111115] p-6 transition hover:border-white/20 hover:bg-[#141419]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] mb-4">
                  {p.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM CTA ── */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#18181e] to-[#0f0f13] p-8 sm:p-12 text-center space-y-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
          <h3 className="text-2xl sm:text-3xl font-bold text-white max-w-xl mx-auto relative z-10">
            Have a project in mind or need custom frontend architecture?
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto relative z-10">
            We partner with innovative teams to build tailored design systems, bespoke components, and optimized prompt systems.
          </p>
          <div className="pt-2 relative z-10">
            <Link
              href="/contact"
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Get In Touch With Us <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
