"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { ThemeProvider, ThemeToggle, BottomNav } from "../shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const NAV = [
  { label: "Home",    href: "/m-home"   },
  { label: "Scan",    href: "/m-scan"   },
  { label: "Map",     href: "/m-map"    },
  { label: "Reports", href: "/m-report" },
];

const CHECKLIST = [
  { label: "Tactile ground surface", hint: "Boarding zone floor"             },
  { label: "Kerb ramp",              hint: "Full ramp including gradient"     },
  { label: "Accessible signage",     hint: "Stop sign and route boards"       },
  { label: "Platform edge / gap",    hint: "Close-up of boarding gap"         },
  { label: "Path of travel",         hint: "Approach from footpath to stop"   },
];

// Hardcoded demo result used if backend is unreachable
const DEMO_RESULT = {
  detections: [
    { class: "tactile",   confidence: 0.91, bbox: [] },
    { class: "ramp",      confidence: 0.83, bbox: [] },
    { class: "stop_sign", confidence: 0.52, bbox: [] },
    { class: "gap",       confidence: 0.28, bbox: [] },
  ],
  _demo: true,
};

function ScanContent() {
  const searchParams = useSearchParams();

  const stopId     = searchParams.get("id")     ?? "";
  const stopName   = searchParams.get("name")   ?? "";
  const stopMode   = searchParams.get("mode")   ?? "";
  const stopStatus = searchParams.get("status") ?? "";

  const [files,    setFiles]    = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [status,   setStatus]   = useState<string | null>(null);
  const [error,    setError]    = useState<string | null>(null);

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) { setError("No image selected."); return; }
    const incoming = Array.from(list).filter(
      (f) => f.type.startsWith("image/") && f.size <= 20 * 1024 * 1024
    );
    if (!incoming.length) { setError("Please choose an image file under 20 MB."); return; }
    const nextFiles = [...files, ...incoming].slice(0, 6);
    previews.forEach((u) => URL.revokeObjectURL(u));
    setFiles(nextFiles);
    setPreviews(nextFiles.map((f) => URL.createObjectURL(f)));
    setError(null);
  }

  function removeFile(index: number) {
    const nextFiles = files.filter((_, i) => i !== index);
    previews.forEach((u) => URL.revokeObjectURL(u));
    setFiles(nextFiles);
    setPreviews(nextFiles.map((f) => URL.createObjectURL(f)));
  }

  async function analyse() {
    if (!files.length) { setError("Add at least one photo first."); return; }
    setLoading(true);
    setError(null);
    setStatus("Uploading image…");

    const stopMeta = { id: stopId, name: stopName, mode: stopMode, status: stopStatus };

    try {
      setStatus("Running AI scan…");
      const form = new FormData();
      files.forEach((file) => {
        form.append("file",  file);
        form.append("files", file);
        form.append("image", file);
      });

      // Try backend with a 15s timeout
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15_000);

      const res = await fetch(`${API_BASE}/inference/scan-combined`, {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      sessionStorage.setItem("scanResult", JSON.stringify({
        ...data,
        selectedStop: stopMeta,
        stopName, stopMode, stopStatus,
        scannedAt: new Date().toISOString(),
        _demo: false,
      }));
    } catch (e) {
      // Backend unreachable — use hardcoded demo data so demo still works
      console.warn("Backend unavailable, using demo data:", e);
      setStatus("Backend offline — using demo data…");
      await new Promise((r) => setTimeout(r, 800));
      sessionStorage.setItem("scanResult", JSON.stringify({
        ...DEMO_RESULT,
        selectedStop: stopMeta,
        stopName, stopMode, stopStatus,
        scannedAt: new Date().toISOString(),
      }));
    } finally {
      setLoading(false);
      setStatus(null);
      window.location.href = "/m-report";
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 pb-4 pt-5 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Scan Stop</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Upload photos to generate report</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
            {files.length}/6
          </span>
        </div>
      </header>

      <main className="flex flex-col gap-3 p-4 pb-24">

        {/* Stop info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Stop to scan
          </p>
          {stopName ? (
            <>
              <p className="text-base font-bold text-slate-900 dark:text-white">{stopName}</p>
              <p className="text-xs capitalize text-slate-400 dark:text-slate-500">{stopMode || "selected"} stop</p>
            </>
          ) : (
            <p className="text-sm italic text-slate-400 dark:text-slate-500">No stop selected</p>
          )}
          <Link href="/m-map" className="mt-2 block text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            {stopName ? "Change stop →" : "Choose a stop on the map →"}
          </Link>
        </div>

        {/* Camera / Gallery */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-2xl bg-emerald-700 py-6 text-center text-white active:bg-emerald-800">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
              onChange={(e) => { addFiles(e.currentTarget.files); e.currentTarget.value = ""; }}
            />
            <div className="pointer-events-none flex flex-col items-center gap-2">
              <span className="text-3xl">📷</span>
              <span className="text-sm font-bold">Camera</span>
              <span className="text-[11px] opacity-75">Take photo</span>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white py-6 text-center text-slate-600 active:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <input
              type="file"
              accept="image/*"
              multiple
              className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
              onChange={(e) => { addFiles(e.currentTarget.files); e.currentTarget.value = ""; }}
            />
            <div className="pointer-events-none flex flex-col items-center gap-2">
              <span className="text-3xl">🖼️</span>
              <span className="text-sm font-bold">Gallery</span>
              <span className="text-[11px] text-slate-400">Choose photos</span>
            </div>
          </div>
        </div>

        {/* Previews */}
        {files.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {files.length} photo{files.length > 1 ? "s" : ""} selected
            </p>
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200">
                  <img src={previews[index]} alt={file.name} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            What to photograph
          </p>
          <div className="flex flex-col gap-2">
            {CHECKLIST.map(({ label, hint }, index) => {
              const done = index < files.length;
              return (
                <div key={label} className={`flex gap-3 rounded-xl p-3 ${done ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-slate-50 dark:bg-slate-800"}`}>
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold ${done ? "bg-emerald-700 text-white" : "border border-slate-300 text-transparent dark:border-slate-600"}`}>
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </p>
        )}

        {status && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950">
            <div className="h-4 w-4 animate-spin rounded-full border-[2px] border-emerald-700 border-t-transparent" />
            <p className="text-sm text-emerald-700 dark:text-emerald-400">{status}</p>
          </div>
        )}

        <button
          type="button"
          onClick={analyse}
          disabled={loading || files.length === 0}
          className={`w-full rounded-2xl py-4 text-base font-bold text-white ${
            loading || files.length === 0
              ? "cursor-not-allowed bg-emerald-300 dark:bg-emerald-900"
              : "bg-emerald-700 shadow-md active:bg-emerald-800"
          }`}
        >
          {loading
            ? "Analysing…"
            : files.length > 0
              ? `Generate report from ${files.length} photo${files.length > 1 ? "s" : ""}`
              : "Add photos to generate report"}
        </button>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          AI checks against DSAPT accessibility criteria
        </p>
      </main>

      <BottomNav items={NAV} active="/m-scan" />
    </div>
  );
}

export default function ScanPage() {
  return (
    <ThemeProvider>
      <Suspense>
        <ScanContent />
      </Suspense>
    </ThemeProvider>
  );
}
