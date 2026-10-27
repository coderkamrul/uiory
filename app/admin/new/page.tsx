"use client";

import { useRouter } from "next/navigation";
import ComponentForm from "@/components/ComponentForm";
import { createComponent } from "@/lib/db";

export default function AdminNewPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      {/* Top breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs text-ink-3">
        <span className="text-ink-2">Admin</span>
        <span>/</span>
        <span className="text-ink-2">Components</span>
        <span>/</span>
        <span className="font-semibold text-white">Add component</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <h2 className="text-[22px] font-bold tracking-tight text-white">Create a component</h2>
          <p className="mt-0.5 text-xs text-ink-3">
            Complete component media, prompts, and partner associations.
          </p>
        </div>
      </div>

      <ComponentForm
        submitLabel="Publish component"
        onSubmit={async (item) => {
          await createComponent(item);
          router.push(`/admin?created=${item.slug}`);
        }}
      />
    </div>
  );
}
