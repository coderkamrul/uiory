"use client";

import { useEffect, useState, useRef } from "react";
import { supabase, MEDIA_BUCKET, SUPABASE_CONFIGURED, deleteMediaFromStorage } from "@/lib/supabase";
import { listComponents, updateComponent } from "@/lib/db";
import {
  Check,
  Film,
  Image as ImageIcon,
  Loader2,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

export interface MediaFileItem {
  name: string;
  url: string;
  type: "image" | "video";
  size?: number;
  created_at?: string;
}

export default function MediaLibraryModal({
  open,
  onClose,
  onSelect,
  title = "Select Media",
  allowVideo = true,
}: {
  open: boolean;
  onClose: () => void;
  onSelect?: (media: { url: string; type: "image" | "video"; name: string }) => void;
  title?: string;
  allowVideo?: boolean;
}) {
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [items, setItems] = useState<MediaFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video">("all");
  const [selected, setSelected] = useState<MediaFileItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleDelete(item: MediaFileItem) {
    if (!confirm(`Delete "${item.name}" from storage?`)) return;
    setDeleting(true);
    try {
      if (SUPABASE_CONFIGURED) {
        await deleteMediaFromStorage(item.url, item.name);
        try {
          const comps = await listComponents();
          for (const comp of comps) {
            let changed = false;
            const updated = { ...comp };
            if (comp.mediaUrl === item.url || comp.imageUrl === item.url) {
              updated.mediaUrl = undefined;
              updated.imageUrl = undefined;
              changed = true;
            }
            if (comp.variants) {
              const [v0, v1] = comp.variants;
              const newV0 = v0.mediaUrl === item.url ? { ...v0, mediaUrl: undefined } : v0;
              const newV1 = v1.mediaUrl === item.url ? { ...v1, mediaUrl: undefined } : v1;
              if (newV0 !== v0 || newV1 !== v1) {
                updated.variants = [newV0, newV1];
                changed = true;
              }
            }
            if (changed) {
              await updateComponent(comp.slug, updated);
            }
          }
        } catch (dbErr) {
          console.warn("Component cleanup warning:", dbErr);
        }
      }
      setItems((prev) => prev.filter((i) => i.url !== item.url));
      if (selected?.url === item.url) setSelected(null);
    } catch (err) {
      alert(`Failed to delete file from storage: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    if (!open) {
      setSelected(null);
      setSearch("");
      setUploadError("");
      return;
    }
    loadLibrary();
  }, [open]);

  async function loadLibrary() {
    setLoading(true);
    const mediaMap = new Map<string, MediaFileItem>();

    // 1. Fetch from Supabase storage if connected
    if (SUPABASE_CONFIGURED) {
      try {
        const { data, error } = await supabase.storage
          .from(MEDIA_BUCKET)
          .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });

        if (!error && data) {
          for (const obj of data) {
            if (!obj.name || obj.name === ".emptyFolderPlaceholder") continue;
            const { data: pub } = supabase.storage
              .from(MEDIA_BUCKET)
              .getPublicUrl(obj.name);
            const isVid =
              obj.name.endsWith(".mp4") ||
              obj.name.endsWith(".webm") ||
              obj.name.endsWith(".mov") ||
              obj.metadata?.mimetype?.startsWith("video/");

            mediaMap.set(pub.publicUrl, {
              name: obj.name.replace(/^\d+-/, ""),
              url: pub.publicUrl,
              type: isVid ? "video" : "image",
              size: obj.metadata?.size,
              created_at: obj.created_at ?? undefined,
            });
          }
        }
      } catch (err) {
        console.error("Storage list error:", err);
      }
    }

    // 2. Also fetch existing media references from components table
    try {
      const comps = await listComponents();
      for (const comp of comps) {
        const url = comp.mediaUrl || comp.imageUrl;
        if (url && !mediaMap.has(url)) {
          // If this URL is in our Supabase storage bucket, but was not in the storage.list(),
          // it means the file was deleted from storage! Skip it so ghost/broken cards never appear.
          if (url.includes(`/${MEDIA_BUCKET}/`)) {
            continue;
          }
          const isVid =
            comp.mediaType === "video" ||
            url.endsWith(".mp4") ||
            url.endsWith(".webm");
          mediaMap.set(url, {
            name: comp.title,
            url,
            type: isVid ? "video" : "image",
          });
        }
      }
    } catch (err) {
      console.error("Components media error:", err);
    }

    setItems(Array.from(mediaMap.values()));
    setLoading(false);
  }

  async function handleUpload(file: File) {
    setUploadError("");
    const isVid = file.type.startsWith("video/");
    const isImg = file.type.startsWith("image/");
    if (!isVid && !isImg) {
      setUploadError("Only images and videos are supported.");
      return;
    }
    if (!allowVideo && isVid) {
      setUploadError("Please upload an image file (e.g. PNG, JPG, WebP, SVG).");
      return;
    }
    setUploading(true);
    try {
      let finalUrl = "";
      if (SUPABASE_CONFIGURED) {
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `${Date.now()}-${safe}`;
        const { error } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw new Error(error.message);
        const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
        finalUrl = data.publicUrl;
      } else {
        finalUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.onerror = reject;
          r.readAsDataURL(file);
        });
      }

      const newItem: MediaFileItem = {
        name: file.name,
        url: finalUrl,
        type: isVid ? "video" : "image",
        size: file.size,
      };

      setItems((prev) => [newItem, ...prev]);
      setSelected(newItem);
      setTab("library");
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  if (!open) return null;

  const filtered = items.filter((it) => {
    if (!allowVideo && it.type === "video") return false;
    if (typeFilter !== "all" && it.type !== typeFilter) return false;
    if (search.trim()) {
      return it.name.toLowerCase().includes(search.trim().toLowerCase());
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-sm animate-fade-in">
      <div className="flex h-full max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-line bg-[#141416] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-white">{title}</h3>
            {/* Tabs */}
            <div className="flex rounded-lg border border-line bg-white/[0.03] p-0.5">
              <button
                type="button"
                onClick={() => setTab("library")}
                className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold transition ${
                  tab === "library"
                    ? "bg-white text-black"
                    : "text-ink-2 hover:text-white"
                }`}
              >
                Media Library ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setTab("upload")}
                className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold transition ${
                  tab === "upload"
                    ? "bg-white text-black"
                    : "text-ink-2 hover:text-white"
                }`}
              >
                Upload Files
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-ink-3 transition hover:bg-white/[0.08] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab 1: Library */}
        {tab === "library" && (
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Search & filter toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3 bg-[#111113]">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search media by name…"
                  className="h-8 w-full rounded-full border border-line bg-white/[0.04] pl-8 pr-3 text-xs text-white outline-none placeholder:text-ink-3 focus:border-[#3f3f46]"
                />
              </div>

              {allowVideo && (
                <div className="flex items-center gap-1 text-xs text-ink-3">
                  {(["all", "image", "video"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTypeFilter(t)}
                      className={`rounded-full px-2.5 py-1 capitalize transition ${
                        typeFilter === t
                          ? "bg-white/[0.1] font-semibold text-white"
                          : "hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid of media items */}
            <div className="flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="flex h-64 items-center justify-center gap-2 text-sm text-ink-3">
                  <Loader2 size={18} className="animate-spin text-white" /> Loading media library…
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <ImageIcon size={32} className="text-ink-3/40 mb-2" />
                  <p className="text-sm font-medium text-white">No media found</p>
                  <p className="mt-1 text-xs text-ink-3">
                    Switch to &ldquo;Upload Files&rdquo; to add your first image or video.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {filtered.map((item) => {
                    const isSelected = selected?.url === item.url;
                    return (
                      <div
                        key={item.url}
                        onClick={() => setSelected(item)}
                        className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border transition-all ${
                          isSelected
                            ? "border-blue-500 ring-2 ring-blue-500/40 bg-blue-500/10"
                            : "border-line bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                        }`}
                      >
                        {item.type === "video" ? (
                          <div className="flex h-full w-full items-center justify-center bg-black/40">
                            <video
                              src={item.url}
                              preload="metadata"
                              muted
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur">
                              <Film size={12} />
                            </div>
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.url}
                            alt={item.name}
                            onError={() => {
                              setItems((prev) => prev.filter((i) => i.url !== item.url));
                              if (selected?.url === item.url) setSelected(null);
                            }}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        )}

                        {/* Selected badge */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
                            <Check size={13} strokeWidth={3} />
                          </div>
                        )}

                        {/* Filename caption on hover */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="truncate font-medium">{item.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with selection detail */}
            <div className="flex items-center justify-between border-t border-line px-5 py-3.5 bg-[#111113]">
              <div className="min-w-0 flex-1 pr-4">
                {selected ? (
                  <p className="truncate text-xs text-ink-2">
                    Selected: <strong className="text-white">{selected.name}</strong>
                  </p>
                ) : (
                  <p className="text-xs text-ink-3">Click any file to select it.</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selected && (
                  <button
                    type="button"
                    onClick={() => handleDelete(selected)}
                    disabled={deleting}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
                  >
                    <Trash2 size={12} /> {deleting ? "Deleting…" : "Delete"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-ink-2 transition hover:text-white"
                >
                  Cancel
                </button>
                {onSelect ? (
                  <button
                    type="button"
                    disabled={!selected}
                    onClick={() => {
                      if (selected) {
                        onSelect(selected);
                        onClose();
                      }
                    }}
                    className="cursor-pointer rounded-full bg-white px-5 py-1.5 text-xs font-semibold text-black transition hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Select Media
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!selected}
                    onClick={() => {
                      if (selected) {
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          navigator.clipboard.writeText(selected.url);
                        }
                        onClose();
                      }
                    }}
                    className="cursor-pointer rounded-full bg-white px-5 py-1.5 text-xs font-semibold text-black transition hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Use Selected
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Upload Files */}
        {tab === "upload" && (
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            <input
              ref={fileInputRef}
              type="file"
              accept={
                allowVideo
                  ? "image/*,video/mp4,video/webm,video/quicktime"
                  : "image/*"
              }
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = "";
              }}
            />

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleUpload(f);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full max-w-lg cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-white/[0.02] p-12 text-center transition hover:border-[#3f3f46] hover:bg-white/[0.04]"
            >
              {uploading ? (
                <>
                  <Loader2 size={36} className="animate-spin text-white mb-3" />
                  <p className="text-sm font-semibold text-white">Uploading to Supabase…</p>
                  <p className="mt-1 text-xs text-ink-3">Please wait a moment</p>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] text-white mb-4">
                    <UploadCloud size={28} />
                  </div>
                  <p className="text-sm font-bold text-white">
                    Drop files to upload, or <span className="text-blue-400 underline">browse</span>
                  </p>
                  <p className="mt-1.5 text-xs text-ink-3">
                    {allowVideo
                      ? "Supports PNG, JPG, GIF, WebP, SVG, MP4, WebM (up to 50MB)"
                      : "Supports PNG, JPG, GIF, WebP, SVG (up to 20MB)"}
                  </p>
                </>
              )}
            </div>

            {uploadError && (
              <p className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">
                {uploadError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}