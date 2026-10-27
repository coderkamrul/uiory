"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X, Zap } from "lucide-react";
import {
  fetchProfile,
  supabase,
  SUPABASE_CONFIGURED,
  type Profile,
} from "@/lib/supabase";

const NAV = [
  { href: "/#showcase", label: "Showcase" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  /* undefined = still checking, null = signed out */
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const dismissedDay = localStorage.getItem("cf_banner_dismissed_day");
      const today = new Date().toISOString().split("T")[0];
      if (dismissedDay === today) {
        setBannerVisible(false);
      }
    } catch {}
  }, []);

  function dismissBanner() {
    try {
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem("cf_banner_dismissed_day", today);
    } catch {}
    setBannerVisible(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return setProfile(null);
    let live = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!live) return;
      setProfile(
        data.session ? await fetchProfile(data.session.user.id) : null
      );
    });
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!live) return;
        setProfile(session ? await fetchProfile(session.user.id) : null);
      }
    );
    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setMenuOpen(false);
    router.push("/");
  }

  // Do not render public header on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* slim announcement bar */}
      {bannerVisible && (
        <div className="relative flex h-9 items-center justify-between bg-[#a78bfa] px-4 text-[12.5px] text-white lg:px-6">
          <span className="hidden items-center gap-1.5 font-medium sm:flex">
            <Zap size={13} strokeWidth={2.5} /> uiory drops
          </span>
          <span className="mx-auto sm:mx-0 text-center leading-tight">
            Fresh AI-built components every week —{" "}
            <strong className="font-bold">free to copy</strong>.
          </span>
          <button
            type="button"
            onClick={dismissBanner}
            aria-label="Close announcement"
            className="flex cursor-pointer items-center justify-center rounded-full p-1 text-white/80 transition-colors hover:bg-black/15 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div
        className={`transition-all duration-300 ${
          scrolled
            ? "border-b border-line bg-paper/85 backdrop-blur-xl"
            : "border-b border-transparent bg-paper"
        }`}
      >
        <div className="flex w-full items-center px-4 py-3 sm:px-6 sm:py-4 gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <img src="/logo-black-bg.png" alt="uiory" className="h-8 w-auto sm:h-9" />
          </Link>

          {/* Desktop nav — centered */}
          <nav className="flex-1 hidden min-w-0 flex-nowrap items-center justify-center gap-1 overflow-x-auto lg:flex">
            {NAV.map((n) => {
              const isActive =
                pathname === n.href ||
                pathname === n.href.replace("#", "") ||
                (n.href === "/#showcase" && pathname === "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
                    isActive ? "text-white bg-white/[0.08]" : "text-white/60 hover:text-white"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* Avatar dropdown — always visible when logged in */}
            {profile ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full bg-[#1c1c1f] p-1.5 pr-2.5 text-sm font-medium text-[#e5e5e5] border border-line transition hover:border-[#3f3f46] hover:bg-[#252529]"
                >
                  <span className="mark-grad grid h-6 w-6 place-items-center rounded-full text-[11px] font-black text-white shadow sm:h-7 sm:w-7">
                    {(profile.name || profile.email).charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[90px] truncate text-xs font-semibold sm:block">
                    {profile.role === "admin"
                      ? "Admin"
                      : profile.name?.split(" ")[0] || "User"}
                  </span>
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-[#161619] p-1.5 shadow-2xl backdrop-blur-xl"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <div className="border-b border-line/60 px-3 py-2.5">
                      <p className="truncate text-xs font-bold text-white">
                        {profile.name || "Administrator"}
                      </p>
                      <p className="truncate text-[11px] text-ink-3">
                        {profile.email}
                      </p>
                    </div>

                    <div className="py-1">
                      {profile.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-ink-2 transition hover:bg-white/[0.06] hover:text-white"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-ink-2 transition hover:bg-white/[0.06] hover:text-white"
                      >
                        User Dashboard
                      </Link>
                      {profile.role === "admin" && (
                        <Link
                          href="/admin/new"
                          onClick={() => setMenuOpen(false)}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-ink-2 transition hover:bg-white/[0.06] hover:text-white"
                        >
                          + New Component
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-line/60 pt-1">
                      <button
                        type="button"
                        onClick={signOut}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                      >
                        <LogOut size={13} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : profile === null ? (
              <>
                {/* Sign in: always visible */}
                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white sm:px-4 sm:py-2"
                >
                  Sign in
                </Link>
                {/* Sign up: hidden on very small screens, shown sm+ */}
                <Link
                  href="/signup"
                  className="hidden whitespace-nowrap rounded-lg bg-[#e5e5e5] px-4 py-1.5 text-sm font-medium text-[#0a0a0a] transition-opacity hover:opacity-90 sm:inline-flex sm:px-5 sm:py-2"
                >
                  Sign up
                </Link>
              </>
            ) : null}

            {/* Hamburger — only on < lg */}
            <button
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-white lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <nav className="border-t border-line bg-paper px-5 pb-5 pt-3 lg:hidden">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink-2 hover:bg-white/[0.05] hover:text-white"
              >
                {n.label}
              </Link>
            ))}
            {/* Sign up CTA inside drawer on xs screens */}
            {profile === null && (
              <div className="mt-3 border-t border-line pt-3 sm:hidden">
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl bg-[#e5e5e5] px-4 py-2.5 text-center text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
                >
                  Sign up free
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
