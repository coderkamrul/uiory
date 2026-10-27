"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
      <p className="text-sm text-ink-2">
        Component “{params.slug}” not found.{" "}
        <button className="font-semibold text-white underline" onClick={() => router.push("/admin")}>
          Back to list
        </button>
      </p>
    );

  return (
    <div>
      <h2 className="mb-5 text-[20px] font-bold text-white">
        Edit — {item.title}
      </h2>
      <ComponentForm
        initial={item}
        submitLabel="Save changes"
        onSubmit={async (updated) => {
          await updateComponent(item.slug, updated);
          router.push("/admin");
        }}
      />
    </div>
  );
}
