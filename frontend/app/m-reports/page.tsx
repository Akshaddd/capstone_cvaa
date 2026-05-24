"use client";

import Link from "next/link";
import { ThemeProvider, BottomNav } from "../shared";

const NAV = [
  { label: "Home",    href: "/m-home"   },
  { label: "Scan",    href: "/m-scan"   },
  { label: "Map",     href: "/m-map"    },
  { label: "Reports", href: "/m-reports" },
];

const DEMO_REPORTS = [
  { id: "RPT-2026-4821", name: "Stop 301 — Reservoir Station", mode: "Tram", date: "Today 11:42 AM", overall: "Non-compliant", style: "bg-red-100 text-red-700 border-red-200" },
  { id: "RPT-2026-3174", name: "Bourke St / Swanston St #57", mode: "Tram", date: "Yesterday 3:10 PM", overall: "Partial",       style: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { id: "RPT-2026-2905", name: "Stop 300 — Kingsbury Dr",      mode: "Tram", date: "2 days ago",       overall: "Compliant",    style: "bg-emerald-100 text-emerald-700 border-emerald-200" },
];

function ReportsContent() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 pb-4 pt-5 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Past Reports</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Previous audits</p>
        </div>
      </header>

      <main className="flex flex-col gap-3 p-4 pb-24">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Recent scans
        </p>
        {DEMO_REPORTS.map((r) => (
          <Link
            key={r.id}
            href="/m-report"
            className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{r.name}</p>
                <p className="text-xs capitalize text-slate-400 dark:text-slate-500">{r.mode} · {r.date}</p>
              </div>
              <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${r.style}`}>
                {r.overall}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">{r.id}</p>
          </Link>
        ))}
      </main>

      <BottomNav items={NAV} active="/m-reports" />
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ThemeProvider>
      <ReportsContent />
    </ThemeProvider>
  );
}
