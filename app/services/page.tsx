"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Cpu,
  Layers,
  Palette,
  ShieldCheck,
  Sparkles,
  Zap,
  Globe,
  Smartphone,
  ChevronDown,
  MonitorCheck,
  Terminal,
  Gauge,
  Rocket,
  Flame,
  CheckCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import PricingSection from "@/components/ui/pricing";
import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const SERVICES_LIST = [
  {
    icon: <Code2 className="text-orange-400" size={24} />,
    title: "Full-Stack Web Development",
    category: "Engineering",
    desc: "Production-grade Next.js, React 19, and TypeScript web applications engineered for speed, modularity, and enterprise reliability.",
    points: [
      "Next.js App Router & Server Components",
      "Supabase PostgreSQL & Realtime APIs",
      "Bulletproof TypeScript & strict linting",
      "Edge-cached global CDN routing",
    ],
    tag: "Core Service",
  },
  {
    icon: <Palette className="text-pink-400" size={24} />,
    title: "Modern UI/UX & Web Design",
    category: "Design",
    desc: "Bespoke digital design tailored to your brand. We build hypnotic, dark-mode first interfaces that turn passive visitors into paying customers.",
    points: [
      "Figma to production-ready code",
      "Interactive Framer Motion interactions",
      "Scalable design tokens & CSS variables",
      "Accessible WCAG AA/AAA compliance",
    ],
    tag: "High Demand",
  },
  {
    icon: <Cpu className="text-amber-400" size={24} />,
    title: "AI Workflows & Multi-Platform",
    category: "AI & Cloud",
    desc: "Equip your application with state-of-the-art LLMs, generative copilots, vector embeddings, and cross-platform responsive clients.",
    points: [
      "Claude 3.7 & GPT-4o API integration",
      "Custom RAG & vector semantic search",
      "Responsive web, tablet & mobile PWA",
      "Interactive AI copilot chat widgets",
    ],
    tag: "Next-Gen",
  },
  {
    icon: <Zap className="text-purple-400" size={24} />,
    title: "Bespoke Shaders & Physics UI",
    category: "Creative Tech",
    desc: "Stand out from the sea of boring websites with GPU-accelerated WebGL simulations, liquid ripples, and dynamic particle effects.",
    points: [
      "Custom Three.js & WebGL canvas shaders",
      "Smooth 60fps micro-physics engines",
      "Sound & pointer reactive canvas",
      "Zero-dependency fallbacks",
    ],
    tag: "Showstopper",
  },
  {
    icon: <Gauge className="text-emerald-400" size={24} />,
    title: "Performance & SEO Architecture",
    category: "Optimization",
    desc: "Sub-second load times and perfect Core Web Vitals so Google and your users fall in love with your product instantly.",
    points: [
      "99+ Lighthouse performance scores",
      "Dynamic OpenGraph & structured data",
      "Zero layout shifts (CLS < 0.01)",
      "Automated image & font optimization",
    ],
    tag: "Growth",
  },
  {
    icon: <ShieldCheck className="text-sky-400" size={24} />,
    title: "Design Systems & Code Foundations",
    category: "Architecture",
    desc: "Clean, reusable component registries built on shadcn conventions and Tailwind CSS for rapid feature shipping.",
    points: [
      "Modular components in /components/ui",
      "Type-safe prop APIs & documentation",
      "Continuous integration & regression checks",
      "100% full source code ownership",
    ],
    tag: "Foundational",
  },
];

const CASE_STUDIES = [
  {
    index: "01",
    client: "Nexus Intelligence",
    year: "2026",
    role: "Full-Stack Web & AI Engineering",
    title: "Nexus Intelligence Cloud",
    subtitle: "Real-time AI telemetry, sub-second vector search & low-latency model benchmarking.",
    summary:
      "We partnered with the founding team to architect and ship their core intelligence platform. Engineered with Next.js 15, edge-cached server components, and Supabase pgvector.",
    impact: {
      headline: "+340% User Retention",
      stats: [
        { label: "Global Edge Latency", value: "< 118ms" },
        { label: "Vector Search Queries", value: "4.2M / mo" },
        { label: "Lighthouse Performance", value: "99 / 100" },
      ],
    },
    deliverables: ["Full-Stack App", "Design System", "Edge RAG Pipeline", "PostgreSQL"],
    badge: "Shipped to Production",
    accentColor: "from-orange-500/20 via-orange-500/5 to-transparent",
    borderAccent: "group-hover:border-orange-500/40",
  },
  {
    index: "02",
    client: "Aether Soundworks",
    year: "2025",
    role: "Creative Development & WebGL Shaders",
    title: "Aether Interactive Experience",
    subtitle: "Hypnotic digital portfolio driven by custom liquid physics shaders and cursor dynamics.",
    summary:
      "Designed and coded a fluid 3D showcase using Three.js and custom GLSL heightfields. Achieved a locked 60 FPS across both desktop viewports and mobile touchscreens.",
    impact: {
      headline: "Awwwards Site of the Day",
      stats: [
        { label: "Frame Budget", value: "16.6ms (60 FPS)" },
        { label: "GPU Memory Footprint", value: "16.4 MB" },
        { label: "Avg Session Duration", value: "4m 12s" },
      ],
    },
    deliverables: ["Creative Direction", "GLSL Shaders", "Three.js", "Framer Motion"],
    badge: "Award-Winning Showcase",
    accentColor: "from-purple-500/20 via-purple-500/5 to-transparent",
    borderAccent: "group-hover:border-purple-500/40",
  },
  {
    index: "03",
    client: "HyperFlow Global",
    year: "2026",
    role: "Fintech Web Architecture",
    title: "HyperFlow High-Velocity Suite",
    subtitle: "Institutional-grade financial terminal with real-time settlement feeds and zero-shift layout.",
    summary:
      "Re-engineered their web platform to achieve instantaneous page switches and bank-grade data security. Deployed across multi-region Edge KV nodes for sub-35ms order updates.",
    impact: {
      headline: "$180M+ Capital Processed",
      stats: [
        { label: "Execution Settle", value: "31ms" },
        { label: "Cumulative Layout Shift", value: "0.000" },
        { label: "Security Compliance", value: "SOC2 Ready" },
      ],
    },
    deliverables: ["Web Architecture", "Financial Charts", "Edge KV Sync", "TypeScript"],
    badge: "Enterprise Production",
    accentColor: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    borderAccent: "group-hover:border-emerald-500/40",
  },
  {
    index: "04",
    client: "Synapse Workspace",
    year: "2026",
    role: "Cross-Platform Web Client",
    title: "Synapse Multi-Device Client",
    subtitle: "Adaptive responsive web client with offline state hydration and instant modular workflows.",
    summary:
      "Engineered an offline-first PWA workspace that seamlessly adapts from smartphone viewports to ultra-wide multi-monitor setups with zero performance degradation.",
    impact: {
      headline: "50,000+ Active Seats",
      stats: [
        { label: "Initial Gzip Bundle", value: "12.8 KB" },
        { label: "Offline Hydration", value: "0ms Delay" },
        { label: "Core Web Vitals", value: "100 / 100" },
      ],
    },
    deliverables: ["Responsive PWA", "Container Queries", "Offline Sync", "shadcn UI"],
    badge: "Scale Stage",
    accentColor: "from-sky-500/20 via-sky-500/5 to-transparent",
    borderAccent: "group-hover:border-sky-500/40",
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Subscribe & Scope",
    subtitle: "Discovery & Blueprint",
    desc: "Tell us about your brand, technical goals, and product requirements. We establish the design system, architecture, and feature backlog.",
  },
  {
    step: "02",
    title: "Rapid Sprints",
    subtitle: "Design, Code & Iterate",
    desc: "We build high-fidelity interactive components and full-stack modules. You receive live staging previews with continuous iterations every 48 hours.",
  },
  {
    step: "03",
    title: "Benchmark & Launch",
    subtitle: "Production Handover",
    desc: "We stress-test cross-browser performance, optimize SEO & Core Web Vitals, and deliver clean, documented source code directly into your repository.",
  },
];

const SERVICE_FAQS = [
  {
    q: "How fast do you deliver web development and design projects?",
    a: "Most single-page websites, interactive components, and landing pages are designed, coded, and delivered within 48 to 72 hours. Larger full-stack web applications and multi-platform SaaS products typically progress in fast 1-to-2 week sprint milestones.",
  },
  {
    q: "What technologies and frameworks do you specialize in?",
    a: "We specialize in modern frontend and full-stack stacks: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn UI conventions, Supabase / PostgreSQL, WebGL/Three.js shaders, and LLM integrations with Claude and OpenAI.",
  },
  {
    q: "Do you support cross-platform and mobile responsiveness?",
    a: "Yes. Every web application, component, and dashboard we engineer is rigorously tested across mobile viewports, tablets, laptops, and ultra-wide desktop monitors, ensuring touch-friendly micro-interactions and smooth 60fps animations.",
  },
  {
    q: "How does the pricing and billing work?",
    a: "We offer transparent monthly subscriptions with no lock-in contracts, as well as annual billing with a 20% discount. You can also contact our studio directly for custom one-off milestone contracts or dedicated enterprise engineering squads.",
  },
  {
    q: "Who owns the code and design intellectual property?",
    a: "You retain 100% full intellectual property and source code ownership from day one. All code is delivered clean, documented, and ready to be hosted in your own GitHub repository and cloud infrastructure.",
  },
];

export default function ServicesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#08080a] text-[#e5e5e5] pt-28 pb-20 selection:bg-orange-500/30 selection:text-white">
      {/* ── 1. HERO SECTION ── */}
      <section className="relative px-4 sm:px-6 pt-10 pb-16 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient lighting glows */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-b from-orange-500/15 via-purple-500/10 to-transparent blur-3xl rounded-full" />

        <div className="text-center space-y-4 max-w-4xl mx-auto relative z-10 flex flex-col items-center">
          {/* Label Pill: Homepage hero grad-ring style */}
          <span className="grad-ring mb-2 inline-flex items-center rounded-full">
            <span className="grad-text px-[10px] py-[4px] text-[10px] font-bold uppercase leading-none">
              Productized Web & Design Studio
            </span>
          </span>

          {/* Heading: Homepage hero Inter 900 uppercase font style with VerticalCutReveal spring animation */}
          <h1 className="mb-3 text-center text-[38px] font-black uppercase leading-[38px] tracking-[-0.03em] text-[#e5e5e5] sm:text-[48px] sm:leading-[46px] md:text-[56px] max-w-3xl">
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
              High-Impact Web Design & Full-Stack Engineering Powered by AI
            </VerticalCutReveal>
          </h1>

          {/* Subtitle: Homepage hero subtitle style */}
          <p className="mb-6 max-w-md text-center font-medium text-[#a1a1aa] mx-auto text-sm sm:text-base leading-relaxed">
            We partner with visionary startups and founders to design and build world-class,
            multi-platform web applications, hypnotic interactive components, and bespoke AI copilots.
          </p>

          {/* Primary CTA Buttons: Homepage hero pale-gradient pill style */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
            <Link
              href="/contact"
              className="flex h-14 items-center justify-center gap-1.5 rounded-full border-t-2 border-white px-8 text-base font-semibold text-[#09090b] transition-opacity hover:opacity-90 shadow-xl"
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgb(207, 222, 246) 20%, rgb(250, 250, 250) 80%)",
              }}
            >
              <span>Book a Project Sprint</span>
              <ArrowUpRight size={17} />
            </Link>

            <a
              href="#pricing"
              className="flex h-14 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-7 text-sm sm:text-base font-semibold text-white transition hover:bg-white/[0.08]"
            >
              <span>View Pricing Plans</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── 2. SERVICES SUITE GRID ── */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-left mb-12 space-y-3 max-w-2xl">
          <span className="grad-ring mb-2 inline-flex items-center rounded-full">
            <span className="grad-text px-[10px] py-[4px] text-[10px] font-bold uppercase leading-none">
              Services & Capabilities
            </span>
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-[-0.03em] text-[#e5e5e5]">
            <VerticalCutReveal
              splitBy="words"
              staggerDuration={0.12}
              staggerFrom="first"
              reverse={true}
              containerClassName="justify-start text-left"
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 40,
                delay: 0,
              }}
            >
              Comprehensive services tailored for modern products
            </VerticalCutReveal>
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            From single landing page redesigns to complex multi-platform web applications with AI workflows.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_LIST.map((srv, idx) => (
            <SpotlightCard
              key={idx}
              className="p-7 border-white/[0.08] hover:border-orange-500/40"
              spotlightColor="rgba(249, 115, 22, 0.10)"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] group-hover:scale-105 transition-transform">
                    {srv.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-zinc-500 font-semibold tracking-wider">
                      // 0{idx + 1}
                    </span>
                    <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 text-[10.5px] font-semibold text-orange-300">
                      {srv.tag}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  {srv.category}
                </div>
                <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-orange-300 transition-colors">
                  {srv.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
                  {srv.desc}
                </p>

                <div className="space-y-2 border-t border-white/[0.06] pt-4">
                  {srv.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-xs text-neutral-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/[0.05]">
                <Link
                  href="/contact"
                  className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-300 group-hover:text-orange-400 transition"
                >
                  <span>Request this capability</span>
                  <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* ── 3. ELITE STUDIO CASE STUDIES & SHIPPED IMPACT ── */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.06]">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="space-y-3 max-w-2xl">
            <span className="grad-ring mb-2 inline-flex items-center rounded-full">
              <span className="grad-text px-[10px] py-[4px] text-[10px] font-bold uppercase leading-none">
                Proven Track Record
              </span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-[-0.03em] text-[#e5e5e5] leading-tight">
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.12}
                staggerFrom="first"
                reverse={true}
                containerClassName="justify-start text-left"
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 40,
                  delay: 0,
                }}
              >
                Selected Work & Shipped Impact
              </VerticalCutReveal>
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
              Explore how we translate high-converting digital design, custom WebGL physics, and full-stack engineering into market-leading products.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/#showcase"
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-semibold text-white hover:bg-white/[0.08] transition"
            >
              <span>Explore Gallery</span>
              <ArrowUpRight size={14} className="text-orange-400" />
            </Link>
            <Link
              href="/contact"
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/25 hover:opacity-95 transition"
            >
              <span>Commission a Sprint</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Elite Studio Case Studies Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {CASE_STUDIES.map((item, pIdx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: pIdx * 0.1, ease: "easeOut" }}
              className="h-full"
            >
              <SpotlightCard
                className={`h-full p-7 sm:p-9 border-white/[0.08] ${item.borderAccent} bg-[#0e0e13]`}
                spotlightColor="rgba(249, 115, 22, 0.10)"
              >
                <div className="space-y-6">
                  {/* Top Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-orange-400 font-bold tracking-wider">[{item.index}]</span>
                      <span className="text-white font-semibold">{item.client}</span>
                      <span className="text-zinc-500">/</span>
                      <span className="text-zinc-400">{item.year}</span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Role */}
                  <div className="space-y-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-orange-400/90 block">
                      {item.role}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-orange-200 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm font-medium text-zinc-300">
                      {item.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed pt-1">
                      {item.summary}
                    </p>
                  </div>

                  {/* Quantifiable Business Outcome Box */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#07070a] p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                      <span className="font-mono text-[10.5px] uppercase tracking-wider text-zinc-400">
                        Quantified Business Impact
                      </span>
                      <span className="font-mono text-sm font-extrabold text-orange-400">
                        {item.impact.headline}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {item.impact.stats.map((stat, sIdx) => (
                        <div key={sIdx} className="space-y-1">
                          <span className="font-mono text-[9.5px] text-zinc-500 uppercase tracking-wider block">
                            {stat.label}
                          </span>
                          <span className="font-mono text-xs sm:text-sm font-bold text-white block">
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Deliverables & Action Footer */}
                <div className="mt-8 pt-5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.deliverables.map((del, dIdx) => (
                      <span
                        key={dIdx}
                        className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-mono text-zinc-300"
                      >
                        {del}
                      </span>
                    ))}
                  </div>

                  <Link
                    href="/contact"
                    className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-orange-400 transition"
                  >
                    <span>Inquire Project Scope</span>
                    <ArrowUpRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 5. HOW WE WORK (PRODUCTIZED PROCESS) ── */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="rounded-3xl border border-white/[0.08] bg-[#101014] p-8 sm:p-14">
          <div className="text-center space-y-3 max-w-xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How our design & dev sprints work
            </h2>
            <p className="text-sm text-neutral-400">
              No endless meetings or rigid agency bloat. Pure velocity and code quality.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.step}
                className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-black text-orange-500/80 font-mono">
                    {step.step}
                  </span>
                  <Rocket size={18} className="text-neutral-500" />
                </div>
                <h4 className="text-lg font-bold text-white">
                  {step.title}
                </h4>
                <p className="text-xs font-mono text-orange-400 uppercase tracking-wider">
                  {step.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. INTERACTIVE PRICING SECTION ── */}
      <section id="pricing" className="scroll-mt-24 w-full">
        <PricingSection />
      </section>

      {/* ── 7. FREQUENTLY ASKED QUESTIONS ── */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-10 border-t border-white/[0.06]">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="grad-ring mb-2 inline-flex items-center rounded-full">
            <span className="grad-text px-[10px] py-[4px] text-[10px] font-bold uppercase leading-none">
              Services & Partnership FAQ
            </span>
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-[-0.03em] text-[#e5e5e5]">
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
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-lg mx-auto">
            Everything you need to know about our design & dev sprints, code ownership, and deliverables.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {SERVICE_FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/[0.08] bg-[#111116] overflow-hidden transition hover:border-white/20"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="cursor-pointer flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-white transition"
                >
                  <span className={isOpen ? "text-orange-300" : "text-white"}>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-neutral-400 shrink-0 ml-4 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-orange-400" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-[13px] leading-relaxed text-neutral-300 border-t border-white/[0.04]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 8. MASTER BOTTOM CTA BANNER ── */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto pt-8">
        <div className="relative rounded-3xl border border-orange-500/30 bg-gradient-to-br from-[#1c1410] via-[#121217] to-[#0c0c0f] p-8 sm:p-14 text-center space-y-6 overflow-hidden shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 px-3.5 py-1 text-xs font-semibold text-orange-400">
              <Sparkles size={12} />
              Ready to ship your next big idea?
            </span>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Let's engineer an experience your users won't forget.
            </h3>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              Tell us about your product or request a custom quote. Our lead engineers review every submission and respond in under 24 hours.
            </p>
          </div>

          <div className="pt-2 relative z-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:opacity-95"
            >
              <span>Start Your Project</span>
              <ArrowUpRight size={15} />
            </Link>
            <Link
              href="/about"
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              <span>Learn About Our Studio</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
