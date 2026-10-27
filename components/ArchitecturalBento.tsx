"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  Check,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  ShieldCheck,
  Terminal,
  Activity,
  Sliders,
  Code2
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function ArchitecturalBento() {
  /* ── Interactive State for Card 1 (Prompt Constraint Diff) ── */
  const [promptTab, setPromptTab] = useState<"generic" | "forge">("forge");

  /* ── Interactive State for Card 2 (Framework Target Matrix) ── */
  const [framework, setFramework] = useState<"next" | "react" | "vue" | "svelte">("next");
  const [copiedCode, setCopiedCode] = useState(false);

  /* ── Interactive State for Card 3 (Physics Ripple Trigger) ── */
  const [rippleActive, setRippleActive] = useState(false);

  const frameworkSnippets = {
    next: `"use client";
import { motion } from "framer-motion";

export function HypnoticCard({ title, badge }: Props) {
  return (
    <motion.div whileHover={{ y: -4 }} className="grad-ring">
      <div className="bg-[#111116] p-6 rounded-2xl">
        <span className="font-mono text-orange-400">{badge}</span>
        <h3 className="text-white font-bold">{title}</h3>
      </div>
    </motion.div>
  );
}`,
    react: `import React, { useState } from "react";

export function HypnoticCard({ title, badge }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="p-6 rounded-2xl bg-[#111116] border border-white/10"
    >
      <span className="text-xs font-mono text-orange-400">{badge}</span>
      <h3 className="text-white font-bold">{title}</h3>
    </div>
  );
}`,
    vue: `<script setup lang="ts">
defineProps<{ title: string; badge: string }>();
</script>

<template>
  <div class="p-6 rounded-2xl bg-[#111116] border border-white/10 hover:border-orange-500/40 transition">
    <span class="text-xs font-mono text-orange-400">{{ badge }}</span>
    <h3 class="text-white font-bold">{{ title }}</h3>
  </div>
</template>`,
    svelte: `<script lang="ts">
  export let title: string;
  export let badge: string;
</script>

<div class="p-6 rounded-2xl bg-[#111116] border border-white/10 hover:border-orange-500/40 transition">
  <span class="text-xs font-mono text-orange-400">{badge}</span>
  <h3 class="text-white font-bold">{title}</h3>
</div>`,
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(frameworkSnippets[framework]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const triggerRipple = () => {
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 1200);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
      {/* ─────────────────────────────────────────────────────────────
          BENTO 1 (Col 1-7): Zero-Hallucination Prompt Architecture
          ───────────────────────────────────────────────────────────── */}
      <div className="md:col-span-7">
        <SpotlightCard
          className="h-full p-6 sm:p-8 border-white/[0.08] hover:border-orange-500/40"
          spotlightColor="rgba(249, 115, 22, 0.12)"
        >
          <div className="space-y-5">
            {/* Monospace Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3 text-[11px] font-mono">
              <span className="text-orange-400 font-bold">[01 // CONSTRAINT ENGINEERING]</span>
              <span className="text-zinc-400">PROMPT CALIBRATION BENCHMARK</span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Zero-Hallucination Blueprint Architecture
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Standard AI prompts hallucinate missing packages and broken CSS. uiory blueprints enforce strict state machines, self-contained dependencies, and verified styling variables.
              </p>
            </div>

            {/* Interactive Mode Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPromptTab("forge")}
                className={`cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
                  promptTab === "forge"
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-bold shadow-sm"
                    : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-white"
                }`}
              >
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>uiory Blueprint (Verified)</span>
              </button>
              <button
                type="button"
                onClick={() => setPromptTab("generic")}
                className={`cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
                  promptTab === "generic"
                    ? "border-rose-500/50 bg-rose-500/10 text-rose-300 font-bold shadow-sm"
                    : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-white"
                }`}
              >
                <AlertTriangle size={12} className="text-rose-400" />
                <span>Generic AI Prompt (Fragile)</span>
              </button>
            </div>

            {/* Code / Output Inspector Box */}
            <div className="rounded-xl border border-white/[0.08] bg-[#060609] p-4 font-mono text-xs overflow-hidden">
              <AnimatePresence mode="wait">
                {promptTab === "forge" ? (
                  <motion.div
                    key="forge"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-[10.5px] border-b border-white/[0.04] pb-2 text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        STATUS: COMPILES CLEANLY (0 ERRORS)
                      </span>
                      <span className="text-zinc-500">100% SELF-CONTAINED</span>
                    </div>

                    <div className="text-zinc-300 space-y-1 text-[11px] leading-relaxed">
                      <p className="text-zinc-500">// Guaranteed deterministic output</p>
                      <p className="text-purple-400 font-semibold">@spec: uiory v2.4</p>
                      <p className="text-zinc-400">
                        <span className="text-sky-300">dependencies</span>: <span className="text-emerald-300">["lucide-react", "clsx", "tailwind-merge"]</span>
                      </p>
                      <p className="text-zinc-400">
                        <span className="text-sky-300">constraints</span>: [
                        <span className="text-amber-300">"zero-layout-shift"</span>,
                        <span className="text-amber-300">"mobile-first"</span>,
                        <span className="text-amber-300">"wcag-aa"</span>]
                      </p>
                      <p className="text-emerald-300/90 pt-1">
                        ✔ Verified across Claude 3.7 Sonnet, GPT-4o, and Gemini 2.5 Pro
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="generic"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-[10.5px] border-b border-white/[0.04] pb-2 text-rose-400">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle size={12} className="text-rose-400" />
                        BUILD ERROR: 3 UNRESOLVED DEPENDENCIES
                      </span>
                      <span className="text-rose-500/80">HALLUCINATED</span>
                    </div>

                    <div className="text-zinc-400 space-y-1 text-[11px] leading-relaxed line-through decoration-rose-500/60 opacity-80">
                      <p className="text-rose-400/90 not-line-through">
                        Error: Module not found "react-hypnotic-mesh-gl"
                      </p>
                      <p>import {`{ HypnoticWave }`} from "react-hypnotic-mesh-gl";</p>
                      <p>import {`{ SuperAnimationEngine }`} from "magic-ui-fake-lib";</p>
                      <p className="not-line-through text-rose-400/80 pt-1">
                        ✖ Broken styles, missing props, and fragile hydration crash.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono text-[11px]">Strict Prompt Linting: Passed</span>
            <span className="text-emerald-400 font-semibold font-mono">100% Pass Rate</span>
          </div>
        </SpotlightCard>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BENTO 2 (Col 8-12): Universal Framework Target Matrix
          ───────────────────────────────────────────────────────────── */}
      <div className="md:col-span-5">
        <SpotlightCard
          className="h-full p-6 sm:p-8 border-white/[0.08] hover:border-orange-500/40"
          spotlightColor="rgba(249, 115, 22, 0.12)"
        >
          <div className="space-y-5">
            {/* Monospace Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-[11px] font-mono">
              <span className="text-orange-400 font-bold">[02 // MULTI-STACK]</span>
              <span className="text-sky-400">PORTABLE RUNTIME</span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                100% Framework Agnostic
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Clean HTML5 semantic structure and standard Tailwind tokens. Drop effortlessly into your preferred frontend without rewriting layout wrappers.
              </p>
            </div>

            {/* Framework Switcher Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              {(["next", "react", "vue", "svelte"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFramework(key)}
                  className={`cursor-pointer px-2.5 py-1 rounded-md border transition-all ${
                    framework === key
                      ? "border-sky-500/50 bg-sky-500/10 text-sky-300 font-bold shadow-sm"
                      : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-white"
                  }`}
                >
                  {key === "next" ? "Next.js 15" : key === "react" ? "React 19" : key === "vue" ? "Vue 3" : "Svelte 5"}
                </button>
              ))}
            </div>

            {/* Micro Code Box */}
            <div className="relative rounded-xl border border-white/[0.08] bg-[#060609] p-3.5 font-mono text-[11px] overflow-hidden">
              <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-2 border-b border-white/[0.04] pb-1.5">
                <span className="flex items-center gap-1">
                  <Code2 size={11} className="text-sky-400" />
                  component.{framework === "vue" ? "vue" : framework === "svelte" ? "svelte" : "tsx"}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="cursor-pointer flex items-center gap-1 text-zinc-400 hover:text-white transition"
                >
                  {copiedCode ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copiedCode ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <pre className="text-zinc-300 overflow-x-auto max-h-28 text-[10.5px] leading-relaxed">
                {frameworkSnippets[framework]}
              </pre>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono text-[11px]">Runtime Overhead</span>
            <span className="text-sky-300 font-bold font-mono">0 KB Bloat</span>
          </div>
        </SpotlightCard>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BENTO 3 (Col 1-5): GPU Shaders & 60 FPS Micro-Interactions
          ───────────────────────────────────────────────────────────── */}
      <div className="md:col-span-5">
        <SpotlightCard
          className="h-full p-6 sm:p-8 border-white/[0.08] hover:border-orange-500/40"
          spotlightColor="rgba(249, 115, 22, 0.12)"
        >
          <div className="space-y-5">
            {/* Monospace Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-[11px] font-mono">
              <span className="text-orange-400 font-bold">[03 // GPU PHYSICS]</span>
              <span className="text-purple-400">60 FPS LOCKED</span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Fluid Shaders & Micro-Physics
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Interactive liquid ripples, WebGL heightfields, and hardware-accelerated pointer physics calibrated to a strict 16.6ms frame budget.
              </p>
            </div>

            {/* Interactive Physics Sandbox Preview */}
            <div
              onClick={triggerRipple}
              className="cursor-pointer relative h-36 w-full rounded-xl border border-white/[0.08] bg-[#060609] p-3 flex flex-col justify-between overflow-hidden group/canvas"
            >
              {/* Subtle grid backdrop */}
              <div className="absolute inset-0 bg-[radial-gradient(#80808012_1px,transparent_1px)] [background-size:12px_12px]" />

              <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span className="text-purple-300 flex items-center gap-1">
                  <Activity size={10} className="text-purple-400" />
                  Interactive Ripple Trigger
                </span>
                <span className="text-emerald-400 font-bold">16.6ms / 60 FPS</span>
              </div>

              {/* Animated Canvas Wave Center */}
              <div className="relative z-10 flex items-center justify-center my-auto">
                {[1, 2, 3].map((r) => (
                  <motion.div
                    key={r}
                    className="absolute rounded-full border border-purple-500/30"
                    style={{ width: `${r * 50}px`, height: `${r * 50}px` }}
                    animate={{
                      scale: rippleActive ? [1, 1.4, 1] : [1, 1.05, 1],
                      opacity: rippleActive ? [0.6, 0.2, 0.5] : [0.2, 0.5, 0.2],
                    }}
                    transition={{
                      duration: rippleActive ? 0.8 : 3 + r,
                      repeat: rippleActive ? 0 : Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
                <div className="relative z-20 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-amber-500 text-white shadow-lg shadow-purple-500/30 group-hover/canvas:scale-110 transition-transform">
                  <Zap size={14} />
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between text-[9.5px] font-mono text-zinc-500">
                <span>Click to simulate touch wave</span>
                <span className="text-purple-400">CLS &lt; 0.001</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono text-[11px]">Hardware Acceleration</span>
            <span className="text-purple-300 font-bold font-mono">GPU Canvas</span>
          </div>
        </SpotlightCard>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BENTO 4 (Col 6-12): Commercial Freedom & Source Ownership
          ───────────────────────────────────────────────────────────── */}
      <div className="md:col-span-7">
        <SpotlightCard
          className="h-full p-6 sm:p-8 border-white/[0.08] hover:border-orange-500/40"
          spotlightColor="rgba(249, 115, 22, 0.12)"
        >
          <div className="space-y-5">
            {/* Monospace Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-[11px] font-mono">
              <span className="text-orange-400 font-bold">[04 // CODE FREEDOM]</span>
              <span className="text-emerald-400">100% UNRESTRICTED</span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Commercial-Ready & 100% Client-Owned
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Every component and prompt blueprint in our gallery is engineered for production deployment. No seat licenses, no proprietary npm dependencies, and no attribution required.
              </p>
            </div>

            {/* Concrete Licensing & Ownership Matrix */}
            <div className="grid sm:grid-cols-2 gap-2.5 rounded-xl border border-white/[0.08] bg-[#060609] p-3.5 text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-zinc-500 text-[10px] uppercase block">SOURCE CODE RIGHTS</span>
                <span className="text-white font-semibold flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  100% Full Ownership
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-zinc-500 text-[10px] uppercase block">COMMERCIAL PROJECTS</span>
                <span className="text-white font-semibold flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  Unlimited Deployments
                </span>
              </div>
              <div className="space-y-0.5 pt-1">
                <span className="text-zinc-500 text-[10px] uppercase block">PROPRIETARY LOCK-IN</span>
                <span className="text-white font-semibold flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  Zero Vendor Wrappers
                </span>
              </div>
              <div className="space-y-0.5 pt-1">
                <span className="text-zinc-500 text-[10px] uppercase block">ENTERPRISE AUDIT</span>
                <span className="text-white font-semibold flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  WCAG AA & TypeScript Strict
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[11px] text-zinc-400">License: MIT Open Blueprint</span>
            <Link
              href="/services"
              className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition"
            >
              <span>Explore Custom Studio Builds</span>
              <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
