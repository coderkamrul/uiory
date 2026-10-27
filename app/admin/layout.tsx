"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ExternalLink,
  Home,
  ImageIcon,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import AdminGuard from "@/components/AdminGuard";
import {
  fetchProfile,
  supabase,
  SUPABASE_CONFIGURED,
  type Profile,
} from "@/lib/supabase";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);

  useEffect(() => {
    (async () => {
      if (!SUPABASE_CONFIGURED) return setProfile(null);
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      setProfile(await fetchProfile(data.session.user.id));
    })();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cf_admin_sidebar_collapsed");
      if (saved === "true") setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("cf_admin_sidebar_collapsed", String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function toggleMobileSidebar() {
    setMobileOpen((prev) => !prev);
  }

  function closeMobileSidebar() {
    setMobileOpen(false);
  }

  const isDashboard = pathname === "/admin";
  const isComponents =
    pathname?.startsWith("/admin/components") ||
    pathname?.startsWith("/admin/new") ||
    (pathname?.startsWith("/admin/") &&
      pathname !== "/admin/media" &&
      pathname !== "/admin/inquiries" &&
      pathname !== "/admin/settings");
  const isMedia = pathname === "/admin/media";
  const isInquiries = pathname === "/admin/inquiries";
  const isSettings = pathname === "/admin/settings";

  const mainNavItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: isDashboard,
    },
    {
      href: "/admin/components",
      label: "Components",
      icon: Layers,
      active: isComponents && !isDashboard,
      badge: "List",
    },
    {
      href: "/admin/media",
      label: "Media Library",
      icon: ImageIcon,
      active: isMedia,
      badge: "Cloud",
    },
    {
      href: "/admin/inquiries",
      label: "Inquiries",
      icon: Mail,
      active: isInquiries,
      badge: "Inbox",
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      active: isSettings,
    },
  ];

  const exploreNavItems = [
    {
      href: "/#showcase",
      label: "Public Showcase",
      icon: ArrowUpRight,
      external: true,
    },
    {
      href: "/",
      label: "Home Page",
      icon: Home,
    },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#08080a] text-[#e5e5e5]">
        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={closeMobileSidebar}
          />
        )}

        {/* Professional Collapsible Sidebar (Linear/Vercel/Supabase style) */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex-col justify-between border-r border-[#1a1a20] bg-[#0c0c0f] p-3 select-none transition-all duration-300 ease-in-out ${collapsed ? "w-[68px]" : "w-64"} ${mobileOpen ? "" : "hidden"} lg:flex`}
        >
          <div className="space-y-6">
            {/* Top Brand Header with same website logo as Header.tsx + Collapse/Expand Toggle */}
            <div
              className={`flex items-center ${
                collapsed ? "flex-col gap-3 justify-center" : "justify-between"
              } px-1 pt-1 pb-3 border-b border-[#18181c]`}
            >
              <Link
                href="/admin"
                className="flex items-center gap-2 group min-w-0"
                title="uiory Studio"
              >
                <img
                  src={collapsed ? "/logo-u.png" : "/logo-black-bg.png"}
                  alt="uiory"
                  className="h-7 w-auto shrink-0 transition-opacity"
                />
              </Link>

              {/* Collapse / Expand Toggle Button */}
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="cursor-pointer flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/[0.06] hover:text-white transition"
              >
                {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </button>

              {/* Mobile Close Button */}
              {!collapsed && mobileOpen && (
                <button
                  type="button"
                  onClick={closeMobileSidebar}
                  className="cursor-pointer flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/[0.06] hover:text-white transition lg:hidden"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Navigation: Main Menu */}
            <div className="space-y-1">
              {!collapsed ? (
                <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                  Main Menu
                </p>
              ) : (
                <div className="my-1 border-t border-white/[0.06] mx-2" />
              )}
              <nav className="mt-2 space-y-1">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`group relative flex items-center transition rounded-xl ${
                        collapsed
                          ? "h-10 w-10 mx-auto justify-center"
                          : "justify-between px-3 py-2 text-[13px] font-medium"
                      } ${
                        item.active
                          ? "bg-white/[0.08] text-white ring-1 ring-white/10 shadow-sm"
                          : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-100"
                      }`}
                      onClick={closeMobileSidebar}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          size={16}
                          className={
                            item.active
                              ? "text-white"
                              : "text-zinc-400 group-hover:text-zinc-200"
                          }
                        />
                        {!collapsed && <span>{item.label}</span>}
                      </div>

                      {!collapsed && item.badge && (
                        <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-1.5 py-0.5 rounded">
                          {item.badge}
                        </span>
                      )}

                      {collapsed && (
                        <span className="pointer-events-none absolute left-full ml-3 hidden rounded-lg border border-white/10 bg-[#16161a] px-2.5 py-1 text-xs font-medium text-white shadow-2xl group-hover:block z-50 whitespace-nowrap">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Navigation: Showcase & Site */}
            <div className="space-y-1">
              {!collapsed ? (
                <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                  Explore & Site
                </p>
              ) : (
                <div className="my-1 border-t border-white/[0.06] mx-2" />
              )}
              <nav className="mt-2 space-y-1">
                {exploreNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={`group relative flex items-center transition rounded-xl ${
                        collapsed
                          ? "h-10 w-10 mx-auto justify-center"
                          : "justify-between px-3 py-2 text-[13px] font-medium"
                      } text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-100`}
                      onClick={closeMobileSidebar}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          size={16}
                          className="text-zinc-400 group-hover:text-zinc-200"
                        />
                        {!collapsed && <span>{item.label}</span>}
                      </div>

                      {!collapsed && item.external && (
                        <ExternalLink size={12} className="opacity-30 group-hover:opacity-100" />
                      )}

                      {collapsed && (
                        <span className="pointer-events-none absolute left-full ml-3 hidden rounded-lg border border-white/10 bg-[#16161a] px-2.5 py-1 text-xs font-medium text-white shadow-2xl group-hover:block z-50 whitespace-nowrap">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bottom Profile Bar */}
          <div className="border-t border-[#1a1a20] pt-3">
            {profile === undefined || profile === null ? (
              <div className="flex items-center justify-between rounded-xl bg-white/[0.02] p-2 ring-1 ring-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 font-bold text-white text-[11px] shadow">
                    ?
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`flex items-center ${
                  collapsed ? "flex-col gap-2 justify-center" : "justify-between"
                } rounded-xl bg-white/[0.02] p-2 ring-1 ring-white/5`}
              >
                <div className="flex items-center gap-2.5 min-w-0" title={`${profile.name} (${profile.email})`}>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 font-bold text-white text-[11px] shadow">
                    {(profile.name || profile.email).charAt(0).toUpperCase()}
                  </div>
                  {!collapsed && (
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-zinc-200 leading-tight">
                        {profile.name}
                      </p>
                      <p className="truncate text-[10px] text-zinc-500 leading-tight">
                        {profile.email}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/admin/settings"
                    className="cursor-pointer rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white transition"
                    title="Settings"
                  >
                    <Settings size={14} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileSidebar();
                      supabase.auth.signOut();
                      router.push("/");
                    }}
                    className="cursor-pointer rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-rose-300 transition"
                    title="Sign out"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area (dynamic padding offset based on sidebar state) */}
        <div
          className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out ${
            collapsed ? "lg:pl-[68px]" : "lg:pl-64"
          }`}
        >
          {/* Mobile Top Navbar with toggle button to open sidebar */}
          <div className="flex items-center justify-between border-b border-[#1a1a20] bg-[#0c0c0f] px-4 py-3 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-black-bg.png" alt="uiory" className="h-6 w-auto shrink-0" />
            </Link>

            <button
              type="button"
              onClick={toggleMobileSidebar}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/[0.08] hover:text-white transition"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* Page Inner Container */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
