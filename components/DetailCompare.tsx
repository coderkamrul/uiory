"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ComparisonMediaProps {
  src: string;
  type: "video" | "image";
  className?: string;
}

const MediaContent = ({ src, type, className }: ComparisonMediaProps) => {
  if (type === "video" || src.endsWith(".mp4")) {
    return (
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }
  return (
    <img
      src={src}
      alt="comparison"
      className={`w-full h-full object-cover ${className}`}
    />
  );
};

interface DetailCompareProps {
  beforeUrl: string;
  beforeType: "video" | "image";
  afterUrl: string;
  afterType: "video" | "image";
}

const springConfig = { stiffness: 300, damping: 30 };

export default function DetailCompare({
  beforeUrl,
  beforeType,
  afterUrl,
  afterType,
}: DetailCompareProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pos = useMotionValue(50);
  const smoothPos = useSpring(pos, springConfig);

  const clipPath = useTransform(smoothPos, (val) => `inset(0 ${100 - val}% 0 0)`);

  const handleMove = (clientX: number) => {
    if (!rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const percentage = ((clientX - rect.left) / rect.width) * 100;
    pos.set(Math.max(0, Math.min(100, percentage)));
  };

  const onMouseDown = () => {
    const moveHandler = (e: MouseEvent) => handleMove(e.clientX);
    const upHandler = () => {
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("mouseup", upHandler);
    };
    window.addEventListener("mousemove", moveHandler);
    window.addEventListener("mouseup", upHandler);
  };

  const onTouchStart = () => {
    const moveHandler = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const upHandler = () => {
      window.removeEventListener("touchmove", moveHandler);
      window.removeEventListener("touchend", upHandler);
    };
    window.addEventListener("touchmove", moveHandler);
    window.addEventListener("touchend", upHandler);
  };

  return (
    <div
      ref={rootRef}
      className="relative w-full aspect-square sm:aspect-video lg:aspect-[4/3] max-h-[78vh] overflow-hidden cursor-col-resize select-none touch-none bg-[#303030] rounded-inherit"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* After Layer (Bottom) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center bg-[#303030]">
        <MediaContent src={afterUrl} type={afterType} className="max-w-full max-h-full" />
      </div>

      {/* Before Layer (Clipped Top) */}
      <motion.div
        className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center bg-[#303030]"
        style={{ clipPath }}
      >
        <MediaContent src={beforeUrl} type={beforeType} className="max-w-full max-h-full" />
      </motion.div>

      {/* Divider */}
      <motion.div
        className="absolute z-20 h-full w-[2px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: useTransform(smoothPos, (v) => `${v}%`) }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-3 bg-zinc-400 rounded-full" />
            <div className="w-0.5 h-3 bg-zinc-400 rounded-full" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
