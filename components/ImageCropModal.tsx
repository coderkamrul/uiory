"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Crop, Move, RefreshCcw, Sparkles, X, ZoomIn, ZoomOut } from "lucide-react";

export type AspectPreset = "16:9" | "4:3" | "1:1" | "original";

interface ImageCropModalProps {
  open: boolean;
  file: File | null;
  onClose: () => void;
  onConfirm: (processedFile: File) => void;
  /** If admin explicitly skips cropping, upload the raw original file */
  onSkip?: () => void;
}

const PRESETS: { id: AspectPreset; label: string; ratio: number | null; desc: string }[] = [
  { id: "16:9", label: "16 : 9", ratio: 16 / 9, desc: "Standard Widescreen" },
  { id: "4:3", label: "4 : 3", ratio: 4 / 3, desc: "Standard UI Card" },
  { id: "1:1", label: "1 : 1", ratio: 1, desc: "Square" },
  { id: "original", label: "Original", ratio: null, desc: "Auto-Optimize Only" },
];

export default function ImageCropModal({
  open,
  file,
  onClose,
  onConfirm,
  onSkip,
}: ImageCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(null);
  const [preset, setPreset] = useState<AspectPreset>("16:9");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Load image when file changes
  useEffect(() => {
    if (!open || !file) {
      setImageSrc(null);
      setImgDims(null);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);

    const img = new Image();
    img.onload = () => {
      setImgDims({ w: img.naturalWidth, h: img.naturalHeight });
      // Smart default: if original is close to 4:3 or 16:9
      const naturalAspect = img.naturalWidth / img.naturalHeight;
      if (Math.abs(naturalAspect - 16 / 9) < 0.2) {
        setPreset("16:9");
      } else if (Math.abs(naturalAspect - 4 / 3) < 0.2) {
        setPreset("4:3");
      } else if (Math.abs(naturalAspect - 1) < 0.15) {
        setPreset("1:1");
      } else {
        setPreset("16:9");
      }
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    img.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [open, file]);

  if (!open || !file || !imageSrc) return null;

  const currentPresetObj = PRESETS.find((p) => p.id === preset) || PRESETS[0];
  const targetRatio =
    currentPresetObj.ratio ?? (imgDims ? imgDims.w / imgDims.h : 16 / 9);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (preset === "original") return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || preset === "original") return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetTransform = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Perform canvas crop & resize to optimized WebP
  async function handleApply() {
    if (!imgDims || !imgRef.current || !containerRef.current) return;
    setProcessing(true);

    try {
      const container = containerRef.current;
      const cRect = container.getBoundingClientRect();

      // Target max output bounds (1600px for crisp retina display)
      const MAX_OUTPUT_W = 1600;
      let outW = MAX_OUTPUT_W;
      let outH = Math.round(outW / targetRatio);

      if (imgDims.w < MAX_OUTPUT_W && preset === "original") {
        outW = imgDims.w;
        outH = imgDims.h;
      }

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d", { alpha: true });

      if (!ctx) throw new Error("Could not create canvas context");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      if (preset === "original") {
        // Draw the full image scaled to max dimensions
        ctx.drawImage(imgRef.current, 0, 0, outW, outH);
      } else {
        // Calculate the slice of source image displayed in container
        // Container represents `outW x outH` aspect.
        // The image is displayed inside the container with size:
        // imgW_disp = (cRect.width or height depending on fit) * zoom
        // Let's compute based on relative scale:
        const imgNaturalW = imgDims.w;
        const imgNaturalH = imgDims.h;

        // Container aspect ratio
        const containerAspect = cRect.width / cRect.height;
        const imgAspect = imgNaturalW / imgNaturalH;

        // In CSS 'object-cover' equivalent base display size before zoom:
        let baseDisplayW: number;
        let baseDisplayH: number;

        if (imgAspect > containerAspect) {
          // Image is wider than container: height fills container
          baseDisplayH = cRect.height;
          baseDisplayW = baseDisplayH * imgAspect;
        } else {
          // Image is taller than container: width fills container
          baseDisplayW = cRect.width;
          baseDisplayH = baseDisplayW / imgAspect;
        }

        const scaledDisplayW = baseDisplayW * zoom;
        const scaledDisplayH = baseDisplayH * zoom;

        // The center of the image relative to container center with pan offset:
        const imgCenterX_inContainer = cRect.width / 2 + pan.x;
        const imgCenterY_inContainer = cRect.height / 2 + pan.y;

        const imgLeft_inContainer = imgCenterX_inContainer - scaledDisplayW / 2;
        const imgTop_inContainer = imgCenterY_inContainer - scaledDisplayH / 2;

        // Map container [0, cRect.width] and [0, cRect.height] to source image coordinates:
        const scaleToSource = imgNaturalW / scaledDisplayW;

        const sx = Math.max(0, (0 - imgLeft_inContainer) * scaleToSource);
        const sy = Math.max(0, (0 - imgTop_inContainer) * scaleToSource);
        const sw = Math.min(imgNaturalW - sx, cRect.width * scaleToSource);
        const sh = Math.min(imgNaturalH - sy, cRect.height * scaleToSource);

        ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, outW, outH);
      }

      // Convert to modern WebP blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/webp", 0.9);
      });

      if (!blob) throw new Error("Failed to process image blob");

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const optimizedFileName = `${baseName}-${preset.replace(":", "x")}.webp`;
      const processedFile = new File([blob], optimizedFileName, {
        type: "image/webp",
      });

      onConfirm(processedFile);
    } catch (err) {
      console.error("Crop error:", err);
      // Fallback: pass raw file
      onConfirm(file);
    } finally {
      setProcessing(false);
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#161619] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Crop size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Crop & Resize Media
              </h3>
              <p className="text-xs text-zinc-400">
                Fit your media to the showcase card & optimize load speed
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-[#121214] px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-400">Aspect Ratio:</span>
            <div className="flex rounded-lg bg-white/5 p-1">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPreset(p.id);
                    resetTransform();
                  }}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                    preset === p.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick info */}
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span>
              Original:{" "}
              <strong className="text-zinc-200">
                {imgDims ? `${imgDims.w} × ${imgDims.h}` : "..."}
              </strong>{" "}
              ({formatFileSize(file.size)})
            </span>
            <span className="hidden sm:inline text-zinc-600">|</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Sparkles size={12} /> Auto-compresses to WebP
            </span>
          </div>
        </div>

        {/* Viewport Stage */}
        <div
          className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#0d0d0f] p-4 select-none min-h-[340px]"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Crop Container with dynamic aspect ratio */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            style={{
              aspectRatio: String(targetRatio),
              maxHeight: "52vh",
              maxWidth: "100%",
            }}
            className={`relative flex items-center justify-center overflow-hidden rounded-xl border-2 border-indigo-500/80 shadow-[0_0_40px_rgba(99,102,241,0.2)] bg-black/60 ${
              preset !== "original" ? "cursor-grab active:cursor-grabbing" : ""
            }`}
          >
            {/* Guide overlay lines */}
            {preset !== "original" && (
              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 z-20">
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-white/15" />
                <div className="border-r border-white/15" />
                <div />
              </div>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop target"
              draggable={false}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transition: isDragging ? "none" : "transform 0.15s ease-out",
                maxHeight: preset === "original" ? "100%" : "none",
                maxWidth: preset === "original" ? "100%" : "none",
              }}
              className={`block select-none pointer-events-none ${
                preset === "original"
                  ? "object-contain"
                  : "w-full h-full object-cover"
              }`}
            />
          </div>

          {preset !== "original" && (
            <div className="absolute bottom-4 left-6 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-[11px] text-zinc-400 backdrop-blur pointer-events-none">
              <Move size={12} /> Drag image to adjust position
            </div>
          )}
        </div>

        {/* Bottom Toolbar & Action Bar */}
        <div className="flex flex-col gap-3 border-t border-white/10 bg-[#161619] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {/* Zoom Controls */}
          {preset !== "original" ? (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(1)))}
                disabled={zoom <= 1}
                className="rounded p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <ZoomOut size={16} />
              </button>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="h-1.5 w-28 cursor-pointer accent-indigo-500 rounded-lg bg-zinc-700"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(1)))}
                disabled={zoom >= 3}
                className="rounded p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <ZoomIn size={16} />
              </button>
              <span className="text-xs font-mono text-zinc-400 w-10">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={resetTransform}
                title="Reset zoom and position"
                className="ml-1 rounded p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-zinc-300"
              >
                <RefreshCcw size={13} />
              </button>
            </div>
          ) : (
            <span className="text-xs text-zinc-500">
              Preserving original aspect ratio & automatically resizing to max 1600px width.
            </span>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5">
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                disabled={processing}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                Upload As-Is
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-400 transition hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={processing}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {processing ? (
                <>Processing…</>
              ) : (
                <>
                  <Check size={14} /> Crop & Upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
