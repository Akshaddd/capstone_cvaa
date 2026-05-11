"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";

const CHECKLIST = [
  ["Tactile ground surface", "Boarding zone floor"],
  ["Kerb ramp", "Full ramp including gradient"],
  ["Accessible signage", "Stop sign and route boards"],
  ["Platform edge / gap", "Close-up of boarding gap"],
  ["Path of travel", "Approach from footpath to stop"],
];

const NAV = [
  { label: "Home", route: "/m-home" },
  { label: "Scan", route: "/m-scan" },
  { label: "Map", route: "/m-map" },
  { label: "Reports", route: "/m-report" },
];

export default function MobileScanPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<{ id: string; name: string; mode: string } | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("selectedStop");
      if (raw) setSelectedStop(JSON.parse(raw));
    } catch {}
  }, []);

  function handleFiles(selected: FileList | null) {
    if (!selected) return;
    const valid = Array.from(selected).filter((f) => f.size <= 20 * 1024 * 1024);
    setFiles((prev) => [...prev, ...valid].slice(0, 6));
    setError(null);
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleAnalyse() {
    if (files.length === 0) { setError("Add at least one photo first."); return; }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("file", f));
      const res = await fetch("http://localhost:8000/inference/scan-combined", { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Backend error: ${res.status}`);
      const data = await res.json();
      sessionStorage.setItem("scanResult", JSON.stringify(data));
      router.push("/m-report");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const stopName = selectedStop?.name ?? "Stop 301 — Reservoir Station";
  const stopSub = selectedStop ? `${selectedStop.mode} stop` : "Bundoora / La Trobe · Tram Route 86";

  return (
    <main className="mx-auto min-h-screen max-w-sm bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-sm font-semibold text-emerald-700">9:41</span>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-5 rounded-sm bg-emerald-700" />
            <div className="h-2.5 w-6 rounded-sm border border-slate-300" />
          </div>
        </div>
        <div className="flex items-center justify-between px-5 pb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Scan Stop</h1>
            <p className="text-xs text-slate-400">Upload photos to check accessibility</p>
          </div>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            {files.length}/6
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {/* Camera / Gallery buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-emerald-700 py-5 text-white transition active:opacity-80"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="text-sm font-semibold">Camera</span>
            <span className="text-[11px] opacity-70">Take a photo</span>
          </button>

          <button
            onClick={() => galleryRef.current?.click()}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-slate-200 bg-white py-5 text-slate-600 transition active:bg-slate-50"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-sm font-semibold">Gallery</span>
            <span className="text-[11px] text-slate-400">Choose photo</span>
          </button>
        </div>

        <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />

        {/* Thumbnails */}
        {files.length > 0 && (
          <div className="rounded-2xl bg-white border border-slate-200 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">{files.length} photo{files.length > 1 ? "s" : ""} selected</p>
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative h-14 w-14 overflow-hidden rounded-xl border border-slate-200">
                  <img src={URL.createObjectURL(f)} alt={f.name} className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                  >×</button>
                </div>
              ))}
              {files.length < 6 && (
                <button
                  onClick={() => galleryRef.current?.click()}
                  className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-xl text-slate-400"
                >+</button>
              )}
            </div>
          </div>
        )}

        {/* Selected stop */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Selected stop</p>
          <p className="text-sm font-semibold text-slate-900">{stopName}</p>
          <p className="text-xs text-slate-400">{stopSub}</p>
          <button
            onClick={() => router.push("/m-map")}
            className="mt-2 text-xs font-semibold text-emerald-700"
          >
            Change stop
          </button>
        </div>

        {/* Checklist */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4">
          <p className="mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">What to photograph</p>
          <div className="space-y-2">
            {CHECKLIST.map(([label, hint], i) => {
              const done = i < files.length;
              return (
                <div key={label} className={`flex gap-3 rounded-xl p-3 transition-colors ${done ? "bg-emerald-50" : "bg-slate-50"}`}>
                  <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-bold ${done ? "bg-emerald-700 text-white" : "border border-slate-300 text-transparent"}`}>
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{label}</p>
                    <p className="text-[10px] text-slate-400">{hint}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
        )}

        {/* Analyse button */}
        <div className="pb-6">
          <button
            onClick={handleAnalyse}
            disabled={loading || files.length === 0}
            className={`w-full rounded-2xl py-4 text-sm font-bold text-white transition-all ${
              loading || files.length === 0
                ? "bg-emerald-300 cursor-not-allowed"
                : "bg-emerald-700 shadow-md active:opacity-80"
            }`}
          >
            {loading ? "Analysing…" : `Analyse ${files.length > 0 ? files.length + " photo" + (files.length > 1 ? "s" : "") : "photos"}`}
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-400">AI checks 5 DSAPT accessibility criteria</p>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 grid grid-cols-4 border-t border-slate-200 bg-white py-3 text-center text-[11px]">
        {NAV.map((n) => (
          <div key={n.label} onClick={() => router.push(n.route)} className={`cursor-pointer font-medium ${n.route === "/m-scan" ? "text-emerald-700" : "text-slate-400"}`}>
            {n.label}
          </div>
        ))}
      </nav>
    </main>
  );
}