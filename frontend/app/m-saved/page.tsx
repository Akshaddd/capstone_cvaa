"use client";

import Link from "next/link";
import { ThemeProvider, BottomNav } from "../shared";

const NAV = [
  { label: "Home",    href: "/m-home"   },
  { label: "Scan",    href: "/m-scan"   },
  { label: "Map",     href: "/m-map"    },
  { label: "Reports", href: "/m-reports" },
];

const SAVED = [
  { name: "Stop 301 — Reservoir Station", mode: "Tram", status: "Partial",    style: "bg-yellow-100 text-yellow-700"   },
  { name: "Stop 300 — Kingsbury Dr",       mode: "Tram", status: "Accessible", style: "bg-emerald-100 text-emerald-700" },
];

function SavedContent() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 pb-4 pt-5 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Saved Stops</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Your favourites</p>
        </div>
      </header>
      <main className="flex flex-col gap-3 p-4 pb-24">
        {SAVED.map((s) => (
          <Link key={s.name} href="/m-map" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{s.mode}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${s.style}`}>{s.status}</span>
          </Link>
        ))}
      </main>
      <BottomNav items={NAV} active="/m-home" />
    </div>
  );
}

export default function SavedPage() {
  return (
    <ThemeProvider>
      <SavedContent />
    </ThemeProvider>
  );
}
