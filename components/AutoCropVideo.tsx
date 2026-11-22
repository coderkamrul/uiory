"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A video that hides black bars baked into the recording itself.
 * For cards (variant="card"): ONLY plays when hovered, stays paused on frame 0 otherwise.
 * For details (variant="detail"): autoplays with ambient backdrop.
 */
export default function AutoCropVideo({
  src,
  variant = "card",
  controls = false,
  isHovered: externalHovered,
  overlay,
}: {
  src: string;
  variant?: "card" | "detail";
  controls?: boolean;
  isHovered?: boolean;
  /** rendered above the video, positioned by the root (detail back button) */
  overlay?: ReactNode;
}) {
  const [crop, setCrop] = useState<{ ar: number; posY: number } | null>(null);
  const [internalHovered, setInternalHovered] = useState(false);
  const isHovered = externalHovered ?? internalHovered;
  const cardVideoRef = useRef<HTMLVideoElement>(null);

  // Strictly enforce hover-to-play for card variant
  useEffect(() => {
    const video = cardVideoRef.current;
    if (!video || variant !== "card") return;
    video.muted = true;
    video.playsInline = true;

    if (isHovered) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isHovered, variant, src, crop]);

  useEffect(() => {
    setCrop(null);
    let cancelled = false;
    const probe = document.createElement("video");
    probe.crossOrigin = "anonymous";
    probe.muted = true;
    probe.playsInline = true;
    probe.preload = "auto";
    probe.addEventListener("loadeddata", () => {
      if (cancelled || !probe.videoWidth || !probe.videoHeight) return;
      try {
        const cw = 144;
        const ch = Math.max(2, Math.round((cw * probe.videoHeight) / probe.videoWidth));
        const canvas = document.createElement("canvas");
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(probe, 0, 0, cw, ch);
        const data = ctx.getImageData(0, 0, cw, ch).data;
        const rowDark = (y: number) => {
          let s = 0;
          let n = 0;
          for (let x = 0; x < cw; x += 2) {
            const i = (y * cw + x) * 4;
            s += data[i] + data[i + 1] + data[i + 2];
            n += 3;
          }
          return s / n < 16;
        };
        let top = 0;
        while (top < ch * 0.42 && rowDark(top)) top++;
        let bottom = 0;
        while (bottom < ch * 0.42 && rowDark(ch - 1 - bottom)) bottom++;
        if (top >= 2 && bottom >= 2 && top + bottom < ch * 0.8) {
          const contentH = ch - top - bottom;
          if (!cancelled) {
            setCrop({ ar: cw / contentH, posY: (top / (top + bottom)) * 100 });
          }
        }
      } catch {
        /* unreadable frame — keep the natural rendering */
      }
    });
    probe.src = src;
    return () => {
      cancelled = true;
      probe.removeAttribute("src");
      probe.load();
    };
  }, [src]);

  // CARD VARIANT (Home / Showcase Page): ONLY plays on hover, strictly paused on frame 0 otherwise
  if (variant === "card") {
    return (
      <div
        className="relative w-full overflow-hidden"
        style={crop ? { aspectRatio: String(crop.ar), backgroundColor: "#000" } : { backgroundColor: "#111113" }}
        onMouseEnter={() => setInternalHovered(true)}
        onMouseLeave={() => setInternalHovered(false)}
      >
        <video
          ref={cardVideoRef}
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          controls={controls}
          onPlay={(e) => {
            if (!isHovered) {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }
          }}
          className={crop ? "absolute inset-0 h-full w-full object-cover" : "block w-full h-auto"}
          style={crop ? { objectPosition: `50% ${crop.posY}%` } : undefined}
        />
        {overlay}
      </div>
    );
  }

  // DETAIL VARIANT (Prompt Detail View Modal): Autoplays with ambient backdrop
  if (crop) {
    return (
      <div
        className="relative w-full overflow-hidden bg-[#18181b] flex items-center justify-center min-h-[380px] sm:min-h-[440px] md:min-h-[480px]"
        style={{ maxHeight: "82vh" }}
      >
        {/* Ambient blurred backdrop */}
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover scale-125 blur-3xl opacity-30 select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/40 pointer-events-none" />
        {/* Crisp foreground video */}
        <div
          className="relative z-10 overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
          style={{ aspectRatio: String(crop.ar), maxHeight: "76vh" }}
        >
          <video
            ref={(el) => { if (el) el.muted = true; }}
            src={src}
            autoPlay
            muted
            loop
            playsInline
            controls={controls}
            className="h-full w-full object-cover"
            style={{ objectPosition: `50% ${crop.posY}%` }}
          />
        </div>
        {overlay}
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden bg-[#18181b] flex items-center justify-center min-h-[380px] sm:min-h-[440px] md:min-h-[480px] max-h-[82vh]">
      {/* Ambient blurred backdrop */}
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover scale-125 blur-3xl opacity-30 select-none"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/40 pointer-events-none" />
      {/* Crisp centered foreground video */}
      <video
        ref={(el) => { if (el) el.muted = true; }}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        controls={controls}
        className="relative z-10 block max-h-[76vh] w-auto max-w-full object-contain mx-auto rounded-xl shadow-2xl ring-1 ring-white/10"
      />
      {overlay}
    </div>
  );
}
