import { supabase, SUPABASE_CONFIGURED } from "./supabase";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
}

const STORAGE_KEY = "cf_contact_submissions_v1";

function loadLocalSubmissions(): ContactSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ContactSubmission[]) : [];
  } catch {
    return [];
  }
}

export async function saveContactSubmission(
  sub: Omit<ContactSubmission, "id" | "status" | "created_at">
): Promise<ContactSubmission> {
  const newSub: ContactSubmission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: sub.name.trim(),
    email: sub.email.trim(),
    topic: sub.topic.trim(),
    message: sub.message.trim(),
    status: "new",
    created_at: new Date().toISOString(),
  };

  // Always persist to local cache for immediate availability
  try {
    const local = loadLocalSubmissions();
    const updated = [newSub, ...local.filter((s) => s.id !== newSub.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Local storage save error:", err);
  }

  // Persist to Supabase if configured
  if (SUPABASE_CONFIGURED) {
    try {
      const { data, error } = await supabase
        .from("contact_submissions")
        .insert({
          id: newSub.id,
          name: newSub.name,
          email: newSub.email,
          topic: newSub.topic,
          message: newSub.message,
          status: newSub.status,
          created_at: newSub.created_at,
        })
        .select()
        .single();

      if (!error && data) {
        return data as ContactSubmission;
      }
    } catch (err) {
      console.error("Supabase submission error:", err);
    }
  }

  return newSub;
}

export async function listContactSubmissions(): Promise<ContactSubmission[]> {
  if (SUPABASE_CONFIGURED) {
    try {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data as ContactSubmission[];
      }
    } catch (err) {
      console.error("Failed to fetch contact submissions from Supabase:", err);
    }
  }
  return loadLocalSubmissions();
}

export async function updateContactSubmissionStatus(
  id: string,
  status: "new" | "read" | "replied"
): Promise<void> {
  try {
    const local = loadLocalSubmissions();
    const updated = local.map((s) => (s.id === id ? { ...s, status } : s));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  if (SUPABASE_CONFIGURED) {
    try {
      await supabase
        .from("contact_submissions")
        .update({ status })
        .eq("id", id);
    } catch {}
  }
}

export async function deleteContactSubmission(id: string): Promise<void> {
  try {
    const local = loadLocalSubmissions();
    const updated = local.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  if (SUPABASE_CONFIGURED) {
    try {
      await supabase
        .from("contact_submissions")
        .delete()
        .eq("id", id);
    } catch {}
  }
}
