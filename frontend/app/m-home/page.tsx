"use client";

import { useRouter } from "next/navigation";

export default function MHomePage() {
  const router = useRouter();

  return (
    <main className="mx-auto min-h-screen max-w-sm bg-slate-100 text-slate-900">
      <div className="bg-white shadow-sm">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <span className="text-sm font-semibold text-emerald-700">9:41</span>
          <div className="flex gap-2">
            <div className="h-3 w-5 rounded bg-emerald-700" />
            <div className="h-3 w-6 rounded border border-emerald-700" />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <p className="text-xs text-slate-500">Good morning</p>
            <h1 className="text-xl font-bold">MyAccess</h1>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 font-bold text-white text-sm">
            M
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* Score card */}
        <div className="rounded-2xl bg-emerald-700 p-5 text-white">
          <p className="text-sm opacity-90">Accessibility Score Nearby</p>
          <p className="mt-1 text-4xl font-bold">87%</p>
          <p className="mt-1 text-sm opacity-80">3 stops within 500m</p>
        </div>

        {/* Map preview */}
        <div
          className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm cursor-pointer"
          style={{ height: 200 }}
          onClick={() => router.push("/map")}
        >
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=144.95,−37.82,145.05,−37.78&layer=mapnik"
            className="pointer-events-none h-full w-full"
            style={{ border: 0 }}
          />
          <div className="absolute inset-0 flex items-end justify-center pb-3">
            <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
              Tap to explore stops →
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push("/m-scan")}
            className="flex flex-col items-start rounded-2xl bg-white p-4 shadow-sm border border-slate-200 active:bg-slate-50 transition-colors"
          >
            <span className="text-2xl mb-1">📷</span>
            <p className="text-base font-semibold text-slate-900">Scan</p>
            <p className="text-xs text-slate-500">Check a stop</p>
          </button>

          <button
            onClick={() => router.push("/map")}
            className="flex flex-col items-start rounded-2xl bg-white p-4 shadow-sm border border-slate-200 active:bg-slate-50 transition-colors"
          >
            <span className="text-2xl mb-1">🗺️</span>
            <p className="text-base font-semibold text-slate-900">Map</p>
            <p className="text-xs text-slate-500">Nearby routes</p>
          </button>

          <button
            onClick={() => router.push("/m-report")}
            className="flex flex-col items-start rounded-2xl bg-white p-4 shadow-sm border border-slate-200 active:bg-slate-50 transition-colors"
          >
            <span className="text-2xl mb-1">📋</span>
            <p className="text-base font-semibold text-slate-900">Reports</p>
            <p className="text-xs text-slate-500">View results</p>
          </button>

          <button
            onClick={() => router.push("/m-scan")}
            className="flex flex-col items-start rounded-2xl bg-white p-4 shadow-sm border border-slate-200 active:bg-slate-50 transition-colors"
          >
            <span className="text-2xl mb-1">⭐</span>
            <p className="text-base font-semibold text-slate-900">Saved</p>
            <p className="text-xs text-slate-500">Favourite stops</p>
          </button>
        </div>

        {/* Next route */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Next Route</p>
          <p className="mt-1 text-slate-700 font-medium">Tram 86 · 6 mins</p>
          <p className="text-xs text-slate-400 mt-0.5">Accessible boarding available</p>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 grid grid-cols-4 border-t border-slate-200 bg-white py-3 text-center text-[11px]">
        <div className="font-semibold text-emerald-700">Home</div>
        <div onClick={() => router.push("/m-scan")} className="cursor-pointer text-slate-500 active:text-emerald-700">Scan</div>
        <div onClick={() => router.push("/m-report")} className="cursor-pointer text-slate-500 active:text-emerald-700">Reports</div>
        <div onClick={() => router.push("/map")} className="cursor-pointer text-slate-500 active:text-emerald-700">Map</div>
      </nav>
    </main>
  );
}