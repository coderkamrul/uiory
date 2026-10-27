import { useRef, useState } from "react";
import { MEDIA_BUCKET, supabase, SUPABASE_CONFIGURED } from "@/lib/supabase";
import { FolderOpen, ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import MediaLibraryModal from "./MediaLibraryModal";

export interface MediaValue {
  url: string;
  type: "image" | "video";
}

const ACCEPT =
  "image/png,image/jpeg,image/gif,image/webp,video/mp4,video/webm,video/quicktime";
const MAX_MB = 50;

/**
 * Preview media uploader: drag & drop or click to browse.
 * Images (JPG/PNG/GIF/WebP) and videos (MP4/WebM/MOV) go to the public
 * Supabase Storage bucket "component-media" (admin-only by RLS) and the
 * form keeps the public URL. In offline local mode, images fall back to
 * an embedded data URL; videos need Supabase.
 */
export default function MediaUpload({
  value,
  onChange,
}: {
  value: MediaValue | null;
  onChange: (v: MediaValue | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);

  async function handleFile(file: File) {
    setError("");
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      return setError("That file is not an image or a video.");
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      return setError(`File is too large — the limit is ${MAX_MB} MB.`);
    }
    setBusy(true);
    try {
      if (SUPABASE_CONFIGURED) {
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `${Date.now()}-${safe}`;
        const { error } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw new Error(error.message);
        const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
        onChange({ url: data.publicUrl, type: isVideo ? "video" : "image" });
      } else if (isImage) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.onerror = reject;
          r.readAsDataURL(file);
        });
        onChange({ url: dataUrl, type: "image" });
      } else {
        throw new Error(
          "Video uploads need Supabase Storage — connect Supabase first (images still work offline)."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full min-w-0 max-w-full">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="w-full min-w-0 max-w-full overflow-hidden">
          <div className="relative aspect-[4/3] w-full max-w-full overflow-hidden rounded-[14px] bg-[#1c1c1f]">
            {value.type === "video" ? (
              <video
                src={value.url}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value.url}
                alt="Preview media"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <span className="absolute left-2.5 top-2.5 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
              {value.type === "video" ? "Video" : "Image / GIF"}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white/[0.04] px-4 py-2 text-[12.5px] font-medium text-ink-2 transition hover:bg-white/[0.08] hover:text-white"
            >
              <RefreshCw size={13} /> Replace
            </button>
            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white/[0.04] px-4 py-2 text-[12.5px] font-medium text-ink-2 transition hover:bg-white/[0.08] hover:text-white"
            >
              <FolderOpen size={13} /> Library
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-500/[0.04] px-4 py-2 text-[12.5px] font-medium text-rose-300 transition hover:bg-rose-500/15"
            >
              <Trash2 size={13} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full min-w-0 max-w-full space-y-2">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setLibraryOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setLibraryOpen(true);
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed px-4 py-9 text-center transition ${
              dragging
                ? "border-[#a78bfa] bg-[#a78bfa]/10"
                : "border-[#3f3f46] bg-white/[0.02] hover:bg-white/[0.04]"
            }`}
          >
            {busy ? (
              <Loader2 size={26} className="animate-spin text-ink-2" />
            ) : (
              <ImagePlus size={26} className="text-ink-2" />
            )}
            <span className="text-sm font-semibold text-white">
              {busy ? "Uploading…" : "Drag & drop your preview"}
            </span>
            <span className="text-[12px] leading-relaxed text-ink-3">
              Image, GIF or video — JPG, PNG, GIF, WebP, MP4, WebM
              <br />
              or <span className="font-semibold text-white underline underline-offset-2">click to browse media library</span> · max {MAX_MB} MB
            </span>
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-[12px] leading-relaxed text-rose-300">{error}</p>}

      <MediaLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        allowVideo={true}
        title="Select Component Media"
        onSelect={(item) => {
          onChange({ url: item.url, type: item.type });
        }}
      />
    </div>
  );
}
