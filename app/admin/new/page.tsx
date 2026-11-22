"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ComponentForm from "@/components/ComponentForm";
import { createComponent } from "@/lib/db";

export default function AdminNewPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      {/* Top breadcrumb & back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-ink-3">
          <Link href="/admin" className="text-ink-2 hover:text-white transition">Admin</Link>
          <span>/</span>
          <Link href="/admin/components" className="text-ink-2 hover:text-white transition">Components</Link>
          <span>/</span>
          <span className="font-semibold text-white">Add component</span>
        </div>

        <Link
          href="/admin/components"
          className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white active:scale-95"
        >
          <ArrowLeft size={14} />
          <span>Back to components</span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/components"
            className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10 hover:text-white active:scale-95"
            title="Back to components list"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h2 className="text-[22px] font-bold tracking-tight text-white">Create a component</h2>
            <p className="mt-0.5 text-xs text-ink-3">
              Complete component media, prompts, and partner associations.
            </p>
          </div>
        </div>
      </div>

      <ComponentForm
        submitLabel="Publish component"
        onSubmit={async (item) => {
          await createComponent(item);
          router.push(`/admin/components?created=${item.slug}`);
        }}
      />
    </div>
  );
}
