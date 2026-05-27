"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ThemeToggle, BottomNav } from "../shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const NAV = [
  { label: "Home",    href: "/m-home"    },
  { label: "Scan",    href: "/m-scan"    },
  { label: "Map",     href: "/m-map"     },
  { label: "Reports", href: "/m-reports" },
];

const CHECKLIST = [
  { label: "Tactile ground surface", hint: "Boarding zone floor"          },
  { label: "Kerb ramp",              hint: "Full ramp including gradient"  },
  { label: "Accessible signage",     hint: "Stop sign and route boards"    },
  { label: "Platform edge / gap",    hint: "Close-up of boarding gap"      },
  { label: "Path of travel",         hint: "Approach from footpath"        },
];

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
  const params     = useSearchParams();
  const stopId     = params.get("id")     ?? "";
  const stopName   = params.get("name")   ?? "";
  const stopMode   = params.get("mode")   ?? "";
  const stopStatus = params.get("status") ?? "";

  const [files,   setFiles]   = useState<File[]>([]);
  const [previews,setPreviews]= useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status,  setStatus]  = useState<string | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  function handleFiles(list: FileList | null) {
    if (!list?.length) return;
    const valid = Array.from(list).filter(
      (f) => f.type.startsWith("image/") && f.size <= 20 * 1024 * 1024
    );
    if (!valid.length) { setError("Please choose an image under 20 MB."); return; }
    const next = [...files, ...valid].slice(0, 6);
    previews.forEach(URL.revokeObjectURL);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
    setError(null);
  }

  function removeFile(index: number) {
    const next = files.filter((_, i) => i !== index);
    previews.forEach(URL.revokeObjectURL);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  async function analyse() {
    if (!files.length) { setError("Add at least one photo first."); return; }
    setLoading(true);
    setError(null);

    const stopMeta = { id: stopId, name: stopName, mode: stopMode, status: stopStatus };

    try {
      setStatus("Running AI scan...");
      const form = new FormData();
      files.forEach((f) => { form.append("file", f); form.append("files", f); });

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15_000);
      const res = await fetch(`${API_BASE}/inference/scan-combined`, {
        method: "POST",
        body: form,
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const data = await res.json();
      sessionStorage.setItem("scanResult", JSON.stringify({
        ...data,
        selectedStop: stopMeta,
        scannedAt: new Date().toISOString(),
        _demo: false,
      }));
    } catch {
      setStatus("Backend offline — using demo data...");
      await new Promise((r) => setTimeout(r, 600));
      sessionStorage.setItem("scanResult", JSON.stringify({
        ...DEMO_RESULT,
        selectedStop: stopMeta,
        scannedAt: new Date().toISOString(),
      }));
    } finally {
      setLoading(false);
      setStatus(null);
      window.location.href = "/m-report";
    }
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">

      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-5 py-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Scan Stop</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Upload photos to generate report</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 rounded-full px-3 py-1">
            {files.length}/6
          </span>
        </div>
      </header>

      <main className="flex flex-col gap-3 p-4 pb-24">

        {/* Stop info */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
            Stop to scan
          </p>
          {stopName ? (
            <>
              <p className="text-base font-bold text-slate-900 dark:text-white">{stopName}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 capitalize mt-0.5">{stopMode} stop</p>
            </>
          ) : (
            <p className="text-sm italic text-slate-400 dark:text-slate-500">No stop selected</p>
          )}
          <a href="/m-map" className="block mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            {stopName ? "Change stop →" : "Choose a stop on the map →"}
          </a>
        </div>

        {/* Camera / Gallery */}
        <div className="grid grid-cols-2 gap-3">
          <label className="relative bg-emerald-700 rounded-2xl py-6 text-center text-white cursor-pointer block">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              onChange={(e) => { handleFiles(e.currentTarget.files); e.currentTarget.value = ""; }}
            />
            <p className="text-sm font-bold">Camera</p>
            <p className="text-xs opacity-70 mt-0.5">Take photo</p>
          </label>
          <label className="relative bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-6 text-center cursor-pointer block">
            <input
              type="file"
              accept="image/*"
              multiple
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              onChange={(e) => { handleFiles(e.currentTarget.files); e.currentTarget.value = ""; }}
            />
            <p className="text-sm font-bold text-slate-900 dark:text-white">Gallery</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Choose photos</p>
          </label>
        </div>

        {/* Previews */}
        {files.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              {files.length} photo{files.length > 1 ? "s" : ""} selected
            </p>
            <div className="flex flex-wrap gap-2">
              {files.map((file, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src={previews[i]} alt={file.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
            What to photograph
          </p>
          <div className="flex flex-col gap-2">
            {CHECKLIST.map(({ label, hint }, i) => {
              const done = i < files.length;
              return (
                <div
                  key={label}
                  className={`flex gap-3 rounded-xl p-3 ${
                    done
                      ? "bg-emerald-50 dark:bg-emerald-950"
                      : "bg-slate-50 dark:bg-slate-800"
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                    done
                      ? "bg-emerald-700 text-white"
                      : "border border-slate-300 dark:border-slate-600 text-transparent"
                  }`}>
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

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Loading status */}
        {status && (
          <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
            <div className="w-4 h-4 rounded-full border-2 border-emerald-700 border-t-transparent animate-spin flex-shrink-0" />
            <p className="text-sm text-emerald-700 dark:text-emerald-400">{status}</p>
          </div>
        )}

        {/* Analyse button */}
        <button
          onClick={analyse}
          disabled={loading || files.length === 0}
          className={`w-full rounded-2xl py-4 text-base font-bold text-white ${
            loading || files.length === 0
              ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
              : "bg-emerald-700 active:bg-emerald-800"
          }`}
        >
          {loading
            ? "Analysing..."
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
    <Suspense>
      <ScanContent />
    </Suspense>
  );
}