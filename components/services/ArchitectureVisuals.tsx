"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Cpu,
  Activity,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Sliders,
  Laptop,
  Tablet,
  Smartphone,
  Check,
  TrendingUp,
  Shield,
  Clock,
  ArrowRight
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   1. NEURAL AI STREAMING ENGINE VISUAL (Nexus Intelligence Cloud)
   ───────────────────────────────────────────────────────────── */
export function AiStreamVisual() {
  const [activeModel, setActiveModel] = useState<"claude" | "gpt" | "deepseek">("claude");

  const modelSpecs = {
    claude: { name: "Claude 3.7 Sonnet", latency: "118ms", tokens: "94.2 tok/s", temp: "0.20", cost: "$0.003/1k" },
    gpt: { name: "GPT-4o Omnichannel", latency: "142ms", tokens: "88.6 tok/s", temp: "0.15", cost: "$0.0025/1k" },
    deepseek: { name: "DeepSeek R1 Distill", latency: "96ms", tokens: "112.4 tok/s", temp: "0.60", cost: "$0.0008/1k" },
  };

  const current = modelSpecs[activeModel];

  return (
    <div className="relative w-full rounded-xl border border-white/[0.08] bg-[#09090d] p-4 font-mono text-xs overflow-hidden select-none">
      {/* Background Matrix Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />

      {/* Telemetry Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3 text-[11px]">
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-zinc-200 font-bold">STREAM_ACTIVE</span>
          <span className="text-zinc-600">/</span>
          <span className="text-orange-400">{current.name}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-zinc-400">
          <span>TTFT: <strong className="text-white">{current.latency}</strong></span>
          <span>THROUGHPUT: <strong className="text-emerald-400">{current.tokens}</strong></span>
        </div>
      </div>

      {/* Interactive Model Selector Tabs */}
      <div className="relative z-10 mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-[10.5px]">
        {(["claude", "gpt", "deepseek"] as const).map((modelKey) => (
          <button
            key={modelKey}
            type="button"
            onClick={() => setActiveModel(modelKey)}
            className={`cursor-pointer px-2.5 py-1 rounded-md border transition-all ${
              activeModel === modelKey
                ? "border-orange-500/50 bg-orange-500/10 text-orange-300 font-semibold shadow-sm"
                : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            }`}
          >
            {modelKey === "claude" ? "Claude 3.7" : modelKey === "gpt" ? "GPT-4o" : "DeepSeek R1"}
          </button>
        ))}
      </div>

      {/* Code & Realtime Stream Box */}
      <div className="relative z-10 mt-3 rounded-lg border border-white/[0.06] bg-[#050508] p-3 text-[11px] leading-relaxed">
        <div className="flex items-center justify-between text-zinc-500 text-[10px] mb-1.5 pb-1 border-b border-white/[0.04]">
          <span className="flex items-center gap-1">
            <Terminal size={11} className="text-orange-400" />
            inference_pipeline.ts
          </span>
          <span>pgvector 1536d</span>
        </div>
        <div className="text-zinc-400 font-mono text-[10.5px] space-y-1">
          <p className="text-zinc-500">
            <span className="text-purple-400">const</span> session = <span className="text-purple-400">await</span> ai.<span className="text-sky-300">createStreamingSession</span>({`{`}
          </p>
          <p className="pl-3 text-zinc-400">
            model: <span className="text-amber-300">"{current.name}"</span>,
          </p>
          <p className="pl-3 text-zinc-400">
            temperature: <span className="text-emerald-300">{current.temp}</span>,
            ragLookup: <span className="text-orange-300">true</span>
          </p>
          <p className="text-zinc-500">{`});`}</p>
          <div className="pt-2 flex items-center gap-1.5 text-zinc-300">
            <span className="text-emerald-400">▶</span>
            <span className="text-zinc-300">Synthesizing token stream with low-latency KV cache...</span>
            <span className="inline-block w-1.5 h-3.5 bg-orange-400 animate-pulse ml-0.5" />
          </div>
        </div>
      </div>

      {/* Live Waveform Pulse Bar */}
      <div className="relative z-10 mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-zinc-400">
        <span className="flex items-center gap-1.5">
          <Activity size={12} className="text-orange-400" />
          <span>Realtime Vector Telemetry</span>
        </span>
        <div className="flex items-center gap-1">
          {[40, 75, 55, 90, 65, 100, 80, 45, 95, 70, 85, 60, 92, 100, 78].map((h, i) => (
            <span
              key={i}
              className="inline-block w-1 rounded-full bg-gradient-to-t from-orange-500 to-amber-300 opacity-80"
              style={{
                height: `${h * 0.16}px`,
                animation: `pulse 1.2s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. BESPOKE GPU PHYSICS & SHADER VISUAL (Aether Creative Studio)
   ───────────────────────────────────────────────────────────── */
export function GpuShaderVisual() {
  const [shaderMode, setShaderMode] = useState<"liquid" | "particles" | "mesh">("liquid");

  return (
    <div className="relative w-full rounded-xl border border-white/[0.08] bg-[#09090d] p-4 font-mono text-xs overflow-hidden select-none">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-purple-500/10 blur-2xl" />

      {/* Telemetry Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3 text-[11px]">
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-zinc-200 font-bold">WEBGL_2.0_CANVAS</span>
          <span className="text-zinc-600">/</span>
          <span className="text-purple-300 uppercase">{shaderMode}_SIM</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-zinc-400">
          <span>FPS: <strong className="text-emerald-400">60.0 LOCKED</strong></span>
          <span>VERTICES: <strong className="text-white">142,800</strong></span>
        </div>
      </div>

      {/* Interactive Simulation Mode Buttons */}
      <div className="relative z-10 mt-3 flex items-center gap-1.5 text-[10.5px]">
        {(["liquid", "particles", "mesh"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setShaderMode(mode)}
            className={`cursor-pointer px-2.5 py-1 rounded-md border transition-all ${
              shaderMode === mode
                ? "border-purple-500/50 bg-purple-500/10 text-purple-300 font-semibold shadow-sm"
                : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            }`}
          >
            {mode === "liquid" ? "Liquid Heightfield" : mode === "particles" ? "GPU Attractor" : "Curvature Mesh"}
          </button>
        ))}
      </div>

      {/* Dynamic Animated Canvas Preview */}
      <div className="relative z-10 mt-3 h-36 w-full rounded-lg border border-white/[0.06] bg-[#050508] overflow-hidden flex items-center justify-center">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800c_1px,transparent_1px),linear-gradient(to_bottom,#8080800c_1px,transparent_1px)] bg-[size:16px_16px]" />

        {/* Dynamic Shader Rings / Particle Wave representation */}
        <div className="relative flex items-center justify-center">
          {[1, 2, 3, 4].map((ring) => (
            <motion.div
              key={ring}
              className={`absolute rounded-full border ${
                shaderMode === "liquid"
                  ? "border-purple-500/30"
                  : shaderMode === "particles"
                  ? "border-dashed border-amber-500/30"
                  : "border-sky-500/30"
              }`}
              style={{
                width: `${ring * 60}px`,
                height: `${ring * 60}px`,
              }}
              animate={{
                scale: [1, 1.08, 1],
                rotate: ring % 2 === 0 ? [0, 180, 360] : [360, 180, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 6 + ring * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Center glowing core */}
          <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-amber-500 text-white shadow-lg shadow-purple-500/30">
            <Zap size={16} />
          </div>
        </div>

        {/* Live Shader Metadata Pill Overlay */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 rounded bg-black/70 border border-white/10 px-2 py-0.5 text-[9.5px] text-zinc-300 backdrop-blur-md">
          <span>GLSL Fragment Shader</span>
          <span className="text-zinc-600">|</span>
          <span className="text-purple-400">u_time: 284.1</span>
        </div>

        <div className="absolute top-2.5 right-2.5 rounded bg-black/70 border border-white/10 px-2 py-0.5 text-[9.5px] text-emerald-400 font-semibold backdrop-blur-md">
          MSAA 4X
        </div>
      </div>

      {/* Physics Shader Parameters Bar */}
      <div className="relative z-10 mt-3 pt-2 border-t border-white/[0.04] grid grid-cols-3 gap-2 text-[10px] text-zinc-400">
        <div>
          <span className="text-zinc-500 block">DAMPING</span>
          <span className="text-zinc-200 font-bold">0.962 (Fluid)</span>
        </div>
        <div>
          <span className="text-zinc-500 block">BUFFER</span>
          <span className="text-zinc-200 font-bold">16.4 MB GPU</span>
        </div>
        <div>
          <span className="text-zinc-500 block">PRECISION</span>
          <span className="text-purple-300 font-bold">mediump float</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. HIGH-FREQUENCY FINTECH ARCHITECTURE (HyperFlow Financial)
   ───────────────────────────────────────────────────────────── */
export function FintechEngineVisual() {
  const [metricView, setMetricView] = useState<"execution" | "orderbook">("execution");

  return (
    <div className="relative w-full rounded-xl border border-white/[0.08] bg-[#09090d] p-4 font-mono text-xs overflow-hidden select-none">
      {/* Background Matrix Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />

      {/* Telemetry Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3 text-[11px]">
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-200 font-bold">ORDER_ENGINE</span>
          <span className="text-zinc-600">/</span>
          <span className="text-emerald-400">SUB-34MS EXEC</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-zinc-400">
          <span>CWV SCORE: <strong className="text-white">100/100</strong></span>
          <span>CLS: <strong className="text-emerald-400">0.000</strong></span>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="relative z-10 mt-3 flex items-center justify-between text-[10.5px]">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMetricView("execution")}
            className={`cursor-pointer px-2.5 py-1 rounded-md border transition-all ${
              metricView === "execution"
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-semibold shadow-sm"
                : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Live Execution Stream
          </button>
          <button
            type="button"
            onClick={() => setMetricView("orderbook")}
            className={`cursor-pointer px-2.5 py-1 rounded-md border transition-all ${
              metricView === "orderbook"
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-semibold shadow-sm"
                : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Edge KV Cache
          </button>
        </div>

        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
          <TrendingUp size={11} />
          $14,892.40 (+3.8%)
        </span>
      </div>

      {/* Dynamic Telemetry Display */}
      <div className="relative z-10 mt-3 rounded-lg border border-white/[0.06] bg-[#050508] p-3 text-[10.5px]">
        {metricView === "execution" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-zinc-400 border-b border-white/[0.04] pb-1.5 text-[10px]">
              <span>TX_HASH</span>
              <span>TYPE</span>
              <span>AMOUNT</span>
              <span>LATENCY</span>
            </div>
            {[
              { hash: "0x89f...21a", type: "SETTLE", amount: "$84,200", ms: "28ms" },
              { hash: "0x12c...09b", type: "SWAP", amount: "$12,450", ms: "34ms" },
              { hash: "0xef4...91d", type: "EXEC", amount: "$150,000", ms: "31ms" },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between text-zinc-300">
                <span className="text-zinc-400">{row.hash}</span>
                <span className="text-orange-400 font-bold">{row.type}</span>
                <span className="text-emerald-300">{row.amount}</span>
                <span className="text-zinc-400 font-mono">{row.ms}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5 text-[10px] text-zinc-400">
            <p className="text-zinc-300 font-bold flex items-center gap-1.5">
              <Shield size={11} className="text-emerald-400" />
              Distributed Multi-Region Synchronization
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-zinc-400">
              <div className="rounded bg-white/[0.02] p-1.5 border border-white/[0.04]">
                <span className="text-zinc-500 block text-[9px]">PRIMARY REGION</span>
                <span className="text-zinc-200">iad1 (US-East) - 4ms</span>
              </div>
              <div className="rounded bg-white/[0.02] p-1.5 border border-white/[0.04]">
                <span className="text-zinc-500 block text-[9px]">EDGE REPLICAS</span>
                <span className="text-zinc-200">fra1, sin1, hnd1</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Footer */}
      <div className="relative z-10 mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-zinc-400">
        <span className="flex items-center gap-1.5">
          <Clock size={11} className="text-emerald-400" />
          <span>Lighthouse Performance: 100/100</span>
        </span>
        <span className="text-zinc-300 font-bold">SOC2 Encrypted</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. MULTI-DEVICE RESPONSIVE CLIENT (Synapse Workspace)
   ───────────────────────────────────────────────────────────── */
export function MultiDeviceVisual() {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const deviceWidths = {
    desktop: "w-full",
    tablet: "w-[75%]",
    mobile: "w-[48%]",
  };

  return (
    <div className="relative w-full rounded-xl border border-white/[0.08] bg-[#09090d] p-4 font-mono text-xs overflow-hidden select-none">
      {/* Background Matrix Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />

      {/* Telemetry Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3 text-[11px]">
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-zinc-200 font-bold">ADAPTIVE_PWA</span>
          <span className="text-zinc-600">/</span>
          <span className="text-sky-300 uppercase">{device} VIEWPORT</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-zinc-400">
          <span>BUNDLE: <strong className="text-white">12.8 KB gzip</strong></span>
          <span>HYDRATION: <strong className="text-emerald-400">0ms (RSC)</strong></span>
        </div>
      </div>

      {/* Interactive Device Switcher Buttons */}
      <div className="relative z-10 mt-3 flex items-center gap-1.5 text-[10.5px]">
        {[
          { key: "desktop", label: "Desktop (1440px)", icon: Laptop },
          { key: "tablet", label: "Tablet (768px)", icon: Tablet },
          { key: "mobile", label: "Mobile (375px)", icon: Smartphone },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setDevice(item.key as any)}
              className={`cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
                device === item.key
                  ? "border-sky-500/50 bg-sky-500/10 text-sky-300 font-semibold shadow-sm"
                  : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={11} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Animated Miniature Responsive Viewport Preview */}
      <div className="relative z-10 mt-3 h-36 w-full rounded-lg border border-white/[0.06] bg-[#050508] p-2 flex items-center justify-center overflow-hidden">
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className={`h-full rounded-md border border-white/[0.12] bg-[#0d0d12] p-2 flex flex-col justify-between shadow-lg transition-all ${deviceWidths[device]}`}
        >
          {/* Miniature App Topbar */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span className="text-[9px] text-zinc-300 font-bold">Synapse Core</span>
            </div>
            <span className="text-[8px] text-zinc-500 font-mono">
              {device === "desktop" ? "1440×900" : device === "tablet" ? "768×1024" : "375×812"}
            </span>
          </div>

          {/* Miniature App Dynamic Grid */}
          <div className="grid gap-1.5 py-1.5 flex-1 items-center" style={{
            gridTemplateColumns: device === "desktop" ? "repeat(3, 1fr)" : device === "tablet" ? "repeat(2, 1fr)" : "1fr"
          }}>
            <div className="rounded bg-white/[0.03] border border-white/[0.06] p-1.5 text-[8.5px] space-y-0.5">
              <span className="text-zinc-400 block font-semibold">Active Session</span>
              <span className="text-sky-300 font-bold">2,491 Nodes</span>
            </div>
            <div className="rounded bg-white/[0.03] border border-white/[0.06] p-1.5 text-[8.5px] space-y-0.5">
              <span className="text-zinc-400 block font-semibold">Sync State</span>
              <span className="text-emerald-400 font-bold">Encrypted</span>
            </div>
            {device !== "mobile" && (
              <div className="rounded bg-white/[0.03] border border-white/[0.06] p-1.5 text-[8.5px] space-y-0.5">
                <span className="text-zinc-400 block font-semibold">Edge Stream</span>
                <span className="text-amber-300 font-bold">Online</span>
              </div>
            )}
          </div>

          {/* Miniature Bottom Dock */}
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[8px] text-zinc-500">
            <span>Container Queries</span>
            <span className="text-sky-400">PWA Active</span>
          </div>
        </motion.div>
      </div>

      {/* Responsive Architecture Details */}
      <div className="relative z-10 mt-3 pt-2 border-t border-white/[0.04] grid grid-cols-3 gap-2 text-[10px] text-zinc-400">
        <div>
          <span className="text-zinc-500 block">ADAPTIVE</span>
          <span className="text-zinc-200 font-bold">Zero CLS Shifts</span>
        </div>
        <div>
          <span className="text-zinc-500 block">OFFLINE</span>
          <span className="text-zinc-200 font-bold">Service Worker</span>
        </div>
        <div>
          <span className="text-zinc-500 block">DEPLOY</span>
          <span className="text-sky-300 font-bold">Global Edge CDN</span>
        </div>
      </div>
    </div>
  );
}
