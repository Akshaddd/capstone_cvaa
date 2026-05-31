"use client";

import { ThemeToggle, BottomNav, StatusBadge } from "../shared";
import rawStops from "../data/stops.json";

type Stop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  mode: "tram" | "bus";
  status: "mostly_accessible" | "partial_access" | "review_required";
  features: string[];
  notes: string;
};

const ALL_STOPS = rawStops as Stop[];

const NEARBY = ALL_STOPS.filter(
  (s) =>
    s.lat > -37.726 &&
    s.lat < -37.700 &&
    s.lng > 145.044 &&
    s.lng < 145.062
).slice(0, 4);

const NAV = [
  { label: "Home",    href: "/m-home"    },
  { label: "Scan",    href: "/m-scan"    },
  { label: "Map",     href: "/m-map"     },
  { label: "Reports", href: "/m-reports" },
];

function scanHref(s: Stop) {
  return `/m-scan?id=${encodeURIComponent(s.id)}&name=${encodeURIComponent(s.name)}&mode=${encodeURIComponent(s.mode)}&status=${encodeURIComponent(s.status)}`;
}

export default function HomePage() {
  const audited = NEARBY.filter((s) => s.status !== "review_required").length;
  const score   = NEARBY.length > 0 ? Math.round((audited / NEARBY.length) * 100) : 0;
  const scoreLabel = audited === 0 ? "Audit required" : score < 50 ? "Needs attention" : "Mostly accessible";

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">

      <header className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-5 py-4">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Good morning</p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">MyAccess</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white">
            M
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-3 p-4 pb-24">

        <div className="bg-emerald-700 rounded-2xl p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-1">
            Accessibility Score Nearby
          </p>
          <p className="text-5xl font-extrabold leading-none mb-1">{score}%</p>
          <p className="text-sm opacity-70">{scoreLabel} · {NEARBY.length} stops nearby</p>
        </div>

        <a
          href="/m-map"
          className="relative block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 h-40"
        >
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=145.044,-37.726,145.062,-37.700&layer=mapnik"
            className="w-full h-full border-0 pointer-events-none"
            title="Map preview"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <span className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-full px-4 py-1.5 shadow">
              View accessibility map
            </span>
          </div>
        </a>

        <a
          href="/m-scan"
          className="flex items-center justify-between bg-emerald-700 rounded-2xl p-5 text-white"
        >
          <div>
            <p className="text-base font-bold">Scan a stop</p>
            <p className="text-sm opacity-75 mt-0.5">Check DSAPT compliance with photos</p>
          </div>
          <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24" className="opacity-80 flex-shrink-0">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </a>

        <div className="grid grid-cols-2 gap-3">
          <a
            href="/m-saved"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 block"
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Saved Stops</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Your favourites</p>
          </a>
          <a
            href="/m-reports"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 block"
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Past Reports</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Previous audits</p>
          </a>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
            Nearby stops
          </p>
          {NEARBY.map((s, i) => (
            <a
              key={s.id}
              href={scanHref(s)}
              className={`flex items-center justify-between py-3 ${
                i < NEARBY.length - 1
                  ? "border-b border-slate-100 dark:border-slate-800"
                  : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {s.name}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 capitalize mt-0.5">
                  {s.mode}
                </p>
              </div>
              <StatusBadge status={s.status} />
            </a>
          ))}
        </div>

      </main>

      <BottomNav items={NAV} active="/m-home" />
    </div>
  );
}
