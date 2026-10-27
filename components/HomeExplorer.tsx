"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { type ShowcaseItem } from "@/lib/data";
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { listCategories, listComponents } from "@/lib/db";
import ShowcaseCard from "./ShowcaseCard";
import { Component as RippleLoader } from "@/components/ui/ripple-pulse-loader";

type Sort = "featured" | "popular" | "recent";
type TypeFilter = "all" | "single" | "compare";
type PricingFilter = "all" | "free" | "pro";

const SORTS: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "popular", label: "Popular" },
  { id: "recent", label: "Recent" },
];

/* pill treatment from the provided code: inside a p-1 bordered strip;
   active pill = #202020 fill, top border #3b3b3b, other sides #2a2a2a */
const pillBase =
  "cursor-pointer relative shrink-0 whitespace-nowrap rounded-full px-5 py-1.5 text-sm font-medium transition-colors";
const pillOnStyle = {
  backgroundColor: "rgb(32, 32, 32)",
  color: "rgb(255, 255, 255)",
  borderWidth: 1,
  borderStyle: "solid" as const,
  borderColor: "rgb(59, 59, 59) rgb(42, 42, 42) rgb(42, 42, 42)",
};
const pillOffStyle = { backgroundColor: "transparent", color: "rgba(255, 255, 255, 0.72)" };
const stripCls =
  "inline-flex items-center rounded-full border border-white/10 p-1";

export default function HomeExplorer({
  initialType = "all",
}: {
  initialType?: TypeFilter;
}) {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [cat, setCat] = useState<string>("All");
  const [type, setType] = useState<TypeFilter>(initialType);
  const [sort, setSort] = useState<Sort>("featured");
  const [query, setQuery] = useState("");
  const [pricing, setPricing] = useState<PricingFilter>("all");
  const [pricingOpen, setPricingOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const catStripRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [catList, setCatList] = useState<string[]>([]);
  const [masonryCols, setMasonryCols] = useState(5);

  useEffect(() => {
    function updateCols() {
      const w = window.innerWidth;
      if (w >= 1536) setMasonryCols(5);
      else if (w >= 1280) setMasonryCols(4);
      else if (w >= 1024) setMasonryCols(3);
      else if (w >= 640) setMasonryCols(2);
      else setMasonryCols(1);
    }
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  const checkScroll = useCallback(() => {
    const el = catStripRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
  }, []);

  useEffect(() => {
    listComponents().then((rows) => {
      setItems(rows);
      setLoaded(true);
    });
    listCategories().then(setCatList);
  }, []);

  /* filter pills: "All" + every stored category + any category a
     component actually uses (so a brand-new category always appears) */
  const pillCats = useMemo(() => {
    const base = catList.filter((c) => c !== "All");
    const used = items.map((i) => i.category).filter((c) => c && !base.includes(c));
    return ["All", ...base, ...new Set(used)];
  }, [catList, items]);

  useEffect(() => {
    const el = catStripRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [pillCats, checkScroll]);

  const shown = useMemo(() => {
    let list = items.filter(
      (i) =>
        (cat === "All" || i.category === cat) &&
        (type === "all" || i.type === type) &&
        (pricing === "all" || (pricing === "pro" ? !!i.pro : !i.pro)) &&
        (query.trim() === "" ||
          `${i.title} ${i.category} ${i.tags.join(" ")} ${i.tech.join(" ")}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()))
    );
    list = [...list].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      if (sort === "popular") {
        return (b.copies ?? 0) - (a.copies ?? 0) || timeB - timeA;
      }
      if (sort === "recent") {
        return timeB - timeA;
      }
      return (
        Number(b.pro ?? false) - Number(a.pro ?? false) ||
        (b.copies ?? 0) - (a.copies ?? 0) ||
        timeB - timeA
      );
    });
    return list;
  }, [items, cat, type, pricing, sort, query]);

  /* Distribute items round-robin across vertical columns so that
     item 1 is col 1 row 1, item 2 is col 2 row 1, item 3 is col 3 row 1, etc.
     This maintains the Pinterest column masonry while ensuring the first row
     displays the top sorted items from left to right! */
  const columnsData = useMemo(() => {
    const cols: ShowcaseItem[][] = Array.from({ length: masonryCols }, () => []);
    shown.forEach((item, index) => {
      cols[index % masonryCols].push(item);
    });
    return cols;
  }, [shown, masonryCols]);

  useEffect(() => {
    if (!gridRef.current || !shown.length) return;
    gsap.fromTo(
      gridRef.current.children,
      { y: 22, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: "power2.out", stagger: 0.04, overwrite: true }
    );
  }, [shown]);

  const maskStyle = useMemo(() => {
    if (canScrollLeft && canScrollRight) {
      return "linear-gradient(to right, transparent 0px, black 36px, black calc(100% - 36px), transparent 100%)";
    }
    if (canScrollLeft) {
      return "linear-gradient(to right, transparent 0px, black 36px, black 100%)";
    }
    if (canScrollRight) {
      return "linear-gradient(to right, black 0px, black calc(100% - 36px), transparent 100%)";
    }
    return undefined;
  }, [canScrollLeft, canScrollRight]);

  return (
    <div>
      {/* filter bar: responsive for mobile and desktop —
          desktop: single aligned row
          mobile: sort & search/pricing row + full-width scrollable category strip */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
        {/* Top row on mobile, or inline controls on desktop */}
        <div className="flex w-full items-center justify-between gap-1.5 md:contents">
          {searchOpen ? (
            /* Full-width smooth search bar on mobile when search is open */
            <div className="flex h-[38px] w-full items-center gap-2 rounded-full border border-white/10 bg-[#151517] px-3.5 md:hidden">
              <Search size={15} className="shrink-0 text-ink-3" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search components…"
                className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-ink-3"
              />
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSearchOpen(false);
                }}
                className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-ink-2 hover:bg-white/20 hover:text-white"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Sorts strip (compact on mobile so it fits easily) */}
              <div className={`${stripCls} shrink-0`}>
                {SORTS.map((srt) => (
                  <button
                    key={srt.id}
                    onClick={() => setSort(srt.id)}
                    className={`${pillBase} px-3 py-1 text-xs sm:px-5 sm:py-1.5 sm:text-sm`}
                    style={sort === srt.id ? pillOnStyle : pillOffStyle}
                  >
                    {srt.label}
                  </button>
                ))}
              </div>

              {/* Search icon + Pricing on mobile */}
              <div className="flex shrink-0 items-center gap-1.5 md:hidden">
                <button
                  aria-label="Search components"
                  onClick={() => setSearchOpen(true)}
                  className="cursor-pointer inline-flex h-[34px] w-[34px] items-center justify-center rounded-full transition-opacity hover:opacity-90"
                  style={pillOnStyle}
                >
                  <Search size={14} />
                </button>
                <div className="relative">
                  <button
                    aria-label="Filter by pricing"
                    onClick={() => setPricingOpen((o) => !o)}
                    className={`${pillBase} inline-flex items-center gap-1 px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm`}
                    style={pricing !== "all" ? pillOnStyle : pillOffStyle}
                  >
                    <span>
                      {pricing === "all" ? "Pricing" : pricing === "free" ? "Free" : "Pro"}
                    </span>
                    <ChevronDown size={12} className="opacity-70" />
                  </button>
                  {pricingOpen && (
                    <div
                      className="absolute right-0 top-full z-30 mt-1.5 w-36 overflow-hidden rounded-xl border border-line bg-[#161618] p-1 shadow-2xl"
                      onMouseLeave={() => setPricingOpen(false)}
                    >
                      {(
                        [
                          { id: "all", label: "All pricing" },
                          { id: "free", label: "Free" },
                          { id: "pro", label: "Pro" },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setPricing(opt.id);
                            setPricingOpen(false);
                          }}
                          className={`cursor-pointer flex w-full items-center rounded-lg px-3 py-1.5 text-left text-xs transition ${
                            pricing === opt.id
                              ? "bg-white/[0.08] font-semibold text-white"
                              : "text-ink-2 hover:bg-white/[0.04] hover:text-white"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Categories strip: full-width on mobile, flex-1 on desktop */}
        <div className="relative min-w-0 w-full flex-1 md:w-auto">
          {canScrollLeft && (
            <button
              aria-label="Scroll categories left"
              onClick={() => catStripRef.current?.scrollBy({ left: -260, behavior: "smooth" })}
              className="cursor-pointer absolute left-1 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition-opacity hover:opacity-90"
              style={pillOnStyle}
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <div
            ref={catStripRef}
            className={`${stripCls} no-scrollbar w-full overflow-x-auto`}
            style={{
              maskImage: maskStyle,
              WebkitMaskImage: maskStyle,
            }}
          >
            {pillCats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={pillBase}
                style={cat === c ? pillOnStyle : pillOffStyle}
              >
                {c}
              </button>
            ))}
          </div>

          {canScrollRight && (
            <button
              aria-label="Scroll categories right"
              onClick={() => catStripRef.current?.scrollBy({ left: 260, behavior: "smooth" })}
              className="cursor-pointer absolute right-1 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition-opacity hover:opacity-90"
              style={pillOnStyle}
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Desktop Search + Pricing (hidden on mobile) */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          {searchOpen ? (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => !query && setSearchOpen(false)}
              placeholder="Search…"
              className="h-[38px] w-[170px] rounded-full border border-white/10 bg-[#151517] px-4 text-sm text-white outline-none placeholder:text-ink-3"
            />
          ) : (
            <button
              aria-label="Search components"
              onClick={() => setSearchOpen(true)}
              className="cursor-pointer inline-flex h-[38px] w-[38px] items-center justify-center rounded-full transition-opacity hover:opacity-90"
              style={pillOnStyle}
            >
              <Search size={15} />
            </button>
          )}
          {/* Pricing dropdown, at the end of the filter row like the
              reference: All pricing / Free / Pro */}
          <div className="relative">
            <button
              onClick={() => setPricingOpen((v) => !v)}
              className="cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ ...pillOnStyle, color: "rgba(255, 255, 255, 0.72)" }}
              aria-haspopup="menu"
              aria-expanded={pricingOpen}
            >
              <span>{pricing === "all" ? "Pricing" : pricing === "free" ? "Free" : "Pro"}</span>
              <ChevronDown size={12} className="ml-0.5" />
            </button>
            {pricingOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border border-line bg-[#17171a] p-1 shadow-2xl">
                {(
                  [
                    ["all", "All pricing"],
                    ["free", "Free"],
                    ["pro", "Pro"],
                  ] as [PricingFilter, string][]
                ).map(([t, label]) => (
                  <button
                    key={t}
                    onClick={() => {
                      setPricing(t);
                      setPricingOpen(false);
                    }}
                    className={`cursor-pointer w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      pricing === t ? "bg-white/[0.08] text-white" : "text-ink-2 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {!loaded ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <RippleLoader />
        </div>
      ) : items.length === 0 ? (
        /* empty state: nothing shows until the admin uploads */
        <div className="mt-10 rounded-[20px] border border-dashed border-[#333338] bg-panel px-6 py-16 text-center">
          <p className="text-[22px] font-bold text-white">No components yet</p>
          <p className="mx-auto mt-2 max-w-[420px] text-sm leading-relaxed text-ink-2">
            This gallery is fed entirely by the admin dashboard. Upload the
            first component and it will appear here instantly.
          </p>
          <Link
            href="/admin/new"
            className="mt-6 inline-block rounded-full px-6 py-[11px] text-sm font-semibold text-[#111827]"
            style={{ background: "linear-gradient(180deg,#ffffff 0%,#dbeafe 100%)" }}
          >
            Upload the first component →
          </Link>
        </div>
      ) : shown.length === 0 ? (
        <p className="mt-16 text-center text-sm text-ink-3">
          No components match this filter.{" "}
          <button
            className="cursor-pointer font-semibold text-white underline-offset-2 hover:underline"
            onClick={() => {
              setCat("All");
              setType("all");
              setPricing("all");
              setQuery("");
            }}
          >
            Reset filters
          </button>
        </p>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        >
          {columnsData.map((colItems, colIdx) => (
            <div key={colIdx} className="flex min-w-0 flex-col gap-4">
              {colItems.map((item) => (
                <ShowcaseCard key={item.slug} item={item} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
