"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar, PageHeader, USER_NAV } from "../shared-desktop";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const CHECKLIST = [
  { label: "Tactile ground surface", hint: "Boarding zone floor"         },
  { label: "Kerb ramp",              hint: "Full ramp including gradient" },
  { label: "Accessible signage",     hint: "Stop sign and route boards"   },
  { label: "Platform edge / gap",    hint: "Close-up of boarding gap"     },
  { label: "Path of travel",         hint: "Approach from footpath"       },
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
    const valid = Array.from(list).filter((f) => f.type.startsWith("image/") && f.size <= 20 * 1024 * 1024);
    if (!valid.length) { setError("Please choose an image under 20 MB."); return; }
    const next = [...files, ...valid].slice(0, 6);
    previews.forEach(URL.revokeObjectURL);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
    setError(null);
  }

  function removeFile(i: number) {
    const next = files.filter((_, j) => j !== i);
    previews.forEach(URL.revokeObjectURL);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  async function analyse() {
    if (!files.length) { setError("Add at least one photo first."); return; }
    setLoading(true); setError(null);
    const stopMeta = { id: stopId, name: stopName, mode: stopMode, status: stopStatus };
    try {
      setStatus("Running AI scan...");
      const form = new FormData();
      files.forEach((f) => { form.append("file", f); form.append("files", f); });
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15_000);
      const res = await fetch(`${API_BASE}/inference/scan-combined`, { method: "POST", body: form, signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      sessionStorage.setItem("scanResult", JSON.stringify({ ...data, selectedStop: stopMeta, scannedAt: new Date().toISOString(), _demo: false }));
    } catch {
      setStatus("Backend offline — using demo data...");
      await new Promise((r) => setTimeout(r, 600));
      sessionStorage.setItem("scanResult", JSON.stringify({ ...DEMO_RESULT, selectedStop: stopMeta, scannedAt: new Date().toISOString() }));
    } finally {
      setLoading(false); setStatus(null);
      window.location.href = "/d-report";
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar nav={USER_NAV} active="/d-scan" user={{ initials: "JD", name: "J. Doe", role: "Public user" }} />

      <div className="flex flex-1 flex-col min-w-0">
        <PageHeader
          title="Scan Stop"
          subtitle={stopName || "No stop selected"}
          actions={
            <div className="flex items-center gap-3">
              <a href="/d-map" className="text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
                {stopName ? "Change stop" : "Choose a stop"}
              </a>
              <button
                onClick={analyse}
                disabled={loading || files.length === 0}
                className={`text-sm font-semibold px-4 py-2 rounded-xl ${
                  loading || files.length === 0
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-700 text-white hover:bg-emerald-800"
                }`}
              >
                {loading ? "Analysing..." : `Analyse ${files.length > 0 ? `${files.length} photo${files.length > 1 ? "s" : ""}` : "photos"}`}
              </button>
            </div>
          }
        />

        <div className="flex flex-1 min-h-0">

          <div className="flex-1 flex flex-col p-6 gap-4">

            <div
              className="flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            >
              {files.length === 0 ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Drop photos here</h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mb-5">Drag and drop photos of the stop, or click to browse</p>
                  <label className="cursor-pointer bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-800">
                    Browse files
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                  </label>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">JPG, PNG, HEIC — up to 20 MB — max 6 photos</p>
                </>
              ) : (
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{files.length} / 6 photos selected</p>
                    <label className="cursor-pointer text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                      Add more
                      <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {files.map((file, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800">
                        <img src={previews[i]} alt={file.name} className="w-full h-full object-cover" />
                        <button onClick={() => removeFile(i)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">{error}</p>}
            {status && (
              <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                <div className="w-4 h-4 rounded-full border-2 border-emerald-700 border-t-transparent animate-spin flex-shrink-0" />
                <p className="text-sm text-emerald-700 dark:text-emerald-400">{status}</p>
              </div>
            )}
          </div>

          <aside className="w-72 flex-shrink-0 flex flex-col border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-white">Photo guide</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">What to photograph</p>
            </div>
            <div className="flex-1 p-5 flex flex-col gap-3">
              {CHECKLIST.map(({ label, hint }, i) => {
                const done = i < files.length;
                return (
                  <div key={label} className={`flex gap-3 rounded-xl p-3 ${done ? "bg-emerald-50 dark:bg-emerald-950" : "bg-slate-50 dark:bg-slate-800"}`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${done ? "bg-emerald-700 text-white" : "border border-slate-300 dark:border-slate-600"}`}>
                      {done ? "✓" : ""}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-5 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center">AI checks all 5 DSAPT criteria</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function DesktopScanPage() {
  return <Suspense><ScanContent /></Suspense>;
}