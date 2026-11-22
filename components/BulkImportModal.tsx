"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  parseCSV,
  prepareImportRows,
  importRowItem,
  isStreamingOrPlaylistUrl,
  SAMPLE_CSV_CONTENT,
  DEMO_FALLBACK_URL,
  type PreparedImportRow,
} from "@/lib/csv-import";
import { supabase } from "@/lib/supabase";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  Tag,
  UploadCloud,
  X,
} from "lucide-react";

interface BulkImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: string[];
  existingSlugs: string[];
  existingItems?: { title?: string; prompt?: string; slug?: string }[];
}

export default function BulkImportModal({
  open,
  onClose,
  onSuccess,
  categories,
  existingSlugs,
  existingItems = [],
}: BulkImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [allImportRows, setAllImportRows] = useState<PreparedImportRow[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [rawRecordCount, setRawRecordCount] = useState(0);
  const [parsingError, setParsingError] = useState("");

  const parsedRows = useMemo(() => {
    if (skipDuplicates) {
      return allImportRows.filter((r) => !r.isDuplicate);
    }
    return allImportRows;
  }, [allImportRows, skipDuplicates]);

  // Progress state
  const [isImporting, setIsImporting] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [importSummary, setImportSummary] = useState<{
    total: number;
    succeeded: number;
    failed: number;
    fallbacksUsed: number;
    categoriesCreated: string[];
    errors: { title: string; error: string }[];
  } | null>(null);

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

  function resetState() {
    setFile(null);
    setAllImportRows([]);
    setSkipDuplicates(true);
    setDuplicateCount(0);
    setRawRecordCount(0);
    setParsingError("");
    setIsImporting(false);
    setCurrentProgress(0);
    setStatusMessage("");
    setImportSummary(null);
  }

  function handleDownloadSample() {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample-components-bulk-import.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleFileProcess(selectedFile: File) {
    setParsingError("");
    setImportSummary(null);
    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setParsingError("Please upload a valid .csv file.");
      return;
    }

    try {
      const text = await selectedFile.text();
      const records = parseCSV(text);
      if (records.length === 0) {
        setParsingError("The CSV file is empty or missing valid rows.");
        return;
      }
      setRawRecordCount(records.length);
      const slugSet = new Set(existingSlugs);
      const res = prepareImportRows(records, categories, slugSet, existingItems);
      setAllImportRows(res.allRows);
      setDuplicateCount(res.duplicateCount);
      setFile(selectedFile);
    } catch (err: unknown) {
      setParsingError(
        err instanceof Error ? err.message : "Failed to parse CSV file."
      );
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  }

  async function handleStartImport() {
    if (parsedRows.length === 0 || isImporting) return;

    setIsImporting(true);
    setCurrentProgress(0);
    setStatusMessage("Starting bulk import...");

    // Get auth token if user is signed in
    let authToken = "";
    try {
      const { data } = await supabase.auth.getSession();
      authToken = data.session?.access_token || "";
    } catch {
      /* ignore */
    }

    const rowsToProcess = parsedRows.filter(
      (r) => !r.error && (!skipDuplicates || !r.isDuplicate)
    );
    if (rowsToProcess.length === 0) {
      alert("No valid non-duplicate rows to import.");
      setIsImporting(false);
      return;
    }

    let successCount = 0;
    let failCount = 0;
    let fallbackCount = 0;
    const errors: { title: string; error: string }[] = [];
    const newCatsCreated = new Set<string>();

    for (let i = 0; i < rowsToProcess.length; i++) {
      const row = rowsToProcess[i];
      const percent = Math.round(((i + 1) / rowsToProcess.length) * 100);
      setCurrentProgress(percent);

      setStatusMessage(
        `Importing ${i + 1} of ${rowsToProcess.length}: "${row.title}" (Processing media & saving)...`
      );

      const res = await importRowItem(row, authToken);
      if (res.success) {
        successCount++;
        if (res.usedFallback) fallbackCount++;
        if (row.isNewCategory) newCatsCreated.add(row.category);
      } else {
        failCount++;
        errors.push({
          title: row.title || `Row ${row.index}`,
          error: res.error || "Unknown error",
        });
      }
    }

    setIsImporting(false);
    setStatusMessage("Import process finished.");
    setImportSummary({
      total: rowsToProcess.length,
      succeeded: successCount,
      failed: failCount,
      fallbacksUsed: fallbackCount,
      categoriesCreated: Array.from(newCatsCreated),
      errors,
    });

    onSuccess();
  }

  if (!open) return null;

  const validRowsCount = parsedRows.filter((r) => !r.error).length;
  const invalidRowsCount = parsedRows.filter((r) => !!r.error).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative my-8 flex max-h-[90vh] w-full max-w-4xl flex-col rounded-[24px] border border-[#27272a] bg-[#111113] text-white shadow-2xl shadow-black/90">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f1f23] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 text-blue-400 ring-1 ring-blue-500/30">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Bulk Import Components (CSV)
              </h2>
              <p className="text-xs text-ink-3">
                Auto-generate slugs, match or create categories, download media into library, and attach prompts.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/sample-components.csv"
              download="sample-components.csv"
              className="cursor-pointer p-0 border-0 bg-transparent text-xs text-zinc-400 hover:text-white underline underline-offset-4 transition"
              title="Download sample CSV template"
            >
              Download sample
            </a>
            <button
              onClick={onClose}
              disabled={isImporting}
              className="cursor-pointer rounded-xl p-2 text-ink-3 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Upload Dropzone (if not uploaded yet or after reset) */}
          {!file && !importSummary && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileProcess(f);
                }}
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
                  dragActive
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-ink-3 group-hover:text-white transition">
                  <UploadCloud size={28} />
                </div>
                <h3 className="text-sm font-bold text-white">
                  Drop your CSV file here, or click to browse
                </h3>
                <p className="mt-1 text-xs text-ink-3">
                  Supported columns: <code className="text-blue-300">title</code>, <code className="text-blue-300">category</code>, <code className="text-blue-300">prompt</code>, <code className="text-blue-300">media_url</code>, <code className="text-blue-300">tech</code>, <code className="text-blue-300">sponsored</code>, <code className="text-blue-300">component_code</code>
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] text-zinc-400">
                    Auto slug generation
                  </span>
                  <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] text-zinc-400">
                    Category auto-creation
                  </span>
                  <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] text-zinc-400">
                    Media library upload
                  </span>
                </div>
                <div className="mt-3.5 pt-1">
                  <span className="text-xs text-ink-3">Need a template? </span>
                  <a
                    href="/sample-components.csv"
                    download="sample-components.csv"
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-pointer p-0 border-0 bg-transparent text-xs text-blue-400 hover:text-blue-300 underline underline-offset-4 transition"
                  >
                    Download sample
                  </a>
                </div>
              </div>

              {parsingError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
                  <AlertCircle size={15} />
                  <span>{parsingError}</span>
                </div>
              )}
            </div>
          )}

          {/* Parsed CSV Preview Table */}
          {file && !importSummary && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-400">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{file.name}</p>
                    <p className="text-[11px] text-ink-3">
                      {(file.size / 1024).toFixed(1)} KB • {rawRecordCount} rows detected ({validRowsCount} ready, {invalidRowsCount} invalid)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setFile(null);
                      setAllImportRows([]);
                      setDuplicateCount(0);
                    }}
                    disabled={isImporting}
                    className="cursor-pointer rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition disabled:opacity-50"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Duplicate filter control banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#161619] px-4 py-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500/20"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white">
                      Filter & Skip Duplicates (by Title or Prompt)
                    </span>
                    <p className="text-[11px] text-ink-3">
                      Automatically skips components that already exist in your directory so only new items show for import.
                    </p>
                  </div>
                </label>
                {duplicateCount > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-[11px] font-medium text-amber-300">
                    <Sparkles size={12} />
                    {duplicateCount} duplicate{duplicateCount > 1 ? "s" : ""} detected ({skipDuplicates ? "skipped from list" : "showing in list"})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-medium text-emerald-300">
                    <CheckCircle2 size={12} />
                    All {allImportRows.length} components are new
                  </span>
                )}
              </div>

              {/* Rules summary notice */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] text-zinc-400">
                <div className="rounded-xl border border-white/5 bg-white/[0.015] p-2.5">
                  <span className="font-semibold text-white block mb-0.5">Slug & Category:</span>
                  Slugs auto-generated from titles. New categories will be auto-created in your database.
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.015] p-2.5">
                  <span className="font-semibold text-white block mb-0.5">Tech & Sponsored:</span>
                  Empty unless provided in CSV. Comma-separated tech & URLs parsed cleanly.
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.015] p-2.5">
                  <span className="font-semibold text-white block mb-0.5">Media Library:</span>
                  Media URLs downloaded directly to Supabase storage. Broken or empty URLs fallback to demo WebP.
                </div>
              </div>

              {/* Rows preview list */}
              <div className="rounded-2xl border border-line bg-black/40 overflow-hidden">
                <div className="border-b border-line bg-white/[0.02] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-3 grid grid-cols-12 gap-2">
                  <span className="col-span-1">#</span>
                  <span className="col-span-4">Title & Slug</span>
                  <span className="col-span-2">Category</span>
                  <span className="col-span-2">Tech Stack</span>
                  <span className="col-span-2">Media</span>
                  <span className="col-span-1 text-right">Status</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto divide-y divide-white/5 text-xs">
                  {parsedRows.map((row) => (
                    <div
                      key={row.index}
                      className={`grid grid-cols-12 gap-2 px-4 py-3 items-center transition ${
                        row.error ? "bg-rose-500/5 text-rose-200" : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <span className="col-span-1 text-ink-3 font-mono text-[11px]">
                        {row.index}
                      </span>
                      <div className="col-span-4 min-w-0 pr-2">
                        <p className="truncate font-semibold text-white flex items-center gap-1.5">
                          <span>{row.title || "(Untitled)"}</span>
                          {row.isDuplicate && (
                            <span
                              className="rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-semibold text-amber-300"
                              title={row.duplicateReason}
                            >
                              Duplicate
                            </span>
                          )}
                        </p>
                        <p className="truncate font-mono text-[10px] text-blue-400/80">/{row.slug}</p>
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5 truncate">
                        <span className="font-medium text-zinc-300">{row.category}</span>
                        {row.isNewCategory ? (
                          <span className="rounded-full bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 text-[9px] font-bold border border-indigo-500/30">
                            NEW
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 text-[9px] font-bold">
                            EXISTING
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 truncate text-ink-3 text-[11px]">
                        {row.tech.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {row.tech.slice(0, 2).map((t, idx) => (
                              <span key={idx} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-300">
                                {t}
                              </span>
                            ))}
                            {row.tech.length > 2 && (
                              <span className="text-[10px] text-ink-3">+{row.tech.length - 2}</span>
                            )}
                          </div>
                        ) : (
                          <span className="italic text-zinc-600">Empty</span>
                        )}
                      </div>
                      <div className="col-span-2 truncate text-[11px]">
                        {row.mediaUrl ? (
                          isStreamingOrPlaylistUrl(row.mediaUrl) ? (
                            <span
                              className="text-amber-400 text-[10px] font-medium"
                              title="Mux/HLS streaming playlist detected - will skip download and use default demo WebP"
                            >
                              Mux (Demo WebP)
                            </span>
                          ) : (
                            <span className="truncate text-blue-300 hover:underline" title={row.mediaUrl}>
                              {row.mediaUrl.split("/").pop()?.slice(0, 18) || "Remote URL"}
                            </span>
                          )
                        ) : (
                          <span className="text-amber-400/80 text-[10px] font-medium">
                            Demo WebP fallback
                          </span>
                        )}
                      </div>
                      <div className="col-span-1 text-right">
                        {row.error ? (
                          <span className="text-rose-400 text-[10px] font-bold" title={row.error}>
                            Error
                          </span>
                        ) : row.isDuplicate ? (
                          <span
                            className="text-amber-400 text-[10px] font-bold"
                            title={row.duplicateReason || "Already exists"}
                          >
                            Exists
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-[10px] font-bold">Ready</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Import progress bar */}
              {isImporting && (
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-blue-300">
                      <Loader2 size={14} className="animate-spin text-blue-400" />
                      {statusMessage}
                    </span>
                    <span className="font-mono font-bold text-white">{currentProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300"
                      style={{ width: `${currentProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Import Summary after completion */}
          {importSummary && (
            <div className="space-y-5 animate-fade-in">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="mt-3 text-base font-bold text-white">
                  Bulk Import Completed
                </h3>
                <p className="mt-1 text-xs text-emerald-200">
                  Successfully imported {importSummary.succeeded} of {importSummary.total} components into your showcase.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-ink-3">Total Rows</p>
                  <p className="text-xl font-black text-white mt-0.5">{importSummary.total}</p>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-emerald-400">Imported</p>
                  <p className="text-xl font-black text-emerald-300 mt-0.5">{importSummary.succeeded}</p>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-amber-400">Fallback Media</p>
                  <p className="text-xl font-black text-amber-300 mt-0.5">{importSummary.fallbacksUsed}</p>
                </div>
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-indigo-400">New Categories</p>
                  <p className="text-xl font-black text-indigo-300 mt-0.5">{importSummary.categoriesCreated.length}</p>
                </div>
              </div>

              {importSummary.categoriesCreated.length > 0 && (
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3.5 text-xs text-indigo-200">
                  <span className="font-bold text-white block mb-1">
                    ✨ New Categories Auto-Created:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {importSummary.categoriesCreated.map((cat, idx) => (
                      <span key={idx} className="rounded-lg bg-indigo-500/20 px-2 py-0.5 font-medium text-indigo-300 border border-indigo-500/30">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {importSummary.errors.length > 0 && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-2">
                  <span className="font-bold text-rose-300 text-xs block">
                    ⚠️ Failed Rows ({importSummary.errors.length}):
                  </span>
                  <ul className="divide-y divide-white/5 text-xs text-rose-200 max-h-32 overflow-y-auto">
                    {importSummary.errors.map((e, idx) => (
                      <li key={idx} className="py-1.5 flex justify-between gap-2">
                        <span className="font-semibold text-white">{e.title}:</span>
                        <span className="text-rose-300">{e.error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#1f1f23] px-6 py-4 bg-[#141416]/50 rounded-b-[24px]">
          <div>
            {file && !importSummary && (
              <span className="text-xs text-ink-3">
                {validRowsCount} ready to import
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isImporting}
              className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition disabled:opacity-50"
            >
              {importSummary ? "Close" : "Cancel"}
            </button>

            {!importSummary && (
              <button
                onClick={handleStartImport}
                disabled={!file || validRowsCount === 0 || isImporting}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-950/40 transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Start Import ({validRowsCount})
                  </>
                )}
              </button>
            )}

            {importSummary && (
              <button
                onClick={onClose}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black transition hover:bg-zinc-200"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
