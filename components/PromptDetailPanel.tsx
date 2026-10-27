"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { type ShowcaseItem, type Sponsor } from "@/lib/data";
import { getComponent, hasUserLiked, listComponents, toggleLike } from "@/lib/db";
import PreviewArt from "./PreviewArt";
import AutoCropVideo from "./AutoCropVideo";
import CopyButton from "./CopyButton";
import ShowcaseCard from "./ShowcaseCard";
import DetailCompare from "./DetailCompare";
import { ArrowLeft, ArrowUpRight, Check, Copy, Globe, Heart, Lock } from "lucide-react";
import { Component } from "@/components/ui/ripple-pulse-loader";

/**
 * The ?prompt=[slug] view, rebuilt to the latest reference markup:
 * a fixed full-screen overlay (bg #0a0a0a, fade-in 0.18s) over the
 * homepage. The detail card floats at the top-left, its width fitting the media + sidebar —
 * rounded-[24px] card, preview at natural aspect (max-h 78vh,
 * object-contain), 240px sidebar with title, likes, a rounded-xl
 * Copy full prompt button and builder rows. The remaining cards keep
 * flowing in 4 columns behind/below it — the right column fills
 * first — with the first three columns reserving the detail block's
 * height. Fixed circular back button. Nothing else is printed on
 * the page: prompt and code travel only through the copy buttons,
 * and the preview renders at the media's own size (never stretched
 * wider than the media itself).
 */
export default function PromptDetailPanel({ slug }: { slug: string }) {
  const router = useRouter();
  const [item, setItem] = useState<ShowcaseItem | null | undefined>(undefined);
  const [others, setOthers] = useState<ShowcaseItem[]>([]);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);
  const [leftH, setLeftH] = useState(455);
  const stage = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  /* grid shape like the reference: 4 columns on lg, 5 columns on xl —
     the active card always spans the first 3, related cards take the
     remaining column(s) beside it and the rows below */
  const [colCount, setColCount] = useState(4);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const apply = () => setColCount(mq.matches ? 5 : 4);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    setActive(0);
    getComponent(slug).then((res) => {
      setItem(res);
      if (res) {
        setLikeCount(res.copies ?? 0);
        hasUserLiked(res.slug).then(setLiked);
      }
    });
    listComponents().then((rows) =>
      setOthers(rows.filter((i) => i.slug !== slug))
    );
  }, [slug]);

  /* the overlay owns the scroll while it is open */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* keep the column spacers matched to the detail block's height */
  useLayoutEffect(() => {
    const el = leftRef.current;
    if (!el) return;
    const measure = () => setLeftH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [item, active]);

  useLayoutEffect(() => {
    if (!stage.current || !item || item.type !== "compare") return;
    gsap.fromTo(
      stage.current,
      { opacity: 0.35, scale: 0.99 },
      { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" }
    );
  }, [active, item]);

  async function copyPrompt() {
    if (!item) return;
    try {
      await navigator.clipboard.writeText(item.prompt);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = item.prompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function handleLike() {
    if (!item || liking) return;
    setLiking(true);
    try {
      const res = await toggleLike(item.slug);
      setLiked(res.liked);
      setLikeCount(res.likes);
      setItem((prev) => (prev ? { ...prev, copies: res.likes } : prev));
    } catch (err: any) {
      if (
        err?.message === "LOGIN_REQUIRED" ||
        err?.message?.includes("Not authenticated")
      ) {
        router.push(
          `/login?next=${encodeURIComponent(`/?prompt=${item.slug}`)}`
        );
      }
    } finally {
      setLiking(false);
    }
  }

  const backBtn = (
    <button
      onClick={handleBack}
      aria-label="Back"
      className="fixed left-[22px] top-[112px] z-50 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-[#1c1c1f] text-[#e5e5e5] transition-colors hover:bg-[#26262a] cursor-pointer sm:left-8"
    >
      <ArrowLeft size={20} />
    </button>
  );

  /* same button, but overlapping the preview's top-left corner */
  const backBtnOverlay = (
    <button
      onClick={handleBack}
      aria-label="Back"
      className="absolute left-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-[#1c1c1f]/90 text-[#e5e5e5] shadow-lg backdrop-blur transition-colors hover:bg-[#26262a] cursor-pointer"
    >
      <ArrowLeft size={20} />
    </button>
  );

  if (item === undefined || item === null) {
    return (
      <div className="animate-fade-in fixed inset-0 z-40 bg-[#0a0a0a] flex items-center justify-center">
        {backBtn}
        <Component />
      </div>
    );
  }

  const isCompare = item.type === "compare" && item.variants;
  const variant = isCompare ? item.variants![active] : null;
  /* Pro = view-only on the detail page: both copy buttons show a
     lock icon (same labels) and stay disabled, for every viewer */
  const locked = !!item.pro;
  const sponsorsList: Sponsor[] = item.sponsors ?? [];

  /* remaining cards distributed across the grid columns — the
     columns BESIDE the detail card (the last two on xl, the last
     one on lg) fill first, then the columns below it */
  const cols: ShowcaseItem[][] = Array.from({ length: colCount }, () => []);
  const fillOrder = colCount === 5 ? [3, 4, 0, 1, 2] : [3, 0, 1, 2];
  others.forEach((it, idx) => cols[fillOrder[idx % colCount]].push(it));

  return (
    <div className="animate-fade-in fixed inset-0 z-40 overflow-y-auto bg-[#0a0a0a]">
      <div className="mx-auto w-full max-w-[1920px] px-4 pb-16 pt-[120px] sm:px-6">
        <div className="relative">
          {/* detail block: in flow on small screens, floating at
              top-left on lg, fixed width spanning 3 columns on big screens */}
          <div
            ref={leftRef}
            className="detail-card-fixed-width z-10 w-full lg:absolute lg:left-0 lg:top-0"
          >
            <div className="flex flex-col overflow-hidden rounded-[24px] bg-[#292929] md:flex-row md:items-stretch">
              {/* preview: bounded max-height, object-contain with ambient blurred backdrop */}
              <div className="w-full md:flex-1 md:min-w-0">
                <div className="relative w-full overflow-hidden bg-[#18181b] flex items-center justify-center min-h-[380px] sm:min-h-[440px] md:min-h-[480px] md:h-full">
                  {backBtnOverlay}

                  {isCompare && item.variants && item.variants.length >= 2 ? (
                    <div className="relative w-full h-full min-h-[400px] sm:min-h-[440px] md:min-h-[480px] flex items-center justify-center overflow-hidden">
                      {/* Ambient blurred backdrop — left half uses before image, right half uses after image */}
                      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none flex">
                        {/* Before (left half) */}
                        {item.variants[0]?.mediaUrl && (item.variants[0]?.mediaType === "video" || item.variants[0]?.mediaUrl.endsWith(".mp4")) ? (
                          <video
                            src={item.variants[0].mediaUrl}
                            autoPlay muted loop playsInline aria-hidden="true"
                            className="absolute inset-0 h-full w-full object-cover scale-125 blur-3xl opacity-30"
                          />
                        ) : item.variants[0]?.mediaUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.variants[0].mediaUrl}
                            alt="" aria-hidden="true"
                            className="absolute inset-0 h-full w-full object-cover scale-125 blur-3xl opacity-30"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/40" />
                      </div>
                      {/* Foreground compare slider */}
                      <div className="relative z-10 w-full h-full min-h-[400px] sm:min-h-[440px] md:min-h-[480px] flex items-center justify-center">
                        <DetailCompare
                          beforeUrl={variant?.mediaUrl || ""}
                          beforeType={variant?.mediaType || "image"}
                          afterUrl={item.variants[1]?.mediaUrl || ""}
                          afterType={item.variants[1]?.mediaType || "image"}
                        />
                      </div>
                    </div>
                  ) : !isCompare && (item.mediaUrl ?? item.imageUrl) ? (
                    (item.mediaType === "video" && item.mediaUrl) || (!item.mediaUrl && item.imageUrl?.endsWith(".mp4")) ? (
                      <AutoCropVideo
                        src={(item.mediaUrl ?? item.imageUrl)!}
                        variant="detail"
                        controls={false}
                      />
                    ) : (
                      <div className="relative flex h-full max-h-[78vh] w-full min-h-[380px] sm:min-h-[440px] md:min-h-[480px] items-center justify-center overflow-hidden">
                        {/* Ambient blurred backdrop that dynamically fits any aspect ratio */}
                        <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.mediaUrl ?? item.imageUrl}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 h-full w-full object-cover scale-125 blur-3xl opacity-35 transition-opacity duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/40" />
                        </div>

                        {/* Crisp centered foreground media */}
                        <div className="relative z-10 flex h-full max-h-[78vh] w-full items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.mediaUrl ?? item.imageUrl}
                            alt={item.title}
                            className="block h-auto max-h-[78vh] w-auto max-w-full object-contain"
                          />
                        </div>
                      </div>
                    )
                  ) : (
                    <div ref={stage} className="relative aspect-[4/3] w-full max-h-[78vh]">
                      <PreviewArt
                        item={
                          variant
                            ? { ...item, hue: variant.hue, imageUrl: undefined, mediaUrl: undefined }
                            : item
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 240px sidebar matching competitor layout */}
              <aside className="flex flex-col gap-5 p-6 md:w-[240px] md:shrink-0 md:border-l md:border-line md:self-stretch">
                <div className="min-w-0 pr-8">
                  <h3 className="text-xl font-bold leading-tight text-[#e5e5e5]">
                    {item.title}
                  </h3>
                  <span className="text-sm text-[#a1a1aa]">
                    {item.category}
                    {isCompare ? " · Comparison" : ""}
                  </span>
                </div>

                {/* Like button right after category, on top of copy/unlock buttons */}
                <button
                  type="button"
                  onClick={handleLike}
                  disabled={liking}
                  aria-label="Like"
                  className="self-start flex cursor-pointer items-center gap-1.5 text-sm text-[#a1a1aa] hover:text-[#e5e5e5] transition-colors disabled:opacity-50"
                  title={liked ? "Unlike" : "Like"}
                >
                  <Heart
                    size={16}
                    className={`transition-colors ${liked ? "fill-rose-400 text-rose-400" : "text-[#a1a1aa]"
                      }`}
                  />
                  <span className="tabular-nums font-medium">{likeCount}</span>
                  <span>{likeCount === 1 ? "like" : "likes"}</span>
                </button>

                <div className="flex flex-col gap-2">
                  {locked ? (
                    <>
                      <button
                        disabled
                        title="Pro component — copying is locked for members"
                        className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-4 py-3 text-sm font-semibold text-[#a1a1aa] ring-1 ring-line"
                      >
                        <Lock size={16} />
                        Copy full prompt
                      </button>
                      <button
                        disabled
                        title="Pro component — copying is locked for members"
                        className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2.5 text-[13px] font-medium text-[#a1a1aa] ring-1 ring-line"
                      >
                        <Lock size={14} />
                        Copy code
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={copyPrompt}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#e5e5e5] px-4 py-3 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? "Copied!" : "Copy full prompt"}
                      </button>
                      {item.code ? (
                        <CopyButton
                          text={item.code}
                          label="Copy code"
                          className="w-full rounded-xl !bg-white/[0.06] px-4 py-2.5 text-[13px] font-medium !text-[#a1a1aa] ring-1 ring-line shadow-none cursor-pointer"
                        />
                      ) : null}
                    </>
                  )}
                </div>

                {null}

                {/* Sponsored section:
                    - No sponsors: subtle empty-state pill
                    - Mobile (< md): Full items with title, logo, and tagline (matching big screen)
                    - Laptop (md to xl): Social proof avatar widget with hover bring-up & tooltip
                    - Big Screen (xl+): Full clean vertical list with title, logo, and tagline */}
                <div className="mt-2">
                  {sponsorsList.length === 0 ? (
                    <div className="flex items-center gap-2 rounded-xl border border-dashed border-white/[0.07] px-3 py-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                      <span className="text-[11px] text-zinc-600">No sponsors for this component</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5 mt-2">
                      <span className="text-[11px] font-normal text-[#71717a]">
                        Sponsored
                      </span>

                      {/* 1. Mobile (< md): Full items with title, logo, and tagline (like big screen) */}
                      <div className="flex flex-col gap-3 md:hidden">
                        {sponsorsList.map((sp, idx) => (
                          <a
                            key={idx}
                            href={sp.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 cursor-pointer group rounded-xl p-2 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-colors"
                            aria-label={sp.name}
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/10 bg-[#18181c]">
                              {sp.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  alt={sp.name}
                                  className="h-5 w-5 object-contain"
                                  src={sp.logoUrl}
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white">
                                  {sp.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col">
                              <div className="flex items-center gap-1">
                                <span className="truncate text-[13px] font-bold text-[#e5e5e5] group-hover:text-white leading-snug">
                                  {sp.name}
                                </span>
                                <ArrowUpRight
                                  size={12}
                                  className="shrink-0 text-[#a1a1aa] group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                />
                              </div>
                              <span className="truncate text-[11px] font-normal text-[#a1a1aa] leading-snug">
                                {sp.tagline}
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>

                      {/* 2. Laptop (md to xl): Social proof overlapping avatar stack with hover bring-up & tooltip */}
                      <div className="hidden md:flex items-center -space-x-2.5 overflow-visible py-1.5 xl:hidden">
                        {sponsorsList.map((sp, idx) => (
                          <a
                            key={idx}
                            href={sp.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={sp.name}
                            className="group relative cursor-pointer transition-transform duration-200 hover:z-30 hover:-translate-y-1"
                          >
                            {/* Avatar circle */}
                            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-[#18181c] bg-[#222226] shadow-md transition-shadow group-hover:border-white/40 group-hover:shadow-xl">
                              {sp.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  alt={sp.name}
                                  className="h-6 w-6 object-contain"
                                  src={sp.logoUrl}
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-white/10 text-xs font-bold text-white">
                                  {sp.name.charAt(0)}
                                </div>
                              )}
                            </div>

                            {/* Hover Tooltip / Popover bringing up what was hovered without shifting layout */}
                            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 whitespace-nowrap">
                              <div className="rounded-xl border border-white/10 bg-[#16161a]/95 px-3 py-1.5 shadow-2xl backdrop-blur-md text-left ring-1 ring-white/10">
                                <p className="flex items-center gap-1 text-xs font-bold text-white">
                                  {sp.name} <ArrowUpRight size={11} className="text-[#a1a1aa]" />
                                </p>
                                <p className="text-[10px] text-[#a1a1aa] font-normal">
                                  {sp.tagline}
                                </p>
                              </div>
                              <div className="h-1.5 w-1.5 -translate-y-1 rotate-45 border-b border-r border-white/10 bg-[#16161a]" />
                            </div>
                          </a>
                        ))}
                      </div>

                      {/* 3. Big Screen Desktop (xl+): Full vertical list */}
                      <div className="hidden xl:flex flex-col gap-3.5">
                        {sponsorsList.map((sp, idx) => (
                          <a
                            key={idx}
                            href={sp.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 cursor-pointer group rounded-xl p-1.5 -mx-1.5 hover:bg-white/[0.04] transition-colors"
                            aria-label={sp.name}
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/10 bg-[#18181c]">
                              {sp.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  alt={sp.name}
                                  className="h-5 w-5 object-contain"
                                  src={sp.logoUrl}
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white">
                                  {sp.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col">
                              <div className="flex items-center gap-1">
                                <span className="truncate text-[13px] font-bold text-[#e5e5e5] group-hover:text-white leading-snug">
                                  {sp.name}
                                </span>
                                <ArrowUpRight
                                  size={12}
                                  className="shrink-0 text-[#a1a1aa] group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                />
                              </div>
                              <span className="truncate text-[11px] font-normal text-[#a1a1aa] leading-snug">
                                {sp.tagline}
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>

          {/* the rest of the grid keeps flowing behind/below the
              detail block; the first three columns reserve its height */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-0 lg:grid-cols-4 xl:grid-cols-5">
            {cols.map((col, ci) => (
              <div key={ci} className="flex min-w-0 flex-col gap-3">
                {ci < 3 && (
                  <div
                    aria-hidden
                    className="hidden shrink-0 lg:block"
                    style={{ height: leftH }}
                  />
                )}
                {col.map((it) => (
                  <ShowcaseCard key={it.slug} item={it} bare />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}