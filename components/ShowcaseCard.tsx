"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ShowcaseItem } from "@/lib/data";
import { hasUserLiked, toggleLike } from "@/lib/db";
import PreviewArt from "./PreviewArt";
import AutoCropVideo from "./AutoCropVideo";
import { Copy, Crown, Heart } from "lucide-react";

/**
 * Card anatomy:
 * border-radius: calc(1rem + 4px) (20px) on the preview container.
 * On hover or when likes > 0, shows heart icon with like count.
 * Logged in users can give hearts directly from the card.
 */
const ASPECT: Record<ShowcaseItem["pattern"], string> = {
  hero: "aspect-[4/3]",
  button: "aspect-[16/10]",
  pricing: "aspect-square",
  nav: "aspect-[16/9]",
  form: "aspect-[4/5]",
  footer: "aspect-[16/9]",
  dashboard: "aspect-[4/3]",
  card: "aspect-square",
};

export default function ShowcaseCard({
  item,
  bare = false,
}: {
  item: ShowcaseItem;
  bare?: boolean;
}) {
  const isCompare = item.type === "compare" && item.variants;
  const mediaSrc = !isCompare ? item.mediaUrl ?? item.imageUrl : undefined;
  const isVideoMedia =
    !!mediaSrc &&
    (item.mediaType === "video" ||
      mediaSrc.endsWith(".mp4") ||
      mediaSrc.endsWith(".webm") ||
      mediaSrc.endsWith(".mov"));

  const [likes, setLikes] = useState(item.copies ?? 0);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    hasUserLiked(item.slug).then(setLiked);
  }, [item.slug]);

  async function handleLikeClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (liking) return;
    setLiking(true);
    try {
      const res = await toggleLike(item.slug);
      setLiked(res.liked);
      setLikes(res.likes);
    } catch (err) {
      if (err instanceof Error && err.message === "LOGIN_REQUIRED") {
        alert("Please log in to like components.");
      }
    } finally {
      setLiking(false);
    }
  }

  const heartButton = (
    <button
      type="button"
      onClick={handleLikeClick}
      aria-label="Like component"
      className="pointer-events-none group-hover:pointer-events-auto cursor-pointer absolute right-3 top-3 z-20 flex items-center gap-2 rounded-full bg-black/65 px-3.5 py-1.5 text-white shadow-2xl backdrop-blur-md ring-1 ring-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 active:scale-95"
      title={liked ? "Unlike" : "Like"}
    >
      <span className="text-[14px] font-bold tracking-tight tabular-nums text-white">
        {likes}
      </span>
      <Heart
        size={18}
        className={`transition-colors duration-150 ${
          liked ? "fill-white text-white" : "text-white"
        }`}
      />
    </button>
  );

  return (
    <Link href={`/?prompt=${item.slug}`} className="group block break-inside-avoid">
      <div className="flex flex-col">
        {mediaSrc ? (
          <div className="relative mb-3 w-full shrink-0 overflow-hidden rounded-[calc(1rem+4px)] bg-[#1c1c1f]">
            {heartButton}
            {isVideoMedia ? (
              <AutoCropVideo src={mediaSrc} variant="card" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaSrc} alt={item.title} className="block h-auto w-full" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-white/0 transition group-hover:bg-white/[0.04]" />
          </div>
        ) : isCompare && item.variants ? (
          <div
            className={`relative mb-3 w-full shrink-0 overflow-hidden rounded-[calc(1rem+4px)] aspect-[4/3] bg-[#1c1c1f]`}
          >
            {heartButton}
            <div className="flex h-full w-full">
              {/* Variant A */}
              <div className="relative h-full w-1/2 overflow-hidden border-r border-black/40 bg-[#161619]">
                {item.variants[0].mediaUrl ? (
                  item.variants[0].mediaType === "video" || item.variants[0].mediaUrl.endsWith(".mp4") ? (
                    <AutoCropVideo src={item.variants[0].mediaUrl} variant="card" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.variants[0].mediaUrl}
                      alt={item.variants[0].tool}
                      className="h-full w-full object-cover"
                    />
                  )
                ) : (
                  <PreviewArt item={{ pattern: item.pattern, hue: item.variants[0].hue }} />
                )}
                <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-[3px] text-[9.5px] font-bold uppercase tracking-wide text-white backdrop-blur">
                  {item.variants[0].tool}
                </span>
              </div>

              {/* Variant B */}
              <div className="relative h-full w-1/2 overflow-hidden bg-[#161619]">
                {item.variants[1].mediaUrl ? (
                  item.variants[1].mediaType === "video" || item.variants[1].mediaUrl.endsWith(".mp4") ? (
                    <AutoCropVideo src={item.variants[1].mediaUrl} variant="card" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.variants[1].mediaUrl}
                      alt={item.variants[1].tool}
                      className="h-full w-full object-cover"
                    />
                  )
                ) : (
                  <PreviewArt item={{ pattern: item.pattern, hue: item.variants[1].hue }} />
                )}
                <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-[3px] text-[9.5px] font-bold uppercase tracking-wide text-white backdrop-blur">
                  {item.variants[1].tool}
                </span>
              </div>
            </div>

            <span className="absolute left-1/2 top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black text-[10px] font-black text-white ring-2 ring-white/80 shadow-xl">
              VS
            </span>
            <div className="pointer-events-none absolute inset-0 bg-white/0 transition group-hover:bg-white/[0.04]" />
          </div>
        ) : (
          <div
            className={`relative mb-3 w-full shrink-0 overflow-hidden rounded-[calc(1rem+4px)] ${
              bare ? "aspect-[4/3]" : ASPECT[item.pattern]
            }`}
          >
            {heartButton}
            <PreviewArt item={item} />
            <div className="pointer-events-none absolute inset-0 bg-white/0 transition group-hover:bg-white/[0.04]" />
          </div>
        )}

        <div className="flex flex-none items-start justify-between gap-3 pb-3 pt-2">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold leading-tight text-[#e5e5e5]">
              {item.title}
            </h3>
            <span className="mt-0.5 block text-xs text-[#a1a1aa]">
              {item.category}
              {isCompare ? ` · ${item.variants![0].tool} vs ${item.variants![1].tool}` : ""}
            </span>
          </div>
          <div className="flex shrink-0 items-start gap-2 pt-0.5">
            {item.pro ? (
              <Crown size={20} className="fill-[#a1a1aa] text-[#a1a1aa]" aria-label="Pro component" />
            ) : (
              <Copy size={20} className="text-[#a1a1aa] transition-colors group-hover:text-[#e5e5e5]" aria-label="Copy prompt" />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
