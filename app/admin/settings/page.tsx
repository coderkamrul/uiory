"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  fetchProfile,
  supabase,
  SUPABASE_CONFIGURED,
  type Profile,
  updateProfile,
} from "@/lib/supabase";
import {
  Mail,
  Save,
  ShieldCheck,
  User,
  Lock,
  LogOut,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Component as Loader } from "@/components/ui/ripple-pulse-loader";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  useEffect(() => {
    (async () => {
      if (!SUPABASE_CONFIGURED) return setProfile(null);
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login?next=/admin/settings");
        return;
      }
      setProfile(await fetchProfile(data.session.user.id));
    })();
  }, [router]);

  if (profile === undefined) {
    return (
      <div className="mx-auto w-full max-w-[760px] px-5 pb-24 pt-[150px]">
        <Loader className="mx-auto" />
      </div>
    );
  }

  const nameInitial = profile?.name || "";
  const email = profile?.email || "";

  async function handleNameSave(e: React.FormEvent) {
    e.preventDefault();
    setNameError("");
    setNameSuccess("");
    setLoading(true);
    try {
      const updated = await updateProfile(profile!.id, { name });
      if (!updated) throw new Error("Failed to update name");
      setNameSuccess("Name updated successfully.");
      setTimeout(() => setNameSuccess(""), 4000);
    } catch {
      setNameError("Could not update name. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");
    setLoading(true);
    try {
      if (newPassword !== confirmPassword) {
        throw new Error("New password and confirmation do not match.");
      }
      if (newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters.");
      }
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPassSuccess("Password updated successfully.");
      setTimeout(() => setPassSuccess(""), 4000);
    } catch (err: any) {
      setPassError(err.message || "Could not update password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[760px] p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-3">
        uiory
      </p>
      <h1 className="mt-1 text-[28px] font-bold tracking-tight text-white">
        Account settings
      </h1>
      <p className="mt-1 text-sm text-ink-2">
        Update your name and password.
      </p>

      <div className="mt-8 rounded-[24px] bg-[#111113] p-7 ring-1 ring-line">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <span className="mark-grad grid h-14 w-14 place-items-center rounded-2xl text-[20px] font-black text-white">
            {nameInitial.charAt(0).toUpperCase() || "U"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[20px] font-bold leading-tight text-white">
              {nameInitial}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-ink-2">
              <Mail size={13} /> {email}
            </p>
          </div>
          <span
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold bg-amber-300/15 text-amber-200"
          >
            <ShieldCheck size={13} />
            Administrator
          </span>
        </div>

        {/* Name Section */}
        <div className="mb-8">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-zinc-400 mb-4">
            Name
          </h2>
          <form onSubmit={handleNameSave} className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <User size={14} className="shrink-0" />
                <span>Display name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                defaultValue={nameInitial}
                className="w-full rounded-xl bg-[#0c0c0f] border border-[#1a1a20] px-4 py-2.5 text-sm text-white focus:border-white/30 focus:ring-1 focus:ring-white/10 transition placeholder-zinc-500"
                placeholder="Your name"
              />
            </div>
            {nameError && (
              <p className="flex items-center gap-1.5 text-xs text-rose-400">
                <AlertCircle size={12} /> {nameError}
              </p>
            )}
            {nameSuccess && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle size={12} /> {nameSuccess}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || name === nameInitial}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition ${loading || name === nameInitial
                  ? "bg-white/[0.05] text-zinc-500 cursor-not-allowed"
                  : "bg-[#e5e5e5] text-[#0a0a0a] hover:bg-white/[0.9]"
                }`}
            >
              <Save size={14} />
              {loading ? "Saving…" : "Save name"}
            </button>
          </form>
        </div>

        {/* Password Section */}
        <div className="border-t border-[#1a1a20] pt-8">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-zinc-400 mb-6">
            Password
          </h2>
          <form onSubmit={handlePasswordSave} className="space-y-3">
            <div>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <Lock size={14} className="shrink-0" />
                <span>Current password</span>
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl bg-[#0c0c0f] border border-[#1a1a20] px-4 py-2.5 text-sm text-white focus:border-white/30 focus:ring-1 focus:ring-white/10 transition placeholder-zinc-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <Lock size={14} className="shrink-0" />
                <span>New password</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl bg-[#0c0c0f] border border-[#1a1a20] px-4 py-2.5 text-sm text-white focus:border-white/30 focus:ring-1 focus:ring-white/10 transition placeholder-zinc-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <Lock size={14} className="shrink-0" />
                <span>Confirm new password</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl bg-[#0c0c0f] border border-[#1a1a20] px-4 py-2.5 text-sm text-white focus:border-white/30 focus:ring-1 focus:ring-white/10 transition placeholder-zinc-500"
                placeholder="••••••••"
              />
            </div>
            {passError && (
              <p className="flex items-center gap-1.5 text-xs text-rose-400">
                <AlertCircle size={12} /> {passError}
              </p>
            )}
            {passSuccess && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle size={12} /> {passSuccess}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition ${loading
                  ? "bg-white/[0.05] text-zinc-500 cursor-not-allowed"
                  : "bg-[#e5e5e5] text-[#0a0a0a] hover:bg-white/[0.9]"
                }`}
            >
              <Save size={14} />
              {loading ? "Saving…" : "Save password"}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2.5">
        <Link
          href="/admin"
          className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-medium text-ink-2 transition hover:text-white"
        >
          Back to dashboard
        </Link>
        <button
          onClick={() => {
            supabase.auth.signOut();
            router.push("/");
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-2.5 text-sm font-medium text-ink-2 transition hover:text-white"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );
}
