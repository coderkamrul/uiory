"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ShowcaseItem } from "@/lib/data";
import { listComponents, listCategories } from "@/lib/db";
import {
  ContactSubmission,
  listContactSubmissions,
  updateContactSubmissionStatus,
  deleteContactSubmission,
} from "@/lib/contact";
import PreviewArt from "@/components/PreviewArt";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Crown,
  Database,
  ExternalLink,
  Eye,
  Film,
  Flame,
  HardDrive,
  Image as ImageIcon,
  Inbox,
  Layers,
  LayoutGrid,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  Scale,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      listCategories(),
      listComponents(),
      listContactSubmissions(),
    ]).then(([cList, compList, subList]) => {
      setCategories(cList.filter((c) => c !== "All"));
      setItems(compList);
      setSubmissions(subList);
      setLoaded(true);
    });
  }, []);

  // ── Quantitative Metrics ──
  const total = items.length;
  const singles = items.filter((i) => i.type !== "compare").length;
  const compares = items.filter((i) => i.type === "compare").length;
  const proComponents = items.filter((i) => i.pro).length;
  const freeComponents = total - proComponents;
  const totalCopies = items.reduce((s, i) => s + (i.copies || 0), 0);
  const avgCopies = total > 0 ? Math.round(totalCopies / total) : 0;

  // Inquiries metrics
  const newInquiriesCount = submissions.filter((s) => s.status === "new").length;

  // Media breakdown
  const withMedia = items.filter((i) => !!(i.mediaUrl || i.imageUrl));
  const videoCount = items.filter(
    (i) => i.mediaType === "video" || i.mediaUrl?.endsWith(".mp4") || i.imageUrl?.endsWith(".mp4")
  ).length;
  const imageCount = withMedia.length - videoCount;

  // Category distribution
  const categoryMap = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((item) => {
      if (item.category) map[item.category] = (map[item.category] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const categoryColors = [
    "bg-indigo-500",
    "bg-purple-500",
    "bg-sky-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-teal-500",
    "bg-zinc-500",
  ];

  const recentItems = useMemo(() => [...items].reverse().slice(0, 5), [items]);
  const topCopied = useMemo(
    () => [...items].sort((a, b) => (b.copies || 0) - (a.copies || 0)).slice(0, 4),
    [items]
  );


  if (!loaded) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-purple-500" />
          <p className="text-xs text-zinc-500 font-mono">Loading telemetry…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pb-16">

      {/* ── TOP HEADER / CONTROL BAR ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Studio Overview</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live DB Synced
            </span>
          </div>
          <p className="mt-1 text-[13px] text-zinc-400">
            Real-time telemetry, component distribution, asset metrics, and client inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#141418] px-3.5 py-2 text-[12.5px] font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Eye size={13} className="text-zinc-400" />
            Public Showcase
            <ExternalLink size={11} className="text-zinc-500" />
          </Link>
          <Link
            href="/admin/new"
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-[12.5px] font-semibold text-black shadow-sm transition hover:bg-zinc-200 active:scale-95"
          >
            <Plus size={14} />
            Add Component
          </Link>
        </div>
      </div>

      {/* ── KEY PERFORMANCE INDICATORS (4-COLUMN GRID) ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Metric 1: Total Components */}
        <div className="group relative rounded-2xl border border-white/[0.08] bg-[#111115] p-5 transition hover:border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Total Components
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-400 group-hover:text-white transition">
              <Layers size={15} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white tabular-nums">
              {total}
            </span>
            <span className="text-[11px] text-zinc-500">prompts published</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
            <span className="text-zinc-300 font-semibold">{singles}</span> Single
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-300 font-semibold">{compares}</span> Comparison
          </div>
        </div>

        {/* Metric 2: Total Prompt Copies */}
        <div className="group relative rounded-2xl border border-white/[0.08] bg-[#111115] p-5 transition hover:border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Prompt Engagement
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-400 group-hover:text-white transition">
              <Copy size={15} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white tabular-nums">
              {totalCopies > 0 ? totalCopies.toLocaleString() : "0"}
            </span>
            <span className="text-[11px] text-zinc-500">total copies</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400">
            <TrendingUp size={12} className="text-emerald-400" />
            <span>Avg <strong className="text-zinc-200">{avgCopies}</strong> copies per prompt</span>
          </div>
        </div>

        {/* Metric 3: Access / Monetization Tier */}
        <div className="group relative rounded-2xl border border-white/[0.08] bg-[#111115] p-5 transition hover:border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Access Tier Split
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Crown size={15} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white tabular-nums">
              {proComponents}
            </span>
            <span className="text-[11px] text-amber-400/90 font-medium">Pro</span>
            <span className="text-zinc-600 font-normal">/</span>
            <span className="text-lg font-bold text-zinc-400 tabular-nums">
              {freeComponents}
            </span>
            <span className="text-[11px] text-zinc-500 font-medium">Free</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05] flex">
            <div
              className="bg-amber-400 transition-all duration-700"
              style={{ width: `${total ? (proComponents / total) * 100 : 0}%` }}
              title={`Pro: ${proComponents}`}
            />
            <div
              className="bg-white/20 transition-all duration-700 flex-1"
              title={`Free: ${freeComponents}`}
            />
          </div>
        </div>

        {/* Metric 4: Contact Inquiries Inbox */}
        <a
          href="#inquiries"
          className="group relative rounded-2xl border border-white/[0.08] bg-[#111115] p-5 transition hover:border-white/20 block cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Client Inquiries
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition">
              <Mail size={15} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white tabular-nums">
              {submissions.length}
            </span>
            <span className="text-[11px] text-zinc-500">submissions</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            {newInquiriesCount > 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {newInquiriesCount} unread new
              </span>
            ) : (
              <span className="text-zinc-500">Inbox caught up</span>
            )}
            <span className="text-zinc-500 group-hover:text-white transition flex items-center gap-0.5">
              View <ChevronDown size={11} />
            </span>
          </div>
        </a>

      </div>

      {/* ── CATEGORY DISTRIBUTION (LINEAR STORAGE-STYLE MULTI-SEGMENT BAR) ── */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#111115] p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Tag size={15} className="text-zinc-400" />
              <h2 className="text-[14px] font-semibold text-white">Category Allocation</h2>
            </div>
            <p className="text-[12px] text-zinc-500 mt-0.5">
              Breakdown of prompts across {categories.length} active categories
            </p>
          </div>
          <Link
            href="/admin/components"
            className="cursor-pointer text-[12px] font-medium text-zinc-400 hover:text-white transition flex items-center gap-1 self-start sm:self-auto"
          >
            Manage Categories <ChevronRight size={13} />
          </Link>
        </div>

        {categoryMap.length === 0 ? (
          <p className="text-xs text-zinc-600 py-6 text-center">No categorized components yet.</p>
        ) : (
          <>
            {/* Multi-segment capacity bar */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.04] flex gap-0.5 p-0.5 ring-1 ring-white/[0.04]">
              {categoryMap.map(([cat, count], idx) => {
                const pct = total ? (count / total) * 100 : 0;
                const color = categoryColors[idx % categoryColors.length];
                return (
                  <div
                    key={cat}
                    style={{ width: `${pct}%` }}
                    className={`${color} h-full rounded-sm transition-all duration-500 hover:opacity-80`}
                    title={`${cat}: ${count} (${Math.round(pct)}%)`}
                  />
                );
              })}
            </div>

            {/* Category breakdown pill matrix */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {categoryMap.map(([cat, count], idx) => {
                const pct = total ? Math.round((count / total) * 100) : 0;
                const color = categoryColors[idx % categoryColors.length];
                return (
                  <Link
                    key={cat}
                    href={`/admin/components?category=${encodeURIComponent(cat)}`}
                    className="cursor-pointer group flex flex-col rounded-xl border border-white/[0.05] bg-white/[0.015] p-3 transition hover:border-white/15 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${color}`} />
                      <span className="truncate text-[12px] font-medium text-zinc-300 group-hover:text-white transition">
                        {cat}
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-base font-bold text-white tabular-nums leading-none">
                        {count}
                      </span>
                      <span className="text-[10.5px] font-mono text-zinc-500">
                        {pct}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── TWO-COLUMN SECTION: RECENT ADDITIONS & TOP COPIED / SHORTCUTS ── */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">

        {/* Left Column: Recent Components Feed */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111115] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-zinc-400" />
                <h2 className="text-[14px] font-semibold text-white">Recent Additions</h2>
              </div>
              <p className="text-[12px] text-zinc-500 mt-0.5">
                Latest prompts published to the library
              </p>
            </div>
            <Link
              href="/admin/components"
              className="cursor-pointer text-[12px] font-medium text-zinc-400 hover:text-white transition flex items-center gap-1"
            >
              View all ({total}) <ChevronRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {recentItems.length === 0 ? (
              <p className="text-xs text-zinc-600 py-8 text-center">No components added yet.</p>
            ) : (
              recentItems.map((item) => (
                <div
                  key={item.slug}
                  className="flex items-center justify-between gap-3 py-3.5 group hover:bg-white/[0.02] -mx-2 px-2 rounded-xl transition"
                >
                  {/* Left: Thumbnail + Title + Meta */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#18181c] border border-white/[0.08]">
                      {(item.mediaType === "video" ||
                        item.mediaUrl?.endsWith(".mp4") ||
                        item.mediaUrl?.endsWith(".webm")) &&
                      item.mediaUrl ? (
                        <video
                          src={item.mediaUrl}
                          preload="metadata"
                          muted
                          playsInline
                          className="h-full w-full object-cover pointer-events-none"
                        />
                      ) : (
                        <PreviewArt item={item} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/?prompt=${item.slug}`}
                          target="_blank"
                          className="truncate text-[13px] font-semibold text-zinc-200 hover:text-white transition"
                        >
                          {item.title}
                        </Link>
                        {item.pro && (
                          <span className="shrink-0 flex items-center gap-0.5 rounded bg-amber-400/10 px-1.5 py-0.5 text-[9.5px] font-semibold text-amber-400 border border-amber-400/20">
                            PRO
                          </span>
                        )}
                        {item.type === "compare" && (
                          <span className="shrink-0 rounded bg-indigo-500/10 px-1.5 py-0.5 text-[9.5px] font-semibold text-indigo-400 border border-indigo-500/20">
                            A/B
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-500">
                        <span>{item.category}</span>
                        <span>·</span>
                        <span className="tabular-nums">{item.copies || 0} copies</span>
                        {item.sponsors && item.sponsors.length > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-zinc-400">
                              {item.sponsors.length} {item.sponsors.length === 1 ? "sponsor" : "sponsors"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                    <Link
                      href={`/admin/${item.slug}/edit`}
                      className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:bg-white/10 hover:text-white transition"
                      title="Edit component"
                    >
                      <Pencil size={12} />
                    </Link>
                    <Link
                      href={`/?prompt=${item.slug}`}
                      target="_blank"
                      className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:bg-white/10 hover:text-white transition"
                      title="Preview on site"
                    >
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Top Performers + Quick Operations */}
        <div className="flex flex-col gap-6">

          {/* Leaderboard: Most Copied Prompts */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#111115] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame size={15} className="text-amber-400" />
                <h2 className="text-[14px] font-semibold text-white">Top Performing</h2>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">by user copies</span>
            </div>

            <div className="space-y-2">
              {topCopied.length === 0 ? (
                <p className="text-xs text-zinc-600 py-4 text-center">No copy telemetry yet.</p>
              ) : (
                topCopied.map((item, idx) => (
                  <Link
                    key={item.slug}
                    href={`/?prompt=${item.slug}`}
                    target="_blank"
                    className="cursor-pointer group flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.015] p-3 transition hover:border-white/15 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-[10px] font-bold text-zinc-400 group-hover:text-white">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-medium text-zinc-200 group-hover:text-white transition">
                          {item.title}
                        </p>
                        <p className="text-[10.5px] text-zinc-500">{item.category}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-[12px] font-bold text-white tabular-nums">
                        {item.copies || 0}
                      </span>
                      <span className="block text-[9.5px] text-zinc-500">copies</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#111115] p-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-zinc-400 mb-3">
              Quick Operations
            </h2>
            <div className="space-y-1.5">
              <ShortcutItem
                href="/admin/new"
                icon={<Plus size={14} className="text-purple-400" />}
                title="Create Component"
                desc="Add a single prompt or comparison"
              />
              <ShortcutItem
                href="/admin/components"
                icon={<Layers size={14} className="text-blue-400" />}
                title="Manage Components"
                desc="Filter, search, edit, or delete items"
              />
              <ShortcutItem
                href="/admin/media"
                icon={<HardDrive size={14} className="text-emerald-400" />}
                title="Cloud Media Storage"
                desc="Upload and manage video/image previews"
              />
              <ShortcutItem
                href="/admin/inquiries"
                icon={<Mail size={14} className="text-pink-400" />}
                title="Client Inquiries"
                desc={
                  newInquiriesCount > 0
                    ? `${newInquiriesCount} unread client submissions`
                    : "Dedicated leads & CRM inbox"
                }
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// ─── Sub-component: Clean Operation Shortcut ─────────────────────────────────

function ShortcutItem({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="cursor-pointer group flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.015] p-3 transition hover:border-white/15 hover:bg-white/[0.04]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] group-hover:bg-white/[0.08] transition">
          {icon}
        </div>
        <div>
          <p className="text-[12.5px] font-medium text-zinc-200 group-hover:text-white transition">
            {title}
          </p>
          <p className="text-[11px] text-zinc-500">{desc}</p>
        </div>
      </div>
      <ArrowUpRight
        size={14}
        className="text-zinc-600 group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Link>
  );
}
