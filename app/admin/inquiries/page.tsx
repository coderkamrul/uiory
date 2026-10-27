"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ContactSubmission,
  listContactSubmissions,
  updateContactSubmissionStatus,
  deleteContactSubmission,
} from "@/lib/contact";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  Inbox,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";

export default function AdminInquiriesPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "read" | "replied">("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [selectedSub, setSelectedSub] = useState<ContactSubmission | null>(null);
  const [notice, setNotice] = useState("");

  async function loadData() {
    const list = await listContactSubmissions();
    setSubmissions(list);
    setLoaded(true);
  }

  useEffect(() => {
    loadData();
  }, []);

  // Compute metrics
  const total = submissions.length;
  const unreadCount = submissions.filter((s) => s.status === "new").length;
  const repliedCount = submissions.filter((s) => s.status === "replied").length;
  const readCount = submissions.filter((s) => s.status === "read").length;

  const uniqueTopics = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => {
      if (s.topic) set.add(s.topic);
    });
    return Array.from(set);
  }, [submissions]);

  // Filtered submissions
  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.topic.toLowerCase().includes(q) ||
        s.message.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ? true : s.status === statusFilter;

      const matchesTopic =
        topicFilter === "all" ? true : s.topic === topicFilter;

      return matchesQuery && matchesStatus && matchesTopic;
    });
  }, [submissions, query, statusFilter, topicFilter]);

  async function handleStatusChange(id: string, newStatus: "new" | "read" | "replied") {
    await updateContactSubmissionStatus(id, newStatus);
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    if (selectedSub?.id === id) {
      setSelectedSub((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    setNotice(`Inquiry status updated to "${newStatus}".`);
    setTimeout(() => setNotice(""), 3000);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    await deleteContactSubmission(id);
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    if (selectedSub?.id === id) setSelectedSub(null);
    setNotice("Inquiry deleted successfully.");
    setTimeout(() => setNotice(""), 3000);
  }

  if (!loaded) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-purple-500" />
          <p className="text-xs text-zinc-500 font-mono">Loading inquiries…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Page Header & Stats ── */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-[#1f1f23] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Client Inquiries
            </h1>
            <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
              {total} Total
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 animate-pulse">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Dedicated CRM inbox for project requests, client leads, and direct submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            title="Refresh Inquiries"
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white transition"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
          <Link
            href="/contact"
            target="_blank"
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-zinc-200"
          >
            <span>Public Form</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {notice && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200 flex items-center justify-between animate-fade-in">
          <span>{notice}</span>
          <button
            onClick={() => setNotice("")}
            className="text-emerald-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Metric Highlights ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[#111115] p-5 space-y-1">
          <span className="text-[11px] font-mono font-semibold uppercase text-zinc-500 tracking-wider">
            All Inquiries
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{total}</p>
          <span className="text-[11px] text-zinc-400">From website contact</span>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#111115] p-5 space-y-1">
          <span className="text-[11px] font-mono font-semibold uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Unread Leads
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{unreadCount}</p>
          <span className="text-[11px] text-zinc-400">Requires follow-up</span>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#111115] p-5 space-y-1">
          <span className="text-[11px] font-mono font-semibold uppercase text-sky-400 tracking-wider">
            Replied / Closed
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-sky-400">{repliedCount}</p>
          <span className="text-[11px] text-zinc-400">Response delivered</span>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#111115] p-5 space-y-1">
          <span className="text-[11px] font-mono font-semibold uppercase text-purple-400 tracking-wider">
            Reviewed
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{readCount}</p>
          <span className="text-[11px] text-zinc-400">Marked as seen</span>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, topic…"
              className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#111116] pl-9 pr-4 text-xs text-white outline-none placeholder:text-zinc-500 transition focus:border-purple-500/50"
            />
          </div>

          {/* Topic selector */}
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="h-10 rounded-xl border border-white/[0.08] bg-[#111116] px-3 text-xs text-white outline-none cursor-pointer focus:border-purple-500/50"
          >
            <option value="all">All Topics ({submissions.length})</option>
            {uniqueTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* Status Tab Pills */}
        <div className="flex items-center gap-1 rounded-xl bg-white/[0.03] p-1 border border-white/[0.06] self-start md:self-auto">
          {(["all", "new", "read", "replied"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                statusFilter === filter
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {filter === "all" ? `All (${total})` : filter}
            </button>
          ))}
        </div>
      </div>

      {/* ── Inquiries Professional Table ── */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#111115] overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] text-zinc-500">
              <Inbox size={26} />
            </div>
            <p className="text-base font-semibold text-zinc-300">No inquiries found</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {query || statusFilter !== "all" || topicFilter !== "all"
                ? "Try adjusting your search query or status filters."
                : "Client submissions through the /contact page will appear here instantly."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.015] text-[10.5px] font-mono uppercase tracking-wider text-zinc-400">
                  <th className="py-3.5 pl-6 pr-3">Sender</th>
                  <th className="py-3.5 px-3">Service / Topic</th>
                  <th className="py-3.5 px-3">Message Excerpt</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((sub) => {
                  const isSelected = selectedSub?.id === sub.id;
                  const dateStr = new Date(sub.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className={`cursor-pointer transition hover:bg-white/[0.03] ${
                        isSelected
                          ? "bg-purple-500/[0.06]"
                          : sub.status === "new"
                          ? "bg-emerald-500/[0.02]"
                          : ""
                      }`}
                    >
                      {/* Sender */}
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.08] font-bold text-white text-xs">
                            {sub.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate max-w-[140px] sm:max-w-[180px]">
                              {sub.name}
                            </p>
                            <p className="text-[11px] text-zinc-400 truncate max-w-[140px] sm:max-w-[180px]">
                              {sub.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Topic */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex rounded-lg bg-white/[0.04] border border-white/[0.07] px-2.5 py-1 text-[11px] font-mono text-purple-300">
                          {sub.topic}
                        </span>
                      </td>

                      {/* Message Preview */}
                      <td className="py-3.5 px-3 max-w-[260px] truncate text-zinc-400">
                        {sub.message}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold border ${
                            sub.status === "new"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : sub.status === "replied"
                              ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
                              : "border-white/10 bg-white/[0.04] text-zinc-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              sub.status === "new"
                                ? "bg-emerald-400 animate-pulse"
                                : sub.status === "replied"
                                ? "bg-sky-400"
                                : "bg-zinc-500"
                            }`}
                          />
                          <span className="capitalize">{sub.status}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedSub(sub)}
                            title="Inspect details"
                            className="cursor-pointer rounded-lg border border-white/5 bg-white/[0.03] p-1.5 text-zinc-400 hover:border-white/15 hover:text-white transition"
                          >
                            <Eye size={13} />
                          </button>

                          <a
                              href={`mailto:${sub.email}?subject=Re: uiory Inquiry - ${encodeURIComponent(
                              sub.topic
                            )}`}
                            title="Reply via Email"
                            className="cursor-pointer rounded-lg border border-white/5 bg-white/[0.03] p-1.5 text-zinc-400 hover:border-white/15 hover:text-white transition"
                          >
                            <Mail size={13} />
                          </a>

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                sub.id,
                                sub.status === "replied" ? "read" : "replied"
                              )
                            }
                            title={sub.status === "replied" ? "Mark as Read" : "Mark as Replied"}
                            className="cursor-pointer rounded-lg border border-white/5 bg-white/[0.03] p-1.5 text-zinc-400 hover:border-white/15 hover:text-white transition"
                          >
                            <Check size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(sub.id)}
                            title="Delete"
                            className="cursor-pointer rounded-lg border border-white/5 bg-white/[0.03] p-1.5 text-zinc-500 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Slide-Over / Modal Detail Drawer ── */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-[#121217] p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-white font-bold text-lg">
                  {selectedSub.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedSub.name}
                  </h3>
                  <a
                    href={`mailto:${selectedSub.email}`}
                    className="text-xs text-purple-300 hover:underline flex items-center gap-1"
                  >
                    {selectedSub.email}
                    <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="cursor-pointer rounded-xl border border-white/10 bg-white/[0.05] p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Meta Tags Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 space-y-1">
                <span className="text-[10.5px] font-mono text-zinc-500 uppercase tracking-wider">
                  Service / Topic
                </span>
                <p className="text-xs font-semibold text-white truncate">
                  {selectedSub.topic}
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 space-y-1">
                <span className="text-[10.5px] font-mono text-zinc-500 uppercase tracking-wider">
                  Submitted At
                </span>
                <p className="text-xs font-mono text-zinc-300">
                  {new Date(selectedSub.created_at).toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10.5px] font-mono text-zinc-500 uppercase tracking-wider">
                  Current Status
                </span>
                <div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold border ${
                      selectedSub.status === "new"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : selectedSub.status === "replied"
                        ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
                        : "border-white/10 bg-white/[0.04] text-zinc-400"
                    }`}
                  >
                    <span className="capitalize">{selectedSub.status}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-semibold uppercase text-zinc-400 tracking-wider">
                Full Inquiry Message
              </label>
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0f] p-5 text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap font-sans">
                {selectedSub.message}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
              {/* Status toggles */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Mark as:</span>
                {(["new", "read", "replied"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(selectedSub.id, st)}
                    className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium capitalize border transition ${
                      selectedSub.status === st
                        ? "border-purple-500 bg-purple-500/20 text-white"
                        : "border-white/5 bg-white/[0.03] text-zinc-400 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Direct Reply & Delete */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedSub.id)}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>

                <a
                  href={`mailto:${selectedSub.email}?subject=Re: uiory Inquiry - ${encodeURIComponent(
                    selectedSub.topic
                  )}`}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-900/30 hover:opacity-95 transition"
                >
                  <Mail size={13} />
                  <span>Reply via Email</span>
                  <ArrowUpRight size={12} />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
