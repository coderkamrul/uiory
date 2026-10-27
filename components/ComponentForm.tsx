"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CATEGORIES,
  DEFAULT_SPONSORS,
  slugify,
  type BuildVariant,
  type ShowcaseItem,
  type Sponsor,
} from "@/lib/data";
import { listCategories } from "@/lib/db";
import MediaUpload, { type MediaValue } from "./MediaUpload";
import MediaLibraryModal from "./MediaLibraryModal";
import { Crown, ExternalLink, FileUp, Globe, Image as ImageIcon, Plus, Trash2 } from "lucide-react";

const input =
  "w-full rounded-xl border border-line bg-white/[0.03] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-ink-3 focus:border-[#3f3f46] focus:bg-white/[0.05]";
const label = "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-ink-3";
const sectionTitle = "text-[15px] font-bold text-white";

function parseSponsorFromUrl(inputUrl: string): Sponsor {
  let clean = inputUrl.trim();
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = "https://" + clean;
  }
  let domain = "";
  try {
    const u = new URL(clean);
    domain = u.hostname.replace(/^www\./, "");
  } catch {
    domain = clean.replace(/^https?:\/\//, "").split("/")[0];
  }
  const brandPart = domain.split(".")[0];
  const capitalized = brandPart ? brandPart.charAt(0).toUpperCase() + brandPart.slice(1) : "Partner";
  return {
    name: `Build in ${capitalized}`,
    tagline: `Powered by ${capitalized}`,
    url: clean,
    logoUrl: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : "",
  };
}

function emptyVariant(tool: string): BuildVariant {
  return { tool, model: "", timeTaken: "", verdict: "", strengths: [], hue: 262 };
}

export default function ComponentForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: ShowcaseItem;
  submitLabel: string;
  onSubmit: (item: ShowcaseItem) => Promise<void>;
}) {
  const [type, setType] = useState<"single" | "compare">(initial?.type ?? "single");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [category, setCategory] = useState(initial?.category ?? "Hero");
  const [catOptions, setCatOptions] = useState<string[]>(
    CATEGORIES.filter((c) => c !== "All")
  );
  useEffect(() => {
    listCategories().then(setCatOptions);
  }, []);
  const [media, setMedia] = useState<MediaValue | null>(
    initial?.mediaUrl
      ? { url: initial.mediaUrl, type: initial.mediaType ?? "image" }
      : initial?.imageUrl
        ? { url: initial.imageUrl, type: "image" }
        : null
  );
  const [description] = useState(initial?.description ?? "");
  const [tags] = useState((initial?.tags ?? []).join(", "));
  const [tech, setTech] = useState((initial?.tech ?? []).join(", "));
  const author = initial?.author ?? "Studio";
  const [pro, setPro] = useState(!!initial?.pro);
  const codeFileRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState(initial?.prompt ?? "");
  const [code, setCode] = useState(initial?.code ?? "");

  // Sponsors state
  const [sponsors, setSponsors] = useState<Sponsor[]>(
    initial?.sponsors ?? []
  );
  const [sponsorUrlInput, setSponsorUrlInput] = useState("");
  const [mediaModalSponsorIdx, setMediaModalSponsorIdx] = useState<number | null>(null);

  const [va, setVa] = useState<BuildVariant>(
    initial?.variants?.[0] ?? emptyVariant("Muse AI")
  );
  const [vb, setVb] = useState<BuildVariant>(
    initial?.variants?.[1] ?? { ...emptyVariant("Claude"), hue: 24 }
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const finalSlug = slugTouched && slug ? slugify(slug) : slugify(title);
  const previewItem: ShowcaseItem = useMemo(
    () => ({
      slug: finalSlug || "preview",
      title: title || "Untitled component",
      category,
      type,
      description,
      tags: [],
      tech: [],
      prompt,
      author,
      createdAt: initial?.createdAt ?? new Date().toISOString().slice(0, 10),
      pro,
      copies: initial?.copies ?? 0,
      mediaUrl: media?.url,
      mediaType: media?.type,
      hue: initial?.hue ?? 262,
      pattern: initial?.pattern ?? "card",
      variants: type === "compare" ? [va, vb] : undefined,
      sponsors,
    }),
    [finalSlug, title, category, type, description, prompt, author, pro, media, va, vb, sponsors, initial]
  );

  function handleAddSponsorFromUrl() {
    if (!sponsorUrlInput.trim()) return;
    const parsed = parseSponsorFromUrl(sponsorUrlInput);
    setSponsors((prev) => [...prev, parsed]);
    setSponsorUrlInput("");
  }

  function handleAddEmptySponsor() {
    setSponsors((prev) => [
      ...prev,
      {
        name: "Build in Tool",
        tagline: "AI assistant",
        url: "https://",
        logoUrl: "",
      },
    ]);
  }

  function updateSponsor(index: number, patch: Partial<Sponsor>) {
    setSponsors((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s))
    );
  }

  function removeSponsor(index: number) {
    setSponsors((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) return setError("Title is required.");
    if (!finalSlug) return setError("Title must produce a valid slug.");
    if (!prompt.trim()) return setError("The prompt is required — it is the whole point of the showcase.");
    setBusy(true);
    try {
      await onSubmit({
        ...previewItem,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        tech: tech.split(",").map((t) => t.trim()).filter(Boolean),
        code: code.trim() ? code : undefined,
        sponsors,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
      setBusy(false);
    }
  }

  const variantEditor = (
    v: BuildVariant,
    set: (v: BuildVariant) => void,
    heading: string
  ) => (
    <div className="rounded-2xl border border-line bg-white/[0.02] p-5">
      <div className="flex items-center justify-between">
        <h4 className="text-[14px] font-bold text-white">{heading}</h4>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-white">
          {v.tool || "Build"}
        </span>
      </div>

      {/* Media uploader for this variant */}
      <div className="mt-4">
        <label className={label}>Preview Media for {heading} (Image or Video) *</label>
        <MediaUpload
          value={v.mediaUrl ? { url: v.mediaUrl, type: v.mediaType ?? "image" } : null}
          onChange={(m) => set({ ...v, mediaUrl: m?.url, mediaType: m?.type })}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={label}>Builder / tool</label>
          <input className={input} value={v.tool} onChange={(e) => set({ ...v, tool: e.target.value })} placeholder="Muse AI" />
        </div>
        <div>
          <label className={label}>Model</label>
          <input className={input} value={v.model} onChange={(e) => set({ ...v, model: e.target.value })} placeholder="Muse Spark" />
        </div>
        <div>
          <label className={label}>Time taken</label>
          <input className={input} value={v.timeTaken} onChange={(e) => set({ ...v, timeTaken: e.target.value })} placeholder="≈ 25 min" />
        </div>
      </div>
      <div className="mt-3">
        <label className={label}>Verdict (one line)</label>
        <input className={input} value={v.verdict} onChange={(e) => set({ ...v, verdict: e.target.value })} placeholder="Closest to the reference motion." />
      </div>
      <div className="mt-3">
        <label className={label}>Strengths (one per line)</label>
        <textarea
          className={input}
          rows={3}
          value={v.strengths.join("\n")}
          onChange={(e) => set({ ...v, strengths: e.target.value.split("\n") })}
          placeholder={"Nailed the physics\nClean single file"}
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">

          {/* Type Selector */}
          <section className="rounded-2xl border border-[#222226] bg-[#121215] p-5 shadow-sm">
            <h3 className={sectionTitle}>Showcase Type</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {(
                [
                  ["single", "Single Component", "One prompt, one final build."],
                  ["compare", "Compare A/B", "Same prompt across two AI tools."],
                ] as const
              ).map(([t, name, desc]) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`cursor-pointer rounded-xl border p-4 text-left transition ${
                    type === t
                      ? "border-blue-500/40 bg-blue-500/[0.08] text-white ring-1 ring-blue-500/30"
                      : "border-line bg-white/[0.02] text-ink-2 hover:border-[#3f3f46] hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="block text-sm font-bold text-white">{name}</span>
                  <span className="mt-0.5 block text-xs text-ink-3">{desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Component Details */}
          <section className="rounded-2xl border border-[#222226] bg-[#121215] p-5 shadow-sm">
            <h3 className={sectionTitle}>Component Information</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={label}>Title *</label>
                <input
                  className={input}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Layered Depth Landing Page"
                />
              </div>
              <div>
                <label className={label}>Slug</label>
                <input
                  className={input}
                  value={slugTouched ? slug : finalSlug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugTouched(true);
                  }}
                  placeholder="auto-generated from title"
                />
              </div>
              <div>
                <label className={label}>Category</label>
                <input
                  className={input}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  list="cf-category-options"
                  placeholder="e.g. Hero, Card, Navbar"
                />
                <datalist id="cf-category-options">
                  {catOptions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="sm:col-span-2">
                <label className={label}>Tech & Frameworks (comma separated)</label>
                <input
                  className={input}
                  value={tech}
                  onChange={(e) => setTech(e.target.value)}
                  placeholder="Next.js, TailwindCSS, Framer Motion"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-ink-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pro}
                    onChange={(e) => setPro(e.target.checked)}
                    className="h-4 w-4 rounded accent-amber-400 cursor-pointer"
                  />
                  Pro Component (featured with <Crown size={13} className="inline text-amber-300 mx-1" /> badge)
                </label>
              </div>
            </div>
          </section>

        {/* sponsors */}
        <section className="rounded-[18px] border border-line bg-panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className={sectionTitle}>Sponsored & Partner Links</h3>
              <p className="mt-0.5 text-xs text-ink-3">
                Displayed on the prompt details drawer like the showcase screenshot (e.g. Build in Kimi, Build in Manus).
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddEmptySponsor}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-ink-2 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Plus size={13} /> Add Custom
            </button>
          </div>

          {/* Quick add by website URL */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                className={`${input} pl-9`}
                value={sponsorUrlInput}
                onChange={(e) => setSponsorUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSponsorFromUrl();
                  }
                }}
                placeholder="Paste website URL (e.g. kimi.ai, manus.im, cursor.com)…"
              />
            </div>
            <button
              type="button"
              onClick={handleAddSponsorFromUrl}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90"
            >
              <Plus size={14} /> Add from Website
            </button>
          </div>

          {/* List of sponsors */}
          <div className="mt-4 space-y-3">
            {sponsors.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-ink-3">
                No sponsors added yet. Paste a website above or click &ldquo;Add Custom&rdquo;.
              </p>
            ) : (
              sponsors.map((sp, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-line bg-white/[0.02] p-3.5 transition hover:border-[#3f3f46]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-white/[0.04]">
                        {sp.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={sp.logoUrl}
                            alt=""
                            className="h-6 w-6 object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <Globe size={16} className="text-ink-3" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {sp.name || "Untitled Sponsor"}
                        </p>
                        <p className="text-xs text-ink-3">{sp.tagline || sp.url}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSponsor(idx)}
                      className="rounded-lg p-1.5 text-ink-3 transition hover:bg-rose-500/15 hover:text-rose-400"
                      title="Remove sponsor"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">
                        Name / Title
                      </label>
                      <input
                        className={`${input} mt-1 text-xs`}
                        value={sp.name}
                        onChange={(e) => updateSponsor(idx, { name: e.target.value })}
                        placeholder="Build in Kimi"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">
                        Website URL
                      </label>
                      <input
                        className={`${input} mt-1 text-xs`}
                        value={sp.url}
                        onChange={(e) => {
                          const newUrl = e.target.value;
                          const patch: Partial<Sponsor> = { url: newUrl };
                          try {
                            const domain = new URL(
                              newUrl.startsWith("http") ? newUrl : `https://${newUrl}`
                            ).hostname.replace(/^www\./, "");
                            if (domain) {
                              patch.logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
                            }
                          } catch {}
                          updateSponsor(idx, patch);
                        }}
                        placeholder="https://kimi.ai"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">
                        Tagline / Subtitle
                      </label>
                      <input
                        className={`${input} mt-1 text-xs`}
                        value={sp.tagline}
                        onChange={(e) => updateSponsor(idx, { tagline: e.target.value })}
                        placeholder="Agentic AI for coding"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">
                        Logo
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        {sp.logoUrl ? (
                          <div className="flex flex-1 items-center justify-between rounded-xl border border-line bg-white/[0.04] p-1.5 px-3">
                            <div className="flex items-center gap-2 min-w-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={sp.logoUrl}
                                alt="Logo"
                                className="h-6 w-6 shrink-0 rounded object-contain bg-black/40 p-0.5"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                              <span className="truncate text-xs text-ink-2 max-w-[140px]">
                                Logo selected
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setMediaModalSponsorIdx(idx)}
                                className="cursor-pointer text-xs font-medium text-white hover:underline"
                              >
                                Change
                              </button>
                              <span className="text-ink-3">·</span>
                              <button
                                type="button"
                                onClick={() => updateSponsor(idx, { logoUrl: "" })}
                                className="cursor-pointer text-xs font-medium text-rose-400 hover:text-rose-300"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setMediaModalSponsorIdx(idx)}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-line bg-white/[0.02] py-2 text-xs font-medium text-ink-2 transition hover:border-[#52525b] hover:bg-white/[0.05] hover:text-white"
                          >
                            <ImageIcon size={13} /> Browse from Media Library
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* builders */}
        {type === "compare" && (
          <section className="rounded-[18px] border border-line bg-panel p-5">
            <h3 className={sectionTitle}>The two builds</h3>
            <div className="mt-4 space-y-4">
              {variantEditor(va, setVa, "Builder A")}
              {variantEditor(vb, setVb, "Builder B")}
            </div>
          </section>
        )}

        {/* prompt */}
        <section className="rounded-[18px] border border-line bg-panel p-5">
          <h3 className={sectionTitle}>The prompt</h3>
          <div className="mt-4">
            <label className={label}>Full prompt * (public — anyone can copy it)</label>
            <textarea className={`${input} font-mono !text-[13px] leading-relaxed`} rows={9} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Paste the exact prompt used to build this component…" />
          </div>
        </section>

        {/* component code */}
        <section className="rounded-[18px] border border-line bg-panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className={sectionTitle}>Component code</h3>
            <button
              type="button"
              onClick={() => codeFileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-[12.5px] font-medium text-ink-2 transition hover:text-white"
            >
              <FileUp size={13} /> Upload code file
            </button>
            <input
              ref={codeFileRef}
              type="file"
              accept=".txt,.js,.jsx,.ts,.tsx,.html,.css,.json,.md"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) setCode(await f.text());
                e.target.value = "";
              }}
            />
          </div>
          <div className="mt-4">
            <label className={label}>Source code (optional — shown on the detail page with a copy button)</label>
            <textarea className={`${input} font-mono !text-[13px] leading-relaxed`} rows={8} value={code} onChange={(e) => setCode(e.target.value)} placeholder={"Paste the component's source code here, or upload the file above…"} />
            {code && (
              <p className="mt-1.5 text-[11px] text-ink-3">
                {code.length.toLocaleString()} characters
              </p>
            )}
          </div>
        </section>

        {error && (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        </div>

        {/* Right sidebar matching Screenshot 1 with publish info, quick links, and guidelines */}
        <aside className="space-y-6 lg:sticky lg:top-[90px] lg:self-start">
          <section className="rounded-2xl border border-[#222226] bg-[#121215] p-5 shadow-sm">
            <h4 className="text-sm font-bold text-white">Publish Action</h4>
            <p className="mt-1 text-xs text-ink-3">
              Components become live in the showcase once published.
            </p>
            <div className="mt-4 space-y-2">
              <button
                type="submit"
                disabled={busy}
                className="cursor-pointer flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-900/30 transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"
              >
                {busy ? "Publishing…" : submitLabel}
              </button>
              <Link
                href="/admin"
                className="flex w-full items-center justify-center rounded-xl border border-line bg-white/[0.02] px-4 py-2.5 text-xs font-medium text-ink-2 hover:bg-white/[0.05] hover:text-white"
              >
                Cancel & Return
              </Link>
            </div>
          </section>

          {/* Preview Media placed after Publish Action card as requested */}
          <section className="rounded-2xl border border-[#222226] bg-[#121215] p-5 shadow-sm">
            <h4 className="text-sm font-bold text-white">Preview Media</h4>
            <p className="mt-1 text-xs text-ink-3">
              Upload recording or screenshot (JPG, PNG, WebP, MP4, WebM up to 50MB).
            </p>
            <div className="mt-4">
              <MediaUpload value={media} onChange={setMedia} />
            </div>
          </section>

          <section className="rounded-2xl border border-[#222226] bg-[#121215] p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-3">
              Pro Guidelines
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-ink-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                Use high-resolution 60fps videos or crisp WebP images for optimal performance.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                Ensure prompts specify the exact animations, physics, and libraries.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                For A/B comparisons, both variants must use identical prompt goals.
              </li>
            </ul>
          </section>
        </aside>
      </div>

      <MediaLibraryModal
        open={mediaModalSponsorIdx !== null}
        onClose={() => setMediaModalSponsorIdx(null)}
        allowVideo={false}
        title="Select Sponsor Logo"
        onSelect={(selectedMedia) => {
          if (mediaModalSponsorIdx !== null) {
            updateSponsor(mediaModalSponsorIdx, { logoUrl: selectedMedia.url });
          }
        }}
      />
    </form>
  );
}
