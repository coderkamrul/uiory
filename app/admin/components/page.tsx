"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ShowcaseItem } from "@/lib/data";
import {
  listComponents,
  deleteComponent,
  listCategories,
  deleteCategory,
  updateCategory,
  ensureCategory,
} from "@/lib/db";
import PreviewArt from "@/components/PreviewArt";
import { Component as Loader } from "@/components/ui/ripple-pulse-loader";
import {
  AlertTriangle,
  Crown,
  Eye,
  Heart,
  Layers,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";

export default function AdminComponentsPage() {
  const [tab, setTab] = useState<"components" | "categories">("components");
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "single" | "compare">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Edit category modal state
  const [catToEdit, setCatToEdit] = useState<{
    oldName: string;
    count: number;
  } | null>(null);
  const [editNameInput, setEditNameInput] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Warning modal state for deleting category
  const [catToDelete, setCatToDelete] = useState<{
    name: string;
    count: number;
    fallback: string;
  } | null>(null);

  async function loadData() {
    const [cList, compList] = await Promise.all([
      listCategories(),
      listComponents(),
    ]);
    setCategories(cList.filter((c) => c !== "All"));
    setItems(compList);
    setLoaded(true);
  }

  useEffect(() => {
    loadData();
  }, []);

  const shown = useMemo(
    () =>
      items.filter((i) => {
        const matchesQuery =
          query.trim() === "" ||
          `${i.title} ${i.category} ${i.slug}`.toLowerCase().includes(query.trim().toLowerCase());
        const matchesType =
          typeFilter === "all" ? true : i.type === typeFilter;
        const matchesCategory =
          categoryFilter === "all" ? true : i.category === categoryFilter;
        return matchesQuery && matchesType && matchesCategory;
      }),
    [items, query, typeFilter, categoryFilter]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [items]);

  async function handleDelete(item: ShowcaseItem) {
    if (!confirm(`Delete “${item.title}”? This removes it from the showcase.`)) return;
    await deleteComponent(item.slug);
    setItems((prev) => prev.filter((i) => i.slug !== item.slug));
    setNotice(`Deleted “${item.title}”.`);
  }

  function promptDeleteCategory(catName: string) {
    const count = categoryCounts[catName] || 0;
    const fallback =
      categories.find((c) => c !== catName && c !== "All") || "Hero";

    setCatToDelete({
      name: catName,
      count,
      fallback,
    });
  }

  function openEditCategory(catName: string) {
    const count = categoryCounts[catName] || 0;
    setCatToEdit({ oldName: catName, count });
    setEditNameInput(catName);
  }

  async function handleSaveCategoryEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!catToEdit) return;
    const clean = editNameInput.trim();
    if (!clean) return;
    if (clean === catToEdit.oldName) {
      setCatToEdit(null);
      return;
    }
    setIsSavingEdit(true);
    try {
      const { updatedCount } = await updateCategory(catToEdit.oldName, clean);
      await loadData();
      setCatToEdit(null);
      setNotice(
        `Category renamed from “${catToEdit.oldName}” to “${clean}”.${
          updatedCount > 0 ? ` ${updatedCount} component(s) updated.` : ""
        }`
      );
    } catch (err: unknown) {
      alert(`Failed to update category: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function confirmDeleteCategory() {
    if (!catToDelete) return;
    const { name, fallback } = catToDelete;
    try {
      const { reassignedCount } = await deleteCategory(name, fallback);
      await loadData();
      setCatToDelete(null);
      setNotice(
        `Category “${name}” deleted.${
          reassignedCount > 0
            ? ` ${reassignedCount} component(s) were reassigned to default category “${fallback}”.`
            : ""
        }`
      );
    } catch (err: unknown) {
      alert(`Failed to delete category: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    const clean = newCatName.trim();
    if (!clean) return;
    setIsAddingCat(true);
    try {
      await ensureCategory(clean);
      setNewCatName("");
      await loadData();
      setNotice(`Category “${clean}” created.`);
    } catch (err: unknown) {
      alert(`Failed to create category: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsAddingCat(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Dedicated Header with Add Component Button (ONLY on components page) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#1f1f23] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-ink-3 mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-white font-medium">Components</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Components Directory
          </h1>
          <p className="mt-1 text-xs text-ink-3">
            Manage your AI UI components, edit prompts, and organize categories.
          </p>
        </div>

        {/* Add Component Button */}
        <div>
          <Link
            href="/admin/new"
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-950/40 transition hover:from-blue-500 hover:to-indigo-500"
          >
            <Plus size={16} /> Add Component
          </Link>
        </div>
      </div>

      {notice && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-xs text-blue-200 animate-fade-in flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} className="text-blue-300 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1f1f23] pb-3">
        <button
          onClick={() => setTab("components")}
          className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            tab === "components"
              ? "bg-white text-black shadow"
              : "text-ink-3 hover:text-white"
          }`}
        >
          <Layers size={14} />
          All Components ({items.length})
        </button>
        <button
          onClick={() => setTab("categories")}
          className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            tab === "categories"
              ? "bg-white text-black shadow"
              : "text-ink-3 hover:text-white"
          }`}
        >
          <Tag size={14} />
          Categories ({categories.length})
        </button>
      </div>

      {tab === "components" && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, category, or slug…"
                  className="h-10 w-64 sm:w-80 rounded-xl border border-[#27272a] bg-[#141417] pl-9 pr-4 text-xs text-white outline-none placeholder:text-ink-3 transition focus:border-blue-500/50"
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 rounded-xl border border-[#27272a] bg-[#141417] px-3 text-xs text-white outline-none cursor-pointer focus:border-blue-500/50"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c} ({categoryCounts[c] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center rounded-xl border border-[#27272a] bg-[#141417] p-1 text-xs">
              {(
                [
                  ["all", "All"],
                  ["single", "Single"],
                  ["compare", "Compare A/B"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setTypeFilter(val)}
                  className={`cursor-pointer rounded-lg px-3 py-1 font-medium transition ${
                    typeFilter === val
                      ? "bg-white text-black shadow-sm font-semibold"
                      : "text-ink-3 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Components List */}
          <div className="overflow-hidden rounded-2xl border border-[#222226] bg-[#121215] shadow-sm">
            {!loaded ? (
              <Loader />
            ) : shown.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-xs text-ink-3">
                  {items.length === 0
                    ? "No components created yet."
                    : "No components match your search filter."}
                </p>
                <Link
                  href="/admin/new"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black"
                >
                  <Plus size={14} /> Add new component
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-[#1f1f23]">
                {shown.map((item) => (
                  <li
                    key={item.slug}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 transition hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Paused Media Preview Thumbnail */}
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-[#1c1c20] border border-white/5">
                        {(item.mediaType === "video" ||
                          item.mediaUrl?.endsWith(".mp4") ||
                          item.mediaUrl?.endsWith(".webm")) &&
                        item.mediaUrl ? (
                          <video
                            src={item.mediaUrl}
                            preload="metadata"
                            muted
                            playsInline
                            className="h-full w-full object-cover pointer-events-none"
                          />
                        ) : (
                          <PreviewArt item={item} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white flex items-center gap-1.5">
                          {item.title}
                          {item.pro && (
                            <Crown size={12} className="text-amber-300 shrink-0" />
                          )}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-ink-3">
                          {item.category} · /{item.slug} · {item.createdAt.slice(0, 10)}
                        </p>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          item.type === "compare"
                            ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30"
                            : "bg-white/[0.06] text-ink-2"
                        }`}
                      >
                        {item.type === "compare" ? "Compare A/B" : "Single"}
                      </span>

                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-rose-300 bg-rose-500/10 px-2.5 py-0.5 rounded-full">
                        <Heart size={11} className="fill-rose-300" />
                        {item.copies || 0}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/?prompt=${item.slug}`}
                          className="rounded-lg border border-white/10 bg-white/[0.02] p-1.5 text-ink-3 transition hover:bg-white/10 hover:text-white"
                          title="View on Showcase"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={`/admin/${item.slug}/edit`}
                          className="rounded-lg border border-white/10 bg-white/[0.02] p-1.5 text-ink-3 transition hover:bg-white/10 hover:text-white"
                          title="Edit Component"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item)}
                          className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-300 transition hover:bg-rose-500/20 cursor-pointer"
                          title="Delete Component"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "categories" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Categories Management</h2>
              <p className="text-xs text-ink-3">
                Create new categories or manage existing ones.
              </p>
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New category name (e.g. Navigation, Hero, Cards)…"
                className="h-10 w-64 rounded-xl border border-[#27272a] bg-[#141417] px-3.5 text-xs text-white outline-none placeholder:text-ink-3 focus:border-blue-500/50"
              />
              <button
                type="submit"
                disabled={isAddingCat || !newCatName.trim()}
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-white/90 disabled:opacity-50"
              >
                <Plus size={14} /> Add Category
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="overflow-hidden rounded-2xl border border-[#222226] bg-[#121215] shadow-sm">
            {categories.length === 0 ? (
              <p className="p-8 text-center text-xs text-ink-3">No categories found.</p>
            ) : (
              <ul className="divide-y divide-[#1f1f23]">
                {categories.map((c) => {
                  const count = categoryCounts[c] || 0;
                  return (
                    <li
                      key={c}
                      className="flex items-center justify-between gap-4 p-4 transition hover:bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-ink-3">
                          <Tag size={14} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">{c}</p>
                          <p className="text-xs text-ink-3">
                            {count} {count === 1 ? "component" : "components"} assigned
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            count > 0
                              ? "bg-white/[0.08] text-white"
                              : "bg-white/[0.03] text-ink-3"
                          }`}
                        >
                          {count} {count === 1 ? "item" : "items"}
                        </span>
                        <button
                          onClick={() => openEditCategory(c)}
                          className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-ink-2 transition hover:bg-white/[0.08] hover:text-white"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          onClick={() => promptDeleteCategory(c)}
                          className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {catToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#27272a] bg-[#16161a] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Edit Category Name
            </h3>

            <form onSubmit={handleSaveCategoryEdit} className="mt-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-3">
                Category Name
              </label>
              <input
                autoFocus
                value={editNameInput}
                onChange={(e) => setEditNameInput(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-[#27272a] bg-white/[0.04] px-3.5 text-xs text-white outline-none focus:border-blue-500"
                placeholder="Category name…"
              />

              <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs leading-relaxed text-ink-3">
                Renaming will update this category across all{" "}
                <strong className="text-white">{catToEdit.count}</strong> assigned{" "}
                component{catToEdit.count === 1 ? "" : "s"}.
              </div>

              <div className="mt-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCatToEdit(null)}
                  className="rounded-xl border border-line px-4 py-2 text-xs font-medium text-ink-2 transition hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit || !editNameInput.trim()}
                  className="rounded-xl bg-white px-5 py-2 text-xs font-bold text-black transition hover:bg-white/90 disabled:opacity-50"
                >
                  {isSavingEdit ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Warning Modal */}
      {catToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#27272a] bg-[#16161a] p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                <AlertTriangle size={20} />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">
                  Delete Category “{catToDelete.name}”?
                </h3>
                {catToDelete.count > 0 ? (
                  <div className="mt-2 text-xs leading-relaxed text-ink-2">
                    <p className="font-semibold text-amber-300">
                      ⚠️ Warning: {catToDelete.count} component{catToDelete.count === 1 ? "" : "s"} currently assigned!
                    </p>
                    <p className="mt-1 text-ink-3">
                      All {catToDelete.count} component{catToDelete.count === 1 ? "" : "s"} will automatically have their category reassigned to:{" "}
                      <strong className="text-white">“{catToDelete.fallback}”</strong>.
                    </p>
                  </div>
                ) : (
                  <p className="mt-1.5 text-xs text-ink-3">
                    No components are assigned to this category. It will be safely removed.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setCatToDelete(null)}
                className="rounded-xl border border-line px-4 py-2 text-xs font-medium text-ink-2 transition hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCategory}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-rose-500"
              >
                {catToDelete.count > 0 ? "Reassign & Delete" : "Delete Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
