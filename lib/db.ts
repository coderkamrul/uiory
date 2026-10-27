"use client";

import { CATEGORIES, itemToRow, rowToItem, type ComponentRow, type ShowcaseItem } from "./data";
import { loadUploads, saveUpload, deleteUpload } from "./store";
import { supabase, SUPABASE_CONFIGURED } from "./supabase";

/**
 * Data layer for the showcase.
 *
 * - With Supabase configured (.env.local), reads and writes go straight
 *   to the database from the browser with the publishable key. Security
 *   is enforced by Row Level Security: anyone can READ components, but
 *   only signed-in users whose profile role is "admin" can write.
 * - Without Supabase env vars, admin uploads fall back to this browser's
 *   localStorage so the full flow still works offline.
 * - The public site NEVER falls back to seed/demo items: an empty
 *   database means an empty homepage.
 */

export { SUPABASE_CONFIGURED };

/* ------------------------------------------------------------------ */
/* Categories — dynamic. The built-in list is the starting point; any  */
/* new name an admin types in the form is stored (public.categories   */
/* in Supabase, localStorage offline) and shows up in the form's      */
/* suggestions and the homepage filter pills.                        */
/* ------------------------------------------------------------------ */

const CAT_KEY = "cf-categories-v1";
const DEFAULT_CATS: string[] = CATEGORIES.filter((c) => c !== "All");

export async function listCategories(): Promise<string[]> {
  if (!SUPABASE_CONFIGURED) {
    try {
      const raw = localStorage.getItem(CAT_KEY);
      if (raw !== null) {
        return JSON.parse(raw) as string[];
      }
      localStorage.setItem(CAT_KEY, JSON.stringify(DEFAULT_CATS));
      return [...DEFAULT_CATS];
    } catch {
      return [...DEFAULT_CATS];
    }
  }
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("name")
      .order("created_at", { ascending: true })
      .abortSignal(AbortSignal.timeout(8000));
    if (error) throw error;
    const names = (data ?? [])
      .map((r) => (r as { name?: string }).name ?? "")
      .filter(Boolean);
    if (names.length > 0) return names;
    return [...DEFAULT_CATS];
  } catch {
    return [...DEFAULT_CATS];
  }
}

/** Create the category if it does not exist yet. Never throws — a
    category problem must not block saving the component itself. */
export async function ensureCategory(name: string): Promise<void> {
  const clean = name.trim();
  if (!clean || clean === "All") return;
  if (!SUPABASE_CONFIGURED) {
    try {
      const raw = localStorage.getItem(CAT_KEY);
      const saved: string[] = raw ? JSON.parse(raw) : [];
      if (!saved.includes(clean) && !DEFAULT_CATS.includes(clean)) {
        saved.push(clean);
        localStorage.setItem(CAT_KEY, JSON.stringify(saved));
      }
    } catch {
      /* private mode — ignore */
    }
    return;
  }
  try {
    await supabase
      .from("categories")
      .upsert({ name: clean }, { onConflict: "name" });
  } catch {
    /* table may not exist yet — ignore */
  }
}

export async function deleteCategory(
  categoryName: string,
  fallbackCategory = "Hero"
): Promise<{ reassignedCount: number }> {
  const clean = categoryName.trim();
  if (!clean || clean === "All") return { reassignedCount: 0 };

  if (!SUPABASE_CONFIGURED) {
    try {
      const comps = loadUploads();
      let reassignedCount = 0;
      const updatedComps = comps.map((c) => {
        if (c.category === clean) {
          reassignedCount++;
          return { ...c, category: fallbackCategory };
        }
        return c;
      });
      localStorage.setItem("cf-uploads-v1", JSON.stringify(updatedComps));

      const raw = localStorage.getItem(CAT_KEY);
      const saved: string[] = raw ? JSON.parse(raw) : [];
      const updatedSaved = saved.filter((c) => c !== clean);
      localStorage.setItem(CAT_KEY, JSON.stringify(updatedSaved));

      return { reassignedCount };
    } catch {
      return { reassignedCount: 0 };
    }
  }

  // 1. Reassign components in this category to fallback
  const { data: updated, error: updateErr } = await supabase
    .from("components")
    .update({ category: fallbackCategory })
    .eq("category", clean)
    .select("id");

  if (updateErr) {
    console.error("Failed to reassign components:", updateErr);
  }

  // 2. Delete the category
  const { error: delErr } = await supabase
    .from("categories")
    .delete()
    .eq("name", clean);

  if (delErr) {
    throw new Error(delErr.message);
  }

  return { reassignedCount: updated?.length ?? 0 };
}

export async function updateCategory(
  oldName: string,
  newName: string
): Promise<{ updatedCount: number }> {
  const oldClean = oldName.trim();
  const newClean = newName.trim();
  if (!oldClean || !newClean || oldClean === newClean) {
    return { updatedCount: 0 };
  }

  if (!SUPABASE_CONFIGURED) {
    try {
      const raw = localStorage.getItem(CAT_KEY);
      const saved: string[] = raw ? JSON.parse(raw) : [];
      const updatedSaved = saved.map((c) => (c === oldClean ? newClean : c));
      if (!updatedSaved.includes(newClean)) updatedSaved.push(newClean);
      localStorage.setItem(CAT_KEY, JSON.stringify(updatedSaved));

      const comps = loadUploads();
      let updatedCount = 0;
      const updatedComps = comps.map((c) => {
        if (c.category === oldClean) {
          updatedCount++;
          return { ...c, category: newClean };
        }
        return c;
      });
      localStorage.setItem("cf-uploads-v1", JSON.stringify(updatedComps));
      return { updatedCount };
    } catch {
      return { updatedCount: 0 };
    }
  }

  // 1. Upsert new category name
  await supabase
    .from("categories")
    .upsert({ name: newClean }, { onConflict: "name" });

  // 2. Reassign all components
  const { data: updated, error: updateErr } = await supabase
    .from("components")
    .update({ category: newClean })
    .eq("category", oldClean)
    .select("id");

  if (updateErr) {
    console.error("Failed to update components category:", updateErr);
  }

  // 3. Delete old category name
  await supabase
    .from("categories")
    .delete()
    .eq("name", oldClean);

  return { updatedCount: updated?.length ?? 0 };
}


export async function listComponents(): Promise<ShowcaseItem[]> {
  if (!SUPABASE_CONFIGURED) return loadUploads();
  try {
    const { data, error } = await supabase
      .from("components")
      .select("*")
      .order("created_at", { ascending: false })
      /* never leave the gallery hanging if the network stalls */
      .abortSignal(AbortSignal.timeout(8000));
    if (error) throw error;
    return ((data ?? []) as ComponentRow[]).map(rowToItem);
  } catch {
    return [];
  }
}

export async function getComponent(slug: string): Promise<ShowcaseItem | null> {
  const all = await listComponents();
  return all.find((i) => i.slug === slug) ?? null;
}

export async function createComponent(item: ShowcaseItem): Promise<void> {
  await ensureCategory(item.category);
  if (!SUPABASE_CONFIGURED) return saveUpload(item);
  const { error } = await supabase.from("components").insert(itemToRow(item));
  if (error) throw new Error(error.message);
}

export async function updateComponent(
  slug: string,
  item: ShowcaseItem
): Promise<void> {
  await ensureCategory(item.category);
  if (!SUPABASE_CONFIGURED) {
    deleteUpload(slug);
    saveUpload(item);
    return;
  }
  const { error } = await supabase
    .from("components")
    .update(itemToRow(item))
    .eq("slug", slug);
  if (error) throw new Error(error.message);
}

export async function deleteComponent(slug: string): Promise<void> {
  if (!SUPABASE_CONFIGURED) return deleteUpload(slug);
  const { error } = await supabase.from("components").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
}

export async function hasUserLiked(slug: string): Promise<boolean> {
  if (!SUPABASE_CONFIGURED) {
    try {
      const raw = localStorage.getItem("cf-likes-v1");
      const liked: string[] = raw ? JSON.parse(raw) : [];
      return liked.includes(slug);
    } catch {
      return false;
    }
  }
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id;
    if (!uid) return false;
    const { data, error } = await supabase
      .from("component_likes")
      .select("id")
      .eq("component_slug", slug)
      .eq("user_id", uid)
      .maybeSingle();
    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
}

export async function toggleLike(
  slug: string
): Promise<{ liked: boolean; likes: number }> {
  if (!SUPABASE_CONFIGURED) {
    try {
      const raw = localStorage.getItem("cf-likes-v1");
      const liked: string[] = raw ? JSON.parse(raw) : [];
      const isLiked = liked.includes(slug);
      const updated = isLiked
        ? liked.filter((s) => s !== slug)
        : [...liked, slug];
      localStorage.setItem("cf-likes-v1", JSON.stringify(updated));
      const comp = await getComponent(slug);
      let newCount = comp?.copies ?? 0;
      if (comp) {
        newCount = Math.max(0, comp.copies + (isLiked ? -1 : 1));
        await updateComponent(slug, { ...comp, copies: newCount });
      }
      return { liked: !isLiked, likes: newCount };
    } catch {
      return { liked: false, likes: 0 };
    }
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) {
    throw new Error("LOGIN_REQUIRED");
  }

  const { data, error } = await supabase.rpc("toggle_component_like", {
    target_slug: slug,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    liked: !!data?.liked,
    likes: typeof data?.likes === "number" ? data.likes : 0,
  };
}

