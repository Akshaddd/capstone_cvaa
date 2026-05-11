"use client";

import { useRouter } from "next/navigation";

const NAV = [
  { label: "Home", route: "/m-home" },
  { label: "Scan", route: "/m-scan" },
  { label: "Map", route: "/m-map" },
  { label: "Reports", route: "/m-report" },
];

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-2">
      <span className="text-sm font-semibold text-emerald-700">9:41</span>
      <div className="flex items-center gap-1.5">
        <div className="h-2.5 w-5 rounded-sm bg-emerald-700" />
        <div className="h-2.5 w-6 rounded-sm border border-slate-300" />
      </div>
    </div>
  );
}

export default function MHomePage() {
  const router = useRouter();

  return (
    <main className="mx-auto min-h-screen max-w-sm bg-slate-50 text-slate-900">
      <div className="bg-white border-b border-slate-200">
        <StatusBar />
        <div className="flex items-center justify-between px-5 pb-4">
          <div>
            <p className="text-xs text-slate-400 font-medium">Good morning</p>
            <h1 className="text-xl font-bold text-slate-900">MyAccess</h1>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">M</div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {/* Score card */}
        <div className="rounded-2xl bg-emerald-700 p-5 text-white">
          <p className="text-xs font-medium opacity-80 uppercase tracking-wide">Accessibility Score Nearby</p>
          <p className="mt-1.5 text-4xl font-bold">87%</p>
          <p className="mt-1 text-sm opacity-75">3 stops within 500m</p>
        </div>

        {/* Map preview */}
        <div
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm cursor-pointer"
          style={{ height: 180 }}
          onClick={() => router.push("/m-map")}
        >
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=145.04,-37.73,145.06,-37.71&layer=mapnik"
            className="pointer-events-none h-full w-full"
            style={{ border: 0 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
              View accessibility map
            </span>
          </div>
        </div>

        {/* Action grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Scan Stop", sub: "Check a stop", route: "/m-scan" },
            { label: "Map", sub: "Browse stops", route: "/m-map" },
            { label: "Reports", sub: "View results", route: "/m-report" },
            { label: "Saved", sub: "Favourite stops", route: "/m-scan" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.route)}
              className="flex flex-col items-start rounded-2xl bg-white border border-slate-200 p-4 shadow-sm transition active:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
              <p className="mt-0.5 text-xs text-slate-400">{item.sub}</p>
            </button>
          ))}
        </div>

        {/* Next route */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Next Route</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">Tram 86 · 6 mins</p>
          <p className="text-xs text-slate-400 mt-0.5">Accessible boarding available</p>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 grid grid-cols-4 border-t border-slate-200 bg-white py-3 text-center text-[11px]">
        {NAV.map((n) => (
          <div
            key={n.label}
            onClick={() => router.push(n.route)}
            className={`cursor-pointer font-medium transition ${n.route === "/m-home" ? "text-emerald-700" : "text-slate-400"}`}
          >
            {n.label}
          </div>
        ))}
      </nav>
    </main>
  );
}