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

const SAVED = ALL_STOPS.filter(
  (s) =>
    s.lat > -37.726 &&
    s.lat < -37.700 &&
    s.lng > 145.044 &&
    s.lng < 145.062
).slice(0, 5);

const NAV = [
  { label: "Home",    href: "/m-home"    },
  { label: "Scan",    href: "/m-scan"    },
  { label: "Map",     href: "/m-map"     },
  { label: "Reports", href: "/m-reports" },
];

export default function SavedPage() {
  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">

      <header className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-5 py-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Saved Stops</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Your favourites</p>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex flex-col gap-3 p-4 pb-24">
        {SAVED.map((s) => (
          <a
            key={s.id}
            href={`/m-scan?id=${encodeURIComponent(s.id)}&name=${encodeURIComponent(s.name)}&mode=${encodeURIComponent(s.mode)}&status=${encodeURIComponent(s.status)}`}
            className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{s.name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 capitalize mt-0.5">{s.mode}</p>
            </div>
            <StatusBadge status={s.status} />
          </a>
        ))}
      </main>

      <BottomNav items={NAV} active="/m-home" />
    </div>
  );
}
