"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Film,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { supabase, SUPABASE_CONFIGURED } from "@/lib/supabase";
import { listComponents } from "@/lib/db";
import { Component as Loader } from "@/components/ui/ripple-pulse-loader";

interface MediaItem {
  name: string;
  url: string;
  type: "image" | "video";
  size?: number;
  created_at?: string;
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video">("all");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadMedia() {
    setLoading(true);
    const mediaMap = new Map<string, MediaItem>();

    try {
      if (SUPABASE_CONFIGURED) {
        const { data, error } = await supabase.storage
          .from("component-media")
          .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });

        if (!error && data) {
          for (const file of data) {
            if (file.name === ".emptyFolderPlaceholder") continue;
            const { data: pubData } = supabase.storage
              .from("component-media")
              .getPublicUrl(file.name);

            const isVideo =
              file.metadata?.mimetype?.startsWith("video/") ||
              /\.(mp4|webm|mov|mkv)$/i.test(file.name);

            mediaMap.set(pubData.publicUrl, {
              name: file.name,
              url: pubData.publicUrl,
              type: isVideo ? "video" : "image",
              size: file.metadata?.size,
              created_at: file.created_at ?? undefined,
            });
          }
        }
      }
    } catch (e) {
      console.warn("Storage listing error:", e);
    }

    try {
      const components = await listComponents();
      for (const comp of components) {
        if (comp.mediaUrl && !mediaMap.has(comp.mediaUrl)) {
          const isVideo =
            comp.mediaType === "video" || /\.(mp4|webm|mov)$/i.test(comp.mediaUrl);
          const name = comp.mediaUrl.split("/").pop() || comp.title;
          mediaMap.set(comp.mediaUrl, {
            name,
            url: comp.mediaUrl,
            type: isVideo ? "video" : "image",
          });
        }
        if (comp.variants) {
          for (const v of comp.variants) {
            if (v.mediaUrl && !mediaMap.has(v.mediaUrl)) {
              const isVideo =
                v.mediaType === "video" || /\.(mp4|webm|mov)$/i.test(v.mediaUrl);
              const name = v.mediaUrl.split("/").pop() || `${comp.title} - ${v.tool}`;
              mediaMap.set(v.mediaUrl, {
                name,
                url: v.mediaUrl,
                type: isVideo ? "video" : "image",
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn("Components media listing error:", e);
    }

    setItems(Array.from(mediaMap.values()));
    setLoading(false);
  }

  useEffect(() => {
    loadMedia();
  }, []);

  async function handleUpload(file: File) {
    if (!file) return;
    setUploading(true);
    setUploadError("");

    try {
      if (!SUPABASE_CONFIGURED) {
        throw new Error("Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and key.");
      }

      const ext = file.name.split(".").pop() || "bin";
      const cleanBase = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 40);
      const fileName = `${cleanBase}_${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("component-media")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (error) throw error;

      const { data: pubData } = supabase.storage
        .from("component-media")
        .getPublicUrl(fileName);

      const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(fileName);
      const newItem: MediaItem = {
        name: fileName,
        url: pubData.publicUrl,
        type: isVideo ? "video" : "image",
        size: file.size,
        created_at: new Date().toISOString(),
      };

      setItems((prev) => [newItem, ...prev]);
      setSelected(newItem);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm(`Delete "${item.name}" from storage?`)) return;
    try {
      if (SUPABASE_CONFIGURED) {
        await supabase.storage.from("component-media").remove([item.name]);
      }
      setItems((prev) => prev.filter((i) => i.url !== item.url));
      if (selected?.url === item.url) setSelected(null);
    } catch (err) {
      alert("Failed to delete file from storage.");
    }
  }

  function copyUrl(url: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  }

  const filtered = items.filter((i) => {
    const matchesSearch =
      search.trim() === "" || i.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchesType =
      typeFilter === "all" ? true : i.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#1f1f23] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-ink-3 mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-white font-medium">Media Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Media Library
          </h1>
          <p className="mt-1 text-xs text-ink-3">
            Manage screenshots, screen recordings, logos, and preview files.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadMedia}
            disabled={loading}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/[0.08]"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-950/40 transition hover:from-blue-500 hover:to-indigo-500"
          >
            <UploadCloud size={16} /> {uploading ? "Uploading…" : "Upload Files"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) handleUpload(f);
        }}
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#27272a] bg-[#121215] p-6 text-center transition hover:border-[#3f3f46] hover:bg-[#151518]"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 size={32} className="animate-spin text-blue-400" />
            <p className="text-sm font-semibold text-white">Uploading file to Supabase storage…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05] text-white mb-1">
              <UploadCloud size={22} />
            </div>
            <p className="text-sm font-bold text-white">
              Drop new media here, or <span className="text-blue-400 underline">browse files</span>
            </p>
            <p className="text-xs text-ink-3">
              Supports JPG, PNG, WebP, GIF, MP4, WebM (up to 50MB)
            </p>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-300">
          {uploadError}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f1f23] pb-3">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files by name…"
            className="h-9 w-64 rounded-xl border border-[#27272a] bg-[#141417] pl-9 pr-4 text-xs text-white outline-none placeholder:text-ink-3 focus:border-blue-500/50"
          />
        </div>

        <div className="flex items-center rounded-xl border border-[#27272a] bg-[#141417] p-1 text-xs">
          {(
            [
              ["all", "All Media"],
              ["image", "Images"],
              ["video", "Videos"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTypeFilter(val)}
              className={`cursor-pointer rounded-lg px-3 py-1 font-medium transition ${
                typeFilter === val
                  ? "bg-white text-black shadow-sm font-semibold"
                  : "text-ink-3 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid & Preview Sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Media Grid */}
        <div>
          {loading ? (
            <Loader />
          ) : filtered.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-[#222226] bg-[#121215] p-8 text-center">
              <ImageIcon size={32} className="text-ink-3/40 mb-2" />
              <p className="text-sm font-semibold text-white">No media files found</p>
              <p className="mt-1 text-xs text-ink-3">
                Upload images or videos to see them listed here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((item) => {
                const isSel = selected?.url === item.url;
                return (
                  <div
                    key={item.url}
                    onClick={() => setSelected(item)}
                    className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border transition-all ${
                      isSel
                        ? "border-blue-500 ring-2 ring-blue-500/50 shadow-lg"
                        : "border-[#222226] bg-[#141417] hover:border-[#3f3f46]"
                    }`}
                  >
                    {item.type === "video" ? (
                      <div className="relative h-full w-full bg-[#161619] flex items-center justify-center">
                        <video
                          src={item.url}
                          preload="metadata"
                          muted
                          playsInline
                          className="h-full w-full object-cover pointer-events-none"
                        />
                        <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          <Film size={10} /> VIDEO
                        </span>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.name}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    )}

                    {/* Hover Overlay with Name */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-left opacity-0 transition group-hover:opacity-100">
                      <p className="truncate text-[10px] font-medium text-white">{item.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Media Details Rail */}
        <div>
          <div className="lg:sticky lg:top-[90px] rounded-2xl border border-[#222226] bg-[#121215] p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-3">
              Media Details
            </h3>

            {selected ? (
              <div className="space-y-4">
                {/* Preview Frame */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/5 bg-[#18181c] flex items-center justify-center">
                  {selected.type === "video" ? (
                    <video
                      src={selected.url}
                      controls
                      playsInline
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <img
                      src={selected.url}
                      alt={selected.name}
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>

                <div className="space-y-1 text-xs">
                  <p className="truncate font-semibold text-white">{selected.name}</p>
                  <p className="text-ink-3 capitalize">Format: {selected.type}</p>
                  {selected.size && (
                    <p className="text-ink-3">
                      Size: {(selected.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  )}
                  {selected.created_at && (
                    <p className="text-ink-3">
                      Uploaded: {new Date(selected.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* URL Field with Copy Button */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-ink-3">Public URL</label>
                  <div className="flex gap-1.5">
                    <input
                      readOnly
                      value={selected.url}
                      className="h-8 flex-1 rounded-lg border border-[#27272a] bg-[#16161a] px-2 text-[11px] text-ink-2 outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => copyUrl(selected.url)}
                      className="cursor-pointer inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-black hover:bg-white/90"
                    >
                      {copiedUrl ? <Check size={12} /> : <Copy size={12} />}
                      {copiedUrl ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#1f1f23] pt-4">
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink size={12} /> Open original
                  </a>
                  <button
                    onClick={() => handleDelete(selected)}
                    className="cursor-pointer inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-ink-3">
                <FolderOpen size={28} className="mx-auto mb-2 text-ink-3/40" />
                Select any file from the grid to view its metadata, copy its public URL, or delete it.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
