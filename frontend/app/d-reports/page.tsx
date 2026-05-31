"use client";

import { useEffect, useState } from "react";
import { Sidebar, PageHeader, USER_NAV } from "../shared-desktop";

interface Report { reportId: string; stopName: string; stopMode: string; scannedAt: string; passed: number; warnings: number; failed: number; }

function overall(r: Report) {
  if (r.failed > 0)   return { label: "Non-compliant", cls: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"             };
  if (r.warnings > 0) return { label: "Partial",       cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" };
  return                     { label: "Compliant",     cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" };
}

export default function DesktopReportsPage() {
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
          stopName: r.selectedStop?.name ?? "Unknown stop",
          stopMode: r.selectedStop?.mode ?? "transport",
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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar nav={USER_NAV} active="/d-reports" user={{ initials: "JD", name: "J. Doe", role: "Public user" }} />

      <div className="flex flex-1 flex-col min-w-0">
        <PageHeader title="Past Reports" subtitle={`${reports.length} audit${reports.length !== 1 ? "s" : ""}`} />

        <main className="flex-1 p-6">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No reports yet</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">Scan a stop to generate your first report</p>
              <a href="/d-scan" className="bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-800">Scan a stop</a>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Report</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Stop</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Results</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, i) => {
                    const o = overall(r);
                    return (
                      <tr key={i} className={i < reports.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}>
                        <td className="px-5 py-3 font-mono text-xs text-slate-400 dark:text-slate-500">{r.reportId}</td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-900 dark:text-white">{r.stopName}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{r.stopMode}</p>
                        </td>
                        <td className="px-5 py-3 text-slate-400 dark:text-slate-500">{new Date(r.scannedAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3">
                          <div className="flex gap-3 text-xs font-semibold">
                            <span className="text-emerald-600 dark:text-emerald-400">{r.passed} passed</span>
                            <span className="text-yellow-600 dark:text-yellow-400">{r.warnings} warn</span>
                            <span className="text-red-600 dark:text-red-400">{r.failed} failed</span>
                          </div>
                        </td>
                        <td className="px-5 py-3"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${o.cls}`}>{o.label}</span></td>
                        <td className="px-5 py-3 text-right">
                          <a href="/d-report" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">View</a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}