"use client";

import { useState } from "react";

const checklist = [
  ["Tactile ground surface", "Photo of the boarding zone floor"],
  ["Kerb ramp", "Full ramp including gradient"],
  ["Accessible signage", "Stop sign and route info boards"],
  ["Platform edge / gap", "Close-up of tram boarding gap"],
  ["Path of travel", "Approach from footpath to stop"],
];

function Sidebar() {
  return (
    <aside className="flex w-72 flex-col border-r border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 font-bold text-white">
          M
        </div>
        <div>
          <div className="font-semibold">MyAccess</div>
          <div className="text-xs text-slate-500">Melbourne network</div>
        </div>
      </div>

      <nav className="mt-8 space-y-2">
        <p className="px-3 text-xs font-semibold uppercase text-slate-400">Navigate</p>
        <a href="/map" className="block rounded-xl px-3 py-3 text-slate-600">Accessibility map</a>
        <div className="rounded-xl bg-emerald-50 px-3 py-3 font-medium text-emerald-700">Scan stop</div>

        <p className="px-3 pt-5 text-xs font-semibold uppercase text-slate-400">My data</p>
        <div className="rounded-xl px-3 py-3 text-slate-600">My reports</div>
        <div className="rounded-xl px-3 py-3 text-slate-600">History</div>

        <p className="px-3 pt-5 text-xs font-semibold uppercase text-slate-400">Account</p>
        <div className="rounded-xl px-3 py-3 text-slate-600">Settings</div>
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-300 text-sm font-bold">JD</div>
        <div>
          <div className="text-sm font-semibold">J. Doe</div>
          <div className="text-xs text-slate-500">Public user</div>
        </div>
        <div className="ml-auto h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </div>
    </aside>
  );
}

function PhotoGuide() {
  return (
    <aside className="flex w-80 flex-col border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold">Photo guide</h2>
        <p className="text-xs text-slate-500">What to include in your photos</p>
      </div>

      <div className="flex-1 p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          What to photograph
        </p>

        <div className="space-y-4">
          {checklist.map(([title, detail], index) => (
            <div key={title} className="flex gap-3">
              <div
                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md text-xs text-white ${
                  index === 0 ? "bg-emerald-700" : "border border-slate-300 bg-white"
                }`}
              >
                {index === 0 ? "✓" : ""}
              </div>
              <div>
                <p className={`text-sm font-medium ${index === 0 ? "text-slate-900" : "text-slate-500"}`}>
                  {title}
                </p>
                <p className="text-xs text-slate-400">{detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
          <strong>Tip:</strong> Take photos in good lighting. Include as much of the stop as possible — our AI does the rest.
        </div>
      </div>

      <div className="border-t border-slate-200 p-5">
        <button className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white">
          Analyse photos
        </button>
        <p className="mt-2 text-center text-xs text-slate-400">AI checks all 5 accessibility criteria</p>
      </div>
    </aside>
  );
}

function StopInfo() {
  return (
    <div className="mt-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
      <div>
        <h2 className="font-semibold">Flinders St / Elizabeth St</h2>
        <p className="text-sm text-slate-500">Stop 1 · Routes 70, 75 · CBD, Melbourne</p>
      </div>
      <div className="flex gap-2 text-xs font-medium">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Route 70</span>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Route 75</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">Selected stop</span>
      </div>
    </div>
  );
}

function UploadScreen({ onStart }: { onStart: () => void }) {
  const [count, setCount] = useState(2);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    setCount(Math.min(6, count + files.length));
  }

  return (
    <div className="flex flex-1">
      <section className="flex flex-1 flex-col p-6">
        <div
          className="flex flex-1 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-200 bg-white p-8 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          <div className="mb-5 flex gap-3">
            <div className="relative rounded-xl bg-emerald-700 px-4 py-3 text-xs font-semibold text-white">stop-front.jpg</div>
            <div className="relative rounded-xl bg-sky-500 px-4 py-3 text-xs font-semibold text-white">tactile.jpg</div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-dashed border-slate-300 text-xl text-slate-400">+</div>
          </div>

          <p className="mb-6 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
            {count} / 6 photos
          </p>

          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl text-emerald-700">
            ↑
          </div>

          <h1 className="text-2xl font-bold">Drop photos here to analyse</h1>
          <p className="mt-2 text-slate-500">Drag & drop photos of the stop, or click to browse</p>

          <div className="mt-6 flex items-center gap-3">
            <label className="cursor-pointer rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white">
              Browse files
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
            <span className="text-xs text-slate-400">or paste from clipboard</span>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
            <span className="rounded-full bg-slate-100 px-3 py-1">JPG</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">PNG</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">HEIC</span>
            <span>· Up to 20MB · Max 6 photos</span>
          </div>
        </div>

        <StopInfo />
      </section>

      <PhotoGuide />

      <div className="absolute bottom-8 right-8">
        <button
          onClick={onStart}
          className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg"
        >
          Analyse photos
        </button>
      </div>
    </div>
  );
}

function AnalysisScreen() {
  return (
    <div className="flex flex-1">
      <section className="flex flex-1 flex-col p-6">
        <div className="relative flex-1 overflow-hidden rounded-3xl bg-slate-900 shadow-xl">
          <svg className="h-full w-full" viewBox="0 0 760 460" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b8d4e8" />
                <stop offset="100%" stopColor="#d8eaf4" />
              </linearGradient>
            </defs>

            <rect width="760" height="260" fill="url(#sky)" />
            <rect x="0" y="258" width="760" height="202" fill="#666" />
            <rect x="0" y="258" width="260" height="202" fill="#b8b0a8" />
            <rect x="0" y="258" width="260" height="8" fill="#f0c030" />

            <rect x="60" y="266" width="140" height="12" rx="2" fill="#d4a820" />
            <rect x="30" y="170" width="180" height="90" rx="2" fill="#e8e0d8" />
            <rect x="172" y="128" width="54" height="36" rx="4" fill="#2a5ca8" />
            <text x="199" y="142" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">STOP 1</text>
            <rect x="470" y="200" width="290" height="120" rx="6" fill="#1a6080" />

            <rect x="58" y="262" width="148" height="28" rx="3" fill="none" stroke="#0D7A5F" strokeWidth="2" strokeDasharray="6 3" />
            <rect x="58" y="248" width="120" height="16" rx="3" fill="#0D7A5F" />
            <text x="64" y="259" fill="white" fontSize="9" fontWeight="500">Tactile surface ✓ 97%</text>

            <rect x="2" y="254" width="56" height="100" rx="3" fill="none" stroke="#0D7A5F" strokeWidth="2" strokeDasharray="6 3" />
            <rect x="168" y="124" width="62" height="44" rx="3" fill="none" stroke="#E8A020" strokeWidth="2" strokeDasharray="6 3" />
            <rect x="254" y="252" width="180" height="14" rx="3" fill="none" stroke="#D94040" strokeWidth="2.5" strokeDasharray="6 3" />
          </svg>

          <div className="absolute left-4 top-4 flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
            <span className="text-xs font-semibold tracking-wider text-emerald-300">Analysing photo...</span>
          </div>

          <div className="absolute right-4 top-4 rounded-xl bg-black/50 px-4 py-2 text-white backdrop-blur">
            <p className="text-xs text-emerald-200">stop-front.jpg</p>
            <p className="text-sm font-semibold">Flinders St / Elizabeth St</p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent p-5">
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-white">
              <span className="rounded-lg bg-emerald-700 px-3 py-1">✓ Tactile surface</span>
              <span className="rounded-lg bg-emerald-700 px-3 py-1">✓ Kerb ramp</span>
              <span className="rounded-lg bg-yellow-600 px-3 py-1">⚠ Signage</span>
              <span className="rounded-lg bg-red-600 px-3 py-1">✗ Platform gap 82mm</span>
            </div>
          </div>
        </div>

        <StopInfo />

        <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">AI analysis in progress</h2>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">2 / 5 checks</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Tactile ground surface", "Compliant — detected", "done"],
              ["Kerb ramp present", "Present — within gradient", "done"],
              ["Accessible signage", "Scanning...", "active"],
              ["Platform gap clearance", "Waiting", "pending"],
              ["Audio announcement system", "Waiting", "pending"],
            ].map(([title, status, state]) => (
              <div key={title} className="flex gap-3">
                <div
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md text-xs text-white ${
                    state === "done"
                      ? "bg-emerald-700"
                      : state === "active"
                      ? "animate-pulse bg-yellow-500"
                      : "border border-slate-300 bg-white"
                  }`}
                >
                  {state === "done" ? "✓" : ""}
                </div>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-slate-500">{status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PhotoGuide />
    </div>
  );
}

export default function ScanPage() {
  const [screen, setScreen] = useState<"upload" | "analysis">("upload");

  return (
    <main className="flex min-h-screen bg-slate-100 text-slate-900">
      <Sidebar />

      <section className="relative flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <a href="/map" className="text-sm text-slate-500">← Back to map</a>
            <span className="text-slate-300">|</span>
            <div>
              <h1 className="text-xl font-bold">Scan stop</h1>
              <p className="text-sm text-slate-500">Flinders St / Elizabeth St — Stop 1</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">Change stop</button>
            <button
              onClick={() => setScreen("analysis")}
              className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Analyse photos
            </button>
          </div>
        </header>

        {screen === "upload" ? <UploadScreen onStart={() => setScreen("analysis")} /> : <AnalysisScreen />}
      </section>
    </main>
  );
}
