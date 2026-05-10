"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const CHECKLIST = [
  ["Tactile ground surface", "Boarding zone floor"],
  ["Kerb ramp", "Full ramp including gradient"],
  ["Accessible signage", "Stop sign and route boards"],
  ["Platform edge / gap", "Close-up of boarding gap"],
  ["Path of travel", "Approach from footpath to stop"],
];

export default function MobileScanPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
    if (files.length === 0) {
      setError("Add at least one photo first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const res = await fetch("http://localhost:8000/inference/scan-combined", {
        method: "POST",
        body: formData,
      });
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

  return (
    <main className="mx-auto min-h-screen max-w-sm bg-white text-slate-900">
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1">
        <span className="text-sm font-semibold text-emerald-700">9:41</span>
        <div className="flex gap-2">
          <div className="h-3 w-5 rounded bg-emerald-700" />
          <div className="h-3 w-6 rounded border border-emerald-700" />
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div>
          <h1 className="text-base font-bold text-slate-900">Scan Stop</h1>
          <p className="text-xs text-slate-500">Take photos to check accessibility</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          {files.length}/6
        </span>
      </header>

      <div className="space-y-4 p-4">
        {/* Camera buttons - primary action */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-emerald-700 py-6 text-white active:opacity-80 transition-opacity"
          >
            <span className="text-3xl">📷</span>
            <span className="text-sm font-semibold">Open Camera</span>
            <span className="text-[11px] opacity-75">Take a photo now</span>
          </button>

          <button
            onClick={() => galleryRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white py-6 text-slate-700 active:bg-slate-50 transition-colors"
          >
            <span className="text-3xl">🖼️</span>
            <span className="text-sm font-semibold">Browse Gallery</span>
            <span className="text-[11px] text-slate-400">Choose existing photos</span>
          </button>
        </div>

        {/* Hidden inputs */}
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />

        {/* Photo thumbnails */}
        {files.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-600">{files.length} photo{files.length > 1 ? "s" : ""} added</p>
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200">
                  <img src={URL.createObjectURL(f)} alt={f.name} className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
              {files.length < 6 && (
                <button
                  onClick={() => galleryRef.current?.click()}
                  className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-2xl text-slate-400"
                >
                  +
                </button>
              )}
            </div>
          </div>
        )}

        {/* Selected stop */}
        <div className="rounded-2xl bg-emerald-50 p-3.5">
          <p className="text-sm font-semibold text-slate-900">Flinders St / Elizabeth St</p>
          <p className="text-xs text-slate-500">Stop 1 · Routes 70, 75 · CBD</p>
          <span className="mt-2 inline-block rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm">
            Selected stop
          </span>
        </div>

        {/* Checklist */}
        <div>
          <h3 className="mb-2.5 text-sm font-semibold text-slate-900">What to photograph</h3>
          <div className="space-y-2">
            {CHECKLIST.map(([label, hint], i) => {
              const done = i < files.length;
              return (
                <div key={label} className={`flex gap-3 rounded-xl border p-3 transition-colors ${done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-xs font-bold ${done ? "bg-emerald-700 text-white" : "border border-slate-300 bg-white text-transparent"}`}>
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{label}</p>
                    <p className="text-xs text-slate-500">{hint}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}

        {/* Analyse button */}
        <div className="space-y-2 pb-6">
          <button
            onClick={handleAnalyse}
            disabled={loading || files.length === 0}
            className={`w-full rounded-2xl py-4 text-sm font-bold text-white transition-all ${loading || files.length === 0 ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-700 active:opacity-80 shadow-lg shadow-emerald-200"}`}
          >
            {loading ? "Analysing…" : `Analyse ${files.length > 0 ? files.length + " photo" + (files.length > 1 ? "s" : "") : "photos"}`}
          </button>
          <p className="text-center text-xs text-slate-400">AI checks all 5 DSAPT accessibility criteria</p>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 grid grid-cols-4 border-t border-slate-200 bg-white py-3 text-center text-[11px]">
        <div onClick={() => router.push("/m-home")} className="cursor-pointer text-slate-500 active:text-emerald-700">Home</div>
        <div className="font-semibold text-emerald-700">Scan</div>
        <div onClick={() => router.push("/m-report")} className="cursor-pointer text-slate-500 active:text-emerald-700">Reports</div>
        <div onClick={() => router.push("/map")} className="cursor-pointer text-slate-500 active:text-emerald-700">Map</div>
      </nav>
    </main>
  );
}