import {
  parseSponsorFromUrl,
  slugify,
  type ShowcaseItem,
  type Sponsor,
} from "@/lib/data";
import { createComponent, ensureCategory, listCategories, listComponents } from "@/lib/db";

export const DEMO_FALLBACK_URL =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL
    ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL.replace(/\/+$/, "")}/1793027269194-site-background.webp`
    : "/logo-black-bg.png";

/**
 * Checks if a URL is a streaming playlist (e.g. Mux / HLS .m3u8, DASH .mpd)
 * or external embed page that cannot be downloaded directly as a standalone file.
 */
export function isStreamingOrPlaylistUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return (
    clean.includes(".m3u8") ||
    clean.includes(".mpd") ||
    clean.includes("stream.mux.com") ||
    clean.includes("mux.com") ||
    clean.includes("youtube.com") ||
    clean.includes("youtu.be") ||
    clean.includes("vimeo.com")
  );
}

/**
 * Robust RFC 4180 CSV parser supporting:
 * - Comma delimiters
 * - Quoted fields with commas and embedded newlines
 * - Escaped quotes ("")
 * - CRLF and LF line endings
 */
export function parseCSV(rawText: string): Record<string, string>[] {
  const text = rawText.replace(/^\uFEFF/, "").trim(); // Strip BOM
  if (!text) return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: "" -> "
          currentField += '"';
          i += 2;
          continue;
        } else {
          // Closing quote
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ",") {
        currentRow.push(currentField.trim());
        currentField = "";
        i++;
        continue;
      } else if (char === "\r") {
        if (nextChar === "\n") i++; // handle \r\n
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
        i++;
        continue;
      } else if (char === "\n") {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  // Push remainder if any
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  if (rows.length < 2) return [];

  // Normalize header names
  const rawHeaders = rows[0];
  const headers = rawHeaders.map((h) => normalizeHeader(h));

  const dataRows: Record<string, string>[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    // Skip empty lines
    if (row.length === 0 || (row.length === 1 && !row[0])) continue;

    const record: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      if (key) {
        record[key] = row[c] ?? "";
      }
    }
    dataRows.push(record);
  }

  return dataRows;
}

function normalizeHeader(raw: string): string {
  const clean = raw.toLowerCase().trim().replace(/[\s_-]+/g, "");
  if (clean === "title" || clean === "name" || clean === "componenttitle") return "title";
  if (clean === "category" || clean === "cat" || clean === "componentcategory") return "category";
  if (clean === "prompt" || clean === "aiprompt" || clean === "prompttext") return "prompt";
  if (
    clean === "mediaurl" ||
    clean === "previewmedia" ||
    clean === "media" ||
    clean === "imageurl" ||
    clean === "videourl"
  )
    return "media_url";
  if (clean === "tech" || clean === "technologies" || clean === "stack") return "tech";
  if (clean === "sponsored" || clean === "sponsor" || clean === "sponsors" || clean === "partner")
    return "sponsored";
  if (clean === "componentcode" || clean === "code" || clean === "sourcecode")
    return "component_code";
  if (clean === "description" || clean === "desc" || clean === "summary") return "description";
  if (clean === "type" || clean === "componenttype") return "type";
  if (clean === "author") return "author";
  if (clean === "pro" || clean === "featured") return "pro";
  return clean;
}

export interface PreparedImportRow {
  index: number;
  title: string;
  slug: string;
  category: string;
  isNewCategory: boolean;
  prompt: string;
  mediaUrl: string;
  tech: string[];
  sponsors: Sponsor[];
  code?: string;
  description: string;
  type: "single" | "compare";
  author: string;
  pro: boolean;
  error?: string;
  isDuplicate?: boolean;
  duplicateReason?: string;
}

export interface PreparedImportResult {
  allRows: PreparedImportRow[];
  newRows: PreparedImportRow[];
  duplicates: PreparedImportRow[];
  duplicateCount: number;
}

/**
 * Validates and transforms parsed CSV data into prepared rows.
 * Enforces duplicate detection (by title or prompt against database and CSV),
 * slug uniqueness, category matching/creation, and field defaults.
 */
export function prepareImportRows(
  records: Record<string, string>[],
  existingCategories: string[],
  existingSlugs: Set<string>,
  existingItems: { title?: string; prompt?: string; slug?: string }[] = []
): PreparedImportResult {
  const allRows: PreparedImportRow[] = [];
  const trackedCats = [...existingCategories];
  const trackedSlugs = new Set(existingSlugs);

  // Prepopulate lookup sets for fast duplicate detection
  const existingTitles = new Set(
    existingItems
      .map((i) => i.title?.trim().toLowerCase())
      .filter((t): t is string => !!t)
  );
  const existingPrompts = new Set(
    existingItems
      .map((i) => i.prompt?.trim().toLowerCase())
      .filter((p): p is string => !!p)
  );

  const seenCsvTitles = new Set<string>();
  const seenCsvPrompts = new Set<string>();

  records.forEach((rec, idx) => {
    const rawTitle = rec.title?.trim() || "";
    const rawPrompt = rec.prompt?.trim() || "";
    let error: string | undefined;
    let isDuplicate = false;
    let duplicateReason: string | undefined;

    if (!rawTitle) {
      error = "Missing required title";
    } else if (!rawPrompt) {
      error = "Missing required prompt";
    }

    const titleLower = rawTitle.toLowerCase();
    const promptLower = rawPrompt.toLowerCase();

    // Check duplicate against existing database components
    if (titleLower && existingTitles.has(titleLower)) {
      isDuplicate = true;
      duplicateReason = "Title already exists in database";
    } else if (promptLower && existingPrompts.has(promptLower)) {
      isDuplicate = true;
      duplicateReason = "Prompt already exists in database";
    } else if (titleLower && seenCsvTitles.has(titleLower)) {
      isDuplicate = true;
      duplicateReason = "Duplicate title in CSV file";
    } else if (promptLower && seenCsvPrompts.has(promptLower)) {
      isDuplicate = true;
      duplicateReason = "Duplicate prompt in CSV file";
    }

    if (titleLower) seenCsvTitles.add(titleLower);
    if (promptLower) seenCsvPrompts.add(promptLower);

    // 1. Slug auto-generation with collision protection
    let baseSlug = slugify(rawTitle);
    if (!baseSlug) baseSlug = `component-${idx + 1}`;
    let finalSlug = baseSlug;
    let counter = 1;
    while (trackedSlugs.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter++}`;
    }
    trackedSlugs.add(finalSlug);

    // 2. Category matching & auto-creation detection
    let targetCategory = "Hero";
    let isNewCat = false;
    const catInput = rec.category?.trim();
    if (catInput) {
      const match = trackedCats.find(
        (c) => c.toLowerCase() === catInput.toLowerCase()
      );
      if (match) {
        targetCategory = match;
      } else {
        // Capitalize nicely if all lowercase
        targetCategory =
          catInput.charAt(0).toUpperCase() + catInput.slice(1);
        isNewCat = true;
        trackedCats.push(targetCategory);
      }
    }

    // 3. Tech array handling (keep empty unless present with data)
    let techArr: string[] = [];
    if (rec.tech && rec.tech.trim()) {
      techArr = rec.tech
        .split(/[,;|]/)
        .map((t) => t.trim())
        .filter(Boolean);
    }

    // 4. Sponsored handling (keep empty unless present with data)
    const sponsorsArr: Sponsor[] = [];
    if (rec.sponsored && rec.sponsored.trim()) {
      const spInput = rec.sponsored.trim();
      if (spInput.startsWith("[") && spInput.endsWith("]")) {
        try {
          const parsed = JSON.parse(spInput);
          if (Array.isArray(parsed)) {
            sponsorsArr.push(...parsed);
          }
        } catch {
          sponsorsArr.push(parseSponsorFromUrl(spInput));
        }
      } else {
        // If comma separated URLs
        const urls = spInput.split(/[\n,]/).map((u) => u.trim()).filter(Boolean);
        for (const u of urls) {
          sponsorsArr.push(parseSponsorFromUrl(u));
        }
      }
    }

    // 5. Code
    const code = rec.component_code?.trim() || undefined;

    // 6. Media URL
    const mediaUrl = rec.media_url?.trim() || "";

    // 7. Type
    const type: "single" | "compare" =
      rec.type?.toLowerCase() === "compare" ? "compare" : "single";

    // 8. Description
    const description =
      rec.description?.trim() ||
      `${rawTitle} component showcase built with AI.`;

    // 9. Author & pro
    const author = rec.author?.trim() || "Studio";
    const pro =
      rec.pro?.toLowerCase() === "true" ||
      rec.pro === "1" ||
      rec.pro?.toLowerCase() === "yes";

    allRows.push({
      index: idx + 1,
      title: rawTitle,
      slug: finalSlug,
      category: targetCategory,
      isNewCategory: isNewCat,
      prompt: rawPrompt,
      mediaUrl,
      tech: techArr,
      sponsors: sponsorsArr,
      code,
      description,
      type,
      author,
      pro,
      error,
      isDuplicate,
      duplicateReason,
    });
  });

  const duplicates = allRows.filter((r) => r.isDuplicate);
  const newRows = allRows.filter((r) => !r.isDuplicate);

  return {
    allRows,
    newRows,
    duplicates,
    duplicateCount: duplicates.length,
  };
}

/**
 * Imports a single prepared row:
 * 1. Downloads media and uploads to Supabase storage (or uses demo fallback)
 * 2. Ensures category exists
 * 3. Creates the component in Supabase / LocalStorage
 */
export async function importRowItem(
  row: PreparedImportRow,
  authToken?: string
): Promise<{
  success: boolean;
  item?: ShowcaseItem;
  mediaUrl?: string;
  usedFallback?: boolean;
  warning?: string;
  error?: string;
}> {
  if (row.error) {
    return { success: false, error: row.error };
  }

  try {
    // 1. Process media
    let finalMediaUrl = DEMO_FALLBACK_URL;
    let finalMediaType: "image" | "video" = "image";
    let usedFallback = false;
    let warning: string | undefined;

    if (!row.mediaUrl || row.mediaUrl === DEMO_FALLBACK_URL) {
      finalMediaUrl = DEMO_FALLBACK_URL;
      finalMediaType = "image";
      usedFallback = true;
    } else if (isStreamingOrPlaylistUrl(row.mediaUrl)) {
      // Direct Mux / HLS streaming URL detected: skip download and safely use default demo WebP
      finalMediaUrl = DEMO_FALLBACK_URL;
      finalMediaType = "image";
      usedFallback = true;
      warning = "Streaming/Mux URL detected; skipped download and assigned default demo media.";
    } else {
      try {
        const res = await fetch("/api/admin/import-media", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({
            mediaUrl: row.mediaUrl,
            title: row.title,
          }),
        });

        let data: any = null;
        try {
          const text = await res.text();
          data = text ? JSON.parse(text) : null;
        } catch {
          data = null;
        }

        if (data && data.url) {
          finalMediaUrl = data.url;
          finalMediaType = data.type === "video" ? "video" : "image";
          usedFallback = !!data.fallback;
          if (data.warning) warning = data.warning;
        } else {
          finalMediaUrl = DEMO_FALLBACK_URL;
          finalMediaType = "image";
          usedFallback = true;
        }
      } catch (mediaErr) {
        console.warn("Error calling import-media API:", mediaErr);
        finalMediaUrl = DEMO_FALLBACK_URL;
        finalMediaType = "image";
        usedFallback = true;
        warning = "Failed to download media; used demo fallback.";
      }
    }

    // 2. Ensure category exists
    await ensureCategory(row.category);

    // 3. Construct ShowcaseItem
    const item: ShowcaseItem = {
      slug: row.slug,
      title: row.title,
      category: row.category,
      type: row.type,
      description: row.description,
      tags: row.tech,
      tech: row.tech,
      prompt: row.prompt,
      code: row.code,
      author: row.author,
      createdAt: new Date().toISOString().slice(0, 10),
      pro: row.pro,
      copies: 0,
      mediaUrl: finalMediaUrl,
      mediaType: finalMediaType,
      imageUrl: finalMediaType === "image" ? finalMediaUrl : undefined,
      hue: 222,
      pattern: "card",
      sponsors: row.sponsors.length > 0 ? row.sponsors : undefined,
    };

    // 4. Save to database
    await createComponent(item);

    return {
      success: true,
      item,
      mediaUrl: finalMediaUrl,
      usedFallback,
      warning,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * Pre-filled sample CSV template string ready for direct download.
 */
export const SAMPLE_CSV_CONTENT = `title,category,prompt,media_url,tech,sponsored,component_code,description,type
"Liquid Glassmorphic Pricing Card","Pricing","Create a modern glassmorphism pricing card with animated gradient borders and frosted glass backdrop-blur. Include a monthly/annual toggle and interactive checkout CTA.","https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe","React, Tailwind CSS, Framer Motion","https://kimi.ai","<div className=""glass-card"">Pricing</div>","Glassmorphism card with responsive blur","single"
"Elastic Magnetic Button","Button","Build a magnetic hover button where the background pill sticks to cursor movement with spring physics.","","Vanilla JS, CSS","","","Magnetic spring button with physics hover","single"
"Retro Cyberpunk Hero Banner","Hero","A dark-mode hero section with retro neon glowing typography, scanline overlay, and animated matrix grid background.","https://invalid-broken-url.com/broken.mp4","WebGL, Three.js, Tailwind CSS","","","Cyberpunk aesthetic hero banner","single"`;
