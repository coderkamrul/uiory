"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * A video that hides black bars baked into the recording itself.
 *
 * Screen recordings often come out as a landscape page centred in a
 * portrait file (black bars top and bottom — the bars are part of the
 * file, so no CSS aspect trick on the raw frame can remove them).
 * On load, a hidden probe copy of the video draws a frame to a
 * canvas and scans for black bar rows; if BOTH a top and a bottom
 * bar are found, the visible video is reframed at the CONTENT's
 * aspect ratio with object-fit: cover, so only the real content
 * shows — on cards and on the detail page. Videos without bars keep
 * their natural aspect, untouched. If the frame cannot be read
 * (CORS), the natural rendering stays.
 */
export default function AutoCropVideo({
  src,
  variant = "card",
  controls = false,
  overlay,
}: {
  src: string;
  variant?: "card" | "detail";
  controls?: boolean;
  /** rendered above the video, positioned by the root (detail back button) */
  overlay?: ReactNode;
}) {
  const [crop, setCrop] = useState<{ ar: number; posY: number } | null>(null);

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

  if (crop) {
    return (
      <div
        className={`relative w-full overflow-hidden bg-[#111113] ${
          variant === "detail" ? "max-h-[82vh] flex items-center justify-center" : "bg-black"
        }`}
        style={{
          aspectRatio: String(crop.ar),
          maxHeight: variant === "detail" ? "82vh" : undefined,
        }}
      >
        <video
          ref={(el) => {
            if (el) el.muted = true;
          }}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          controls={controls}
          className={`absolute inset-0 h-full w-full ${
            variant === "detail" ? "object-contain" : "object-cover"
          }`}
          style={{ objectPosition: `50% ${crop.posY}%` }}
        />
        {overlay}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#111113] ${
        variant === "detail" ? "max-h-[82vh] flex items-center justify-center" : ""
      }`}
    >
      <video
        ref={(el) => {
          if (el) el.muted = true;
        }}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        controls={controls}
        className={`block w-full ${
          variant === "detail"
            ? "max-h-[82vh] w-auto max-w-full object-contain mx-auto"
            : "h-auto"
        }`}
      />
      {overlay}
    </div>
  );
}
