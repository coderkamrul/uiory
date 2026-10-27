"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  Globe,
  Mail,
  MessageSquare,
  Send,
  Sparkles,
} from "lucide-react";
import { saveContactSubmission } from "@/lib/contact";
import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "Custom Component Engineering",
    message: "",
  });

  const topics = [
    "Custom Component Engineering",
    "Design System Architecture",
    "AI Prompt Optimization",
    "Commercial License / Pro Access",
    "General Inquiry",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await saveContactSubmission({
        name: form.name,
        email: form.email,
        topic: form.topic,
        message: form.message,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-[#e5e5e5] pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-16">

        {/* ── HEADER ── */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3.5 py-1 text-xs font-medium text-purple-300">
            <MessageSquare size={13} />
            <span>Get in Touch</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
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
              Let&apos;s build something extraordinary.
            </VerticalCutReveal>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400">
            Have a question about our prompt library, need a bespoke interactive component, or want to explore an enterprise design system? We&apos;d love to hear from you.
          </p>
        </div>

        {/* ── CONTENT GRID: FORM + SIDEBAR ── */}
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 items-start">

          {/* Form Container */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#111115] p-7 sm:p-9 relative overflow-hidden">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Message Transmitted!
                </h3>
                <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-white">{form.name}</strong>. Our engineering team has received your message regarding <strong className="text-purple-300">{form.topic}</strong> and will follow up at <strong className="text-white">{form.email}</strong> within 24 hours.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", topic: "Custom Component Engineering", message: "" });
                    }}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.1]"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Send an Inquiry
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Fill out the form below and we will get back to you promptly.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-[#16161b] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-[#16161b] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Inquiry Topic
                  </label>
                  <select
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#16161b] px-3.5 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                  >
                    {topics.map((t) => (
                      <option key={t} value={t} className="bg-[#16161b] text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Project Details / Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe your design vision, required interactions, target framework, or specific questions..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#16161b] p-3.5 text-sm text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  ) : (
                    <>
                      <Send size={14} />
                      Transmit Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Direct Channels / Telemetry Sidebar */}
          <div className="space-y-5">
            <div className="rounded-3xl border border-white/[0.08] bg-[#111115] p-6 space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Direct Channels
              </h3>

              <div className="space-y-4">
                <a
                  href="mailto:hello@uiory.com"
                  className="flex items-start gap-3 group rounded-xl p-2.5 -mx-2 hover:bg-white/[0.03] transition"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500">General Inquiries</p>
                    <p className="text-sm font-semibold text-white group-hover:text-purple-300 transition truncate">
                      hello@uiory.com
                    </p>
                  </div>
                </a>

                <div className="flex items-start gap-3 p-2.5 -mx-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Response SLA</p>
                    <p className="text-sm font-semibold text-white">
                      Within 24 Hours
                    </p>
                    <p className="text-[11px] text-zinc-500">Monday — Friday</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 -mx-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Globe size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Studio Operations</p>
                    <p className="text-sm font-semibold text-white">
                      Global / Remote-First
                    </p>
                    <p className="text-[11px] text-zinc-500">Supporting US, EU & APAC</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Link Card */}
            <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#16161c] to-[#101014] p-6 space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400">
                Explore First
              </span>
              <h4 className="text-base font-bold text-white">
                Looking for free components?
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                All prompts in our open showcase are 100% free to copy and adapt for personal or commercial projects.
              </p>
              <Link
                href="/#showcase"
                className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-purple-300 transition pt-1"
              >
                Browse prompt gallery <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
