"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  fetchProfile,
  supabase,
  SUPABASE_CONFIGURED,
  type Profile,
} from "@/lib/supabase";
import { CalendarDays, LayoutGrid, LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Component as Loader } from "@/components/ui/ripple-pulse-loader";

/**
 * The normal-user dashboard. Deliberately simple for this version:
 * who you are and your account basics — no admin powers here.
 * Admins who land here get a door into /admin.
 */
export default function UserDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [memberSince, setMemberSince] = useState("");

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) {
      setProfile(null);
      return;
    }

    let isMounted = true;
    const applySession = async (userSession: typeof supabase extends { auth: { getSession: () => Promise<{ data: { session: infer S } }> } } ? S : any) => {
      if (!userSession) {
        router.replace("/login?next=/dashboard");
        return;
      }
      if (!isMounted) return;
      setEmail(userSession.user.email ?? "");
      setMemberSince((userSession.user.created_at ?? "").slice(0, 10));
      const p = await fetchProfile(userSession.user.id);
      if (isMounted) setProfile(p);
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        applySession(data.session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        applySession(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (profile === undefined) {
    return (
      <div className="mx-auto w-full max-w-[760px] px-5 pb-24 pt-[150px]">
        <Loader className="mx-auto" />
      </div>
    );
  }

  const name = profile?.name || email.split("@")[0] || "Member";
  const role = profile?.role ?? "user";
  const since = (profile?.created_at ?? memberSince).slice(0, 10);

  return (
    <div className="mx-auto w-full max-w-[760px] px-5 pb-24 pt-[150px]">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-3">
        uiory
      </p>
      <h1 className="mt-1 text-[28px] font-bold tracking-tight text-white">
        Your dashboard
      </h1>

      <div className="mt-8 rounded-[24px] bg-[#111113] p-7 ring-1 ring-line">
        <div className="flex flex-wrap items-center gap-4">
          <span className="mark-grad grid h-14 w-14 place-items-center rounded-2xl text-[20px] font-black text-white">
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[20px] font-bold leading-tight text-white">
              {name}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-ink-2">
              <Mail size={13} /> {profile?.email ?? email}
            </p>
          </div>
          <span
            className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
              role === "admin"
                ? "bg-amber-300/15 text-amber-200"
                : "bg-white/[0.07] text-ink-2"
            }`}
          >
            <ShieldCheck size={13} />
            {role === "admin" ? "Admin" : "Member"}
          </span>
        </div>

        <dl className="mt-7 grid gap-4 border-t border-line pt-6 sm:grid-cols-3">
          {[
            { icon: <UserRound size={14} />, k: "Name", v: name },
            { icon: <ShieldCheck size={14} />, k: "Account type", v: role === "admin" ? "Administrator" : "Normal user" },
            { icon: <CalendarDays size={14} />, k: "Member since", v: since || "—" },
          ].map((row) => (
            <div key={row.k}>
              <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-3">
                <span className="text-ink-3">{row.icon}</span>
                {row.k}
              </dt>
              <dd className="mt-1.5 truncate text-sm font-medium text-white">{row.v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 rounded-xl bg-white/[0.03] px-4 py-3 text-[13px] leading-relaxed text-ink-2">
          {role === "admin"
            ? "You have admin access — you can upload and manage the components on the homepage."
            : "Your account is a normal user account. Browsing and copying prompts is always free; component uploads are managed by the admin."}
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          {role === "admin" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl bg-[#e5e5e5] px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
            >
              <LayoutGrid size={15} /> Open admin dashboard
            </Link>
          )}
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-line px-5 py-2.5 text-sm font-medium text-ink-2 transition hover:text-white"
          >
            Browse the gallery
          </Link>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-2.5 text-sm font-medium text-ink-2 transition hover:text-white"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
