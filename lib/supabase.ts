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

export const supabase: SupabaseClient = createClient(
  URL_ ?? "https://placeholder.supabase.co",
  KEY ?? "placeholder-key"
);

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
 * Deletes a file from the public Supabase storage bucket.
 */
export async function deleteMediaFromStorage(
  urlOrPath: string,
  fallbackName?: string
): Promise<void> {
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
