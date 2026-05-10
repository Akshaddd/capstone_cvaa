"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const CHECKLIST = [
  ["Tactile ground surface", "Photo of the boarding zone floor"],
  ["Kerb ramp", "Full ramp including gradient"],
  ["Accessible signage", "Stop sign and route info boards"],
  ["Platform edge / gap", "Close-up of boarding gap"],
  ["Path of travel", "Approach from footpath to stop"],
];

export default function MobileScanPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFiles(selected: FileList | null) {
    if (!selected) return;
    const newFiles = Array.from(selected).filter(
      (f) => f.size <= 20 * 1024 * 1024
    );
    setFiles((prev) => [...prev, ...newFiles].slice(0, 6));
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleAnalyse() {
    if (files.length === 0) {
      setError("Please upload at least one photo.");
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

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();

      // Store result and go to report page
      sessionStorage.setItem("scanResult", JSON.stringify(data));
      router.push("/m-report");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-sm bg-white text-slate-900 shadow-2xl">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-sm font-semibold text-emerald-700">9:41</span>
        <div className="flex gap-2">
          <div className="h-3 w-5 rounded bg-emerald-700" />
          <div className="h-3 w-6 rounded border border-emerald-700" />
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h1 className="text-sm font-semibold">Scan stop</h1>
          <p className="text-xs text-slate-500">Upload photos to analyse</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
          {files.length}/6 photos
        </span>
      </header>

      <div className="space-y-4 px-4 py-4">
        {/* Upload area */}
        <section
          className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 cursor-pointer"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          {/* Thumbnails */}
          {files.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="relative flex h-12 w-16 items-center justify-center rounded-lg bg-emerald-700 text-[8px] text-white overflow-hidden"
                >
                  <img
                    src={URL.createObjectURL(f)}
                    alt={f.name}
                    className="h-full w-full object-cover rounded-lg"
                  />
                  <button
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(i);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {files.length < 6 && (
                <div className="flex h-12 w-16 items-center justify-center rounded-lg border border-dashed text-xl text-slate-400">
                  +
                </div>
              )}
            </div>
          )}

          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-xl text-emerald-700">
              ↑
            </div>
            <h2 className="text-sm font-semibold">Drop photos here</h2>
            <p className="mt-1 text-xs text-slate-500">
              Or tap Browse to add photos
            </p>
            <button className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">
              Browse files
            </button>
            <div className="mt-4 flex justify-center gap-2 text-[10px] text-slate-500">
              <span className="rounded bg-white px-2 py-1">JPG</span>
              <span className="rounded bg-white px-2 py-1">PNG</span>
              <span className="rounded bg-white px-2 py-1">HEIC</span>
              <span className="px-2 py-1">≤20MB</span>
            </div>
          </div>
        </section>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Selected stop */}
        <section className="rounded-2xl bg-emerald-50 p-3">
          <p className="text-sm font-semibold">Flinders St / Elizabeth St</p>
          <p className="text-xs text-slate-500">Stop 1 · Routes 70, 75 · CBD</p>
          <span className="mt-2 inline-block rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-emerald-700">
            Selected stop
          </span>
        </section>

        {/* Checklist */}
        <section>
          <h3 className="mb-3 text-sm font-semibold">What to photograph</h3>
          <div className="space-y-3">
            {CHECKLIST.map(([label, hint], i) => {
              const done = i < files.length;
              return (
                <div
                  key={label}
                  className="flex gap-3 rounded-2xl border border-slate-200 p-3"
                >
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-xs ${
                      done
                        ? "bg-emerald-700 text-white"
                        : "border border-slate-300 bg-white"
                    }`}
                  >
                    {done ? "✓" : ""}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-slate-500">{hint}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Error */}
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        )}

        {/* Analyse button */}
        <section className="space-y-2 pb-6">
          <button
            onClick={handleAnalyse}
            disabled={loading || files.length === 0}
            className={`w-full rounded-2xl py-3 text-sm font-semibold text-white transition-opacity ${
              loading || files.length === 0
                ? "bg-emerald-300 opacity-60 cursor-not-allowed"
                : "bg-emerald-700"
            }`}
          >
            {loading ? "Analysing…" : "Analyse photos"}
          </button>
          <p className="text-center text-xs text-slate-500">
            AI checks all 5 accessibility criteria
          </p>
        </section>
      </div>

      {/* Bottom nav */}
      <nav className="grid grid-cols-4 border-t bg-white py-3 text-center text-[11px]">
        <div className="text-slate-500">Map</div>
        <div className="font-medium text-emerald-700">Scan</div>
        <div className="text-slate-500">Reports</div>
        <div className="text-slate-500">Profile</div>
      </nav>
    </main>
  );
}