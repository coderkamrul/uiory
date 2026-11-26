import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client.
 *
 * Uses the project's publishable (anon) key — safe to expose because
 * every table and the storage bucket are protected by Row Level
 * Security: the gallery is public to read, and only signed-in users
 * whose profile role is "admin" can write or upload.
 */

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_CONFIGURED = !!URL_ && !!KEY;
export const MEDIA_BUCKET = "component-media";
export const R2_PUBLIC_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").replace(/\/+$/, "");
export const R2_ENABLED = !!R2_PUBLIC_BASE;

export const supabase: SupabaseClient = createClient(
  URL_ ?? "https://placeholder.supabase.co",
  KEY ?? "placeholder-key"
);

/**
 * Uploads an image or video file to Cloudflare R2 (when configured) or Supabase Storage.
 */
export async function uploadMediaFile(
  file: File,
  customName?: string
): Promise<{ url: string; name: string; type: "image" | "video" }> {
  const isVideo =
    file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv)$/i.test(file.name);

  if (R2_ENABLED) {
    const form = new FormData();
    form.append("file", file, customName || file.name);
    const res = await fetch("/api/admin/media", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.url) {
      throw new Error(data?.error || "Failed to upload media to R2.");
    }
    return {
      url: data.url,
      name: data.name || file.name,
      type: data.type === "video" ? "video" : "image",
    };
  }

  if (!SUPABASE_CONFIGURED) {
    throw new Error("Media storage is not configured.");
  }

  const safe = (customName || file.name).replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${Date.now()}-${safe}`;
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return {
    url: data.publicUrl,
    name: path,
    type: isVideo ? "video" : "image",
  };
}

/**
 * Extracts storage relative object path from a Supabase Storage public URL or filename.
 */
export function getStoragePath(urlOrName: string, fallbackName?: string): string {
  if (!urlOrName) return fallbackName || "";
  try {
    const urlObj = new URL(urlOrName);
    const pathname = decodeURIComponent(urlObj.pathname);
    const marker = `/${MEDIA_BUCKET}/`;
    const idx = pathname.indexOf(marker);
    if (idx !== -1) {
      return pathname.substring(idx + marker.length);
    }
  } catch {
    // Not a full URL, fallback
  }
  if (fallbackName && !fallbackName.startsWith("http")) {
    return fallbackName;
  }
  const clean = urlOrName.split("?")[0].split("#")[0];
  return clean.split("/").pop() || fallbackName || "";
}

/**
 * Deletes a file from Cloudflare R2 or the public Supabase storage bucket.
 */
export async function deleteMediaFromStorage(
  urlOrPath: string,
  fallbackName?: string
): Promise<void> {
  if (R2_ENABLED && (!urlOrPath.includes("supabase.co") || urlOrPath.startsWith(R2_PUBLIC_BASE))) {
    const res = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: urlOrPath, name: fallbackName }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || "Failed to delete media from R2.");
    }
    return;
  }
  if (!SUPABASE_CONFIGURED) return;
  const path = getStoragePath(urlOrPath, fallbackName);
  if (!path) return;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  if (error) {
    throw new Error(error.message);
  }
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  created_at: string;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!SUPABASE_CONFIGURED) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) return null;
    return (data as Profile) ?? null;
  } catch {
    return null;
  }
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, "name">>
): Promise<Profile | null> {
  if (!SUPABASE_CONFIGURED) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select("*")
      .maybeSingle();
    if (error) return null;
    return (data as Profile) ?? null;
  } catch {
    return null;
  }
}

/** Where a signed-in user lands: admins to /admin, everyone else to /dashboard. */
export function homeForRole(profile: Profile | null): string {
  return profile?.role === "admin" ? "/admin" : "/dashboard";
}
