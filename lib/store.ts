import type { ShowcaseItem } from "./data";

/* Dashboard uploads live in localStorage for this standalone build.
   Swap these helpers for API calls when a backend is added — the
   homepage and detail pages only read through `loadUploads`. */

const KEY = "cf-uploads-v1";

export function loadUploads(): ShowcaseItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUpload(item: ShowcaseItem): void {
  const all = loadUploads().filter((i) => i.slug !== item.slug);
  all.unshift(item);
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteUpload(slug: string): void {
  window.localStorage.setItem(
    KEY,
    JSON.stringify(loadUploads().filter((i) => i.slug !== slug))
  );
}

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `component-${Date.now()}`
  );
}
