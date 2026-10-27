"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { fetchProfile, supabase, SUPABASE_CONFIGURED } from "@/lib/supabase";
import { Component as Loader } from "@/components/ui/ripple-pulse-loader";

/**
 * Client-side gate for /admin. Signed-out visitors go to /login;
 * signed-in non-admins go to their (normal user) dashboard. The real
 * security boundary is the database: RLS only lets admins write, so
 * this guard is the UX layer on top of it.
 * When Supabase is not configured (offline local mode) the gate is open.
 */
export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      if (!SUPABASE_CONFIGURED) return setOk(true);
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login?next=/admin");
        return;
      }
      const p = await fetchProfile(data.session.user.id);
      if (p?.role === "admin") setOk(true);
      else router.replace("/dashboard");
    })();
  }, [router]);

  if (!ok) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader />
      </div>
    );
  }
  return <>{children}</>;
}
