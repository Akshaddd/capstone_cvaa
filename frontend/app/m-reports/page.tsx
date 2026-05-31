"use client";

import { useEffect, useState } from "react";
import { ThemeToggle, BottomNav } from "../shared";

const NAV = [
  { label: "Home",    href: "/m-home"    },
  { label: "Scan",    href: "/m-scan"    },
  { label: "Map",     href: "/m-map"     },
  { label: "Reports", href: "/m-reports" },
];

interface Report {
  reportId: string;
  stopName: string;
  stopMode: string;
  scannedAt: string;
  passed: number;
  warnings: number;
  failed: number;
}

function overallLabel(r: Report) {
  if (r.failed > 0)   return { label: "Non-compliant", cls: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"         };
  if (r.warnings > 0) return { label: "Partial",       cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" };
  return                     { label: "Compliant",     cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const list: Report[] = [];
    const raw = sessionStorage.getItem("scanResult");
    if (raw) {
      try {
        const r = JSON.parse(raw);
        const dets = r.detections ?? [];
        list.push({
          reportId: `RPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          stopName: r.selectedStop?.name ?? r.stopName ?? "Unknown stop",
          stopMode: r.selectedStop?.mode ?? r.stopMode ?? "transport",
          scannedAt: r.scannedAt ?? new Date().toISOString(),
          passed:   dets.filter((d: { confidence: number }) => d.confidence >= 0.65).length,
          warnings: dets.filter((d: { confidence: number }) => d.confidence >= 0.35 && d.confidence < 0.65).length,
          failed:   dets.filter((d: { confidence: number }) => d.confidence < 0.35).length,
        });
      } catch {}
    }
    setReports(list);
  }, []);

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">

      <header className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-5 py-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Past Reports</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {reports.length} audit{reports.length !== 1 ? "s" : ""}
          </p>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex flex-col gap-3 p-4 pb-24">
        {reports.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 text-center">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No reports yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-5">
              Scan a stop to generate your first report
            </p>
            <a
              href="/m-scan"
              className="inline-block bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl"
            >
              Scan a stop
            </a>
          </div>
        ) : (
          reports.map((r, i) => {
            const o = overallLabel(r);
            return (
              <a
                key={i}
                href="/m-report"
                className="block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{r.stopName}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 capitalize mt-0.5">
                      {r.stopMode} stop · {new Date(r.scannedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${o.cls}`}>
                    {o.label}
                  </span>
                </div>
                <div className="flex gap-4 text-xs font-semibold">
                  <span className="text-emerald-700 dark:text-emerald-400">{r.passed} passed</span>
                  <span className="text-yellow-600 dark:text-yellow-400">{r.warnings} warnings</span>
                  <span className="text-red-600 dark:text-red-400">{r.failed} failed</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">{r.reportId}</p>
              </a>
            );
          })
        )}
      </main>

      <BottomNav items={NAV} active="/m-reports" />
    </div>
  );
}
