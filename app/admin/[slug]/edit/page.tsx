"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ShowcaseItem } from "@/lib/data";
import { getComponent, updateComponent } from "@/lib/db";
import ComponentForm from "@/components/ComponentForm";
import { Component as Loader } from "@/components/ui/ripple-pulse-loader";

export default function AdminEditPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [item, setItem] = useState<ShowcaseItem | null | undefined>(undefined);

  useEffect(() => {
    getComponent(params.slug).then(setItem);
  }, [params.slug]);

  if (item === undefined)
    return <Loader />;
  if (item === null)
    return (
      <div className="space-y-4">
        <Link
          href="/admin/components"
          className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={14} />
          <span>Back to components</span>
        </Link>
        <p className="text-sm text-ink-2">
          Component “{params.slug}” not found.
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Top breadcrumb & back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-ink-3">
          <Link href="/admin" className="text-ink-2 hover:text-white transition">Admin</Link>
          <span>/</span>
          <Link href="/admin/components" className="text-ink-2 hover:text-white transition">Components</Link>
          <span>/</span>
          <span className="font-semibold text-white">Edit</span>
        </div>

        <Link
          href="/admin/components"
          className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white active:scale-95"
        >
          <ArrowLeft size={14} />
          <span>Back to components</span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/components"
            className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10 hover:text-white active:scale-95"
            title="Back to components list"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h2 className="text-[20px] font-bold text-white">
              Edit — {item.title}
            </h2>
            <p className="mt-0.5 text-xs text-ink-3">
              Update prompts, category, media, or partner associations.
            </p>
          </div>
        </div>
      </div>

      <ComponentForm
        initial={item}
        submitLabel="Save changes"
        onSubmit={async (updated) => {
          await updateComponent(item.slug, updated);
          router.push("/admin/components");
        }}
      />
    </div>
  );
}
