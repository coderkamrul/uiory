"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchProfile, homeForRole, supabase, SUPABASE_CONFIGURED } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const input =
  "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-ink-3 focus:border-[#3f3f46] focus:bg-white/[0.05]";
const label = "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-ink-3";

/**
 * Sign in / Sign up card. Accounts are Supabase Auth users; the matching
 * row in public.profiles (created by a database trigger) carries the
 * role — the FIRST account ever created is the admin, everyone after
 * that is a normal user.
 */
export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  /* already signed in? go straight to the right home */
  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return;
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const p = await fetchProfile(data.session.user.id);
        router.replace(next && next.startsWith("/") ? next : homeForRole(p));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!SUPABASE_CONFIGURED) {
      return setError(
        "Supabase is not configured — add the project keys to .env.local first."
      );
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) throw new Error("Please enter your name.");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() } },
        });
        if (error) throw error;
        if (data.session) {
          const p = await fetchProfile(data.session.user.id);
          router.replace(homeForRole(p));
          return;
        }
        setNotice(
          "Account created. Check your email to confirm it, then sign in — the first confirmed account becomes the admin."
        );
        setBusy(false);
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      const p = await fetchProfile(data.user.id);
      router.replace(next && next.startsWith("/") ? next : homeForRole(p));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-col px-5 pb-24 pt-[150px]">
      <div className="rounded-[24px] bg-[#111113] p-8 ring-1 ring-line">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-black-bg.png" alt="uiory" className="h-7 w-auto" />
          </Link>
        <h1 className="mt-6 text-[22px] font-bold tracking-tight text-white">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
          Sign in to reach your dashboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {mode === "signup" && (
            <div>
              <label className={label} htmlFor="cf-name">Name</label>
              <input
                id="cf-name"
                className={input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
          )}
          <div>
            <label className={label} htmlFor="cf-email">Email</label>
            <input
              id="cf-email"
              type="email"
              required
              className={input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className={label} htmlFor="cf-password">Password</label>
            <input
              id="cf-password"
              type="password"
              required
              minLength={6}
              className={input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </div>

          {error && (
            <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-200">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-xl border border-emerald-400/25 bg-emerald-500/[0.08] px-4 py-3 text-[13px] leading-relaxed text-emerald-100">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e5e5e5] px-4 py-3 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>
      </div>
      <p className="mt-5 text-center text-sm text-ink-2">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-white underline-offset-2 hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to uiory?{" "}
            <Link href="/signup" className="font-semibold text-white underline-offset-2 hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
