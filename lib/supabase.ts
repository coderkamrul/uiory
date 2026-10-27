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

/** Where a signed-in user lands: admins to /admin, everyone else to /dashboard. */
export function homeForRole(profile: Profile | null): string {
  return profile?.role === "admin" ? "/admin" : "/dashboard";
}
