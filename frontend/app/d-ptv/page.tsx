"use client";

import { useState } from "react";
import { Sidebar, PageHeader, PTV_NAV } from "../shared-desktop";

const STATS = [
  { val: "148", label: "Total stops", color: "text-slate-900 dark:text-white"          },
  { val: "91%", label: "Compliance",  color: "text-emerald-700 dark:text-emerald-400"  },
  { val: "23",  label: "Pending",     color: "text-yellow-600 dark:text-yellow-400"    },
  { val: "7",   label: "Critical",    color: "text-red-600 dark:text-red-400"          },
];

interface StopReport {
  id: string; stopNumber: string; title: string;
  location: string; ago: string;
  status: "Critical" | "Active" | "Scheduled" | "Resolved";
}

const CRITICAL: StopReport[] = [
  { id: "SR-001", stopNumber: "Stop #14", title: "Platform gap 82mm — exceeds DSAPT limit", location: "Swanston St / Bourke St",  ago: "2h ago",    status: "Critical" },
  { id: "SR-005", stopNumber: "Stop #52", title: "Missing boarding ramp",                   location: "St Kilda Rd / Domain Rd",  ago: "5 days ago", status: "Critical" },
];

const ACTIVE: StopReport[] = [
  { id: "SR-002", stopNumber: "Stop #27", title: "Tactile surface wear — 60% degraded",  location: "Collins St / Spencer St",      ago: "Yesterday",  status: "Active" },
  { id: "SR-006", stopNumber: "Stop #71", title: "Shelter damage — wind damage",          location: "Brunswick St / Alexandra Pde", ago: "1 week ago", status: "Active" },
];

const TREND = [62, 71, 68, 78, 82, 88, 91];
const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
const MAX    = Math.max(...TREND);

function statusChip(s: string) {
  if (s === "Critical")  return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
  if (s === "Active")    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
  if (s === "Scheduled") return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
}

function StopDetail({ report, onClose }: { report: StopReport; onClose: () => void }) {
  const [action, setAction] = useState<string | null>(null);
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-bold text-slate-900 dark:text-white">Stop Report</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none">x</button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{report.stopNumber} · {report.id}</p>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{report.title}</h3>
            </div>
            <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${statusChip(report.status)}`}>{report.status}</span>
          </div>
          <div className="flex gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-sm text-slate-400 dark:text-slate-500 w-24">Location</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{report.location}</span>
          </div>
          <div className="flex gap-3 py-2">
            <span className="text-sm text-slate-400 dark:text-slate-500 w-24">Reported</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{report.ago}</span>
          </div>
          {action && (
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2.5">
              {action}
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setAction("Report marked as resolved.")} className="flex-1 bg-emerald-700 text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-emerald-800">Mark resolved</button>
            <button onClick={() => setAction("Maintenance scheduled for this stop.")} className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">Schedule maintenance</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PtvDashboardPage() {
  const [selected, setSelected] = useState<StopReport | null>(null);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar nav={PTV_NAV} active="/d-ptv" user={{ initials: "PK", name: "P. Khanna", role: "PTV Operations" }} />

      <div className="flex flex-1 flex-col min-w-0">
        <PageHeader title="Dashboard" subtitle="PTV · Melbourne network" />

        <main className="flex-1 p-6 flex flex-col gap-6">
          <div className="grid grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <p className={`text-3xl font-bold ${s.color}`}>{s.val}</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">

            <div className="col-span-2 flex flex-col gap-4">

              {CRITICAL.length > 0 && (
                <div className="bg-red-50 dark:bg-red-950 rounded-2xl border border-red-200 dark:border-red-800 overflow-hidden">
                  <div className="px-5 py-3 border-b border-red-200 dark:border-red-800">
                    <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Critical — action required</p>
                  </div>
                  {CRITICAL.map((r, i) => (
                    <button key={r.id} onClick={() => setSelected(r)}
                      className={`w-full text-left flex items-start gap-4 px-5 py-3 hover:bg-red-100 dark:hover:bg-red-900 ${i < CRITICAL.length - 1 ? "border-b border-red-200 dark:border-red-800" : ""}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400">{r.stopNumber}</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{r.title}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{r.location} · {r.ago}</p>
                      </div>
                      <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${statusChip(r.status)}`}>{r.status}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Active reports</p>
                </div>
                {ACTIVE.map((r, i) => (
                  <button key={r.id} onClick={() => setSelected(r)}
                    className={`w-full text-left flex items-start gap-4 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 ${i < ACTIVE.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{r.stopNumber}</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{r.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{r.location} · {r.ago}</p>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${statusChip(r.status)}`}>{r.status}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Compliance trend</p>
              <div className="flex items-end gap-2 h-32">
                {TREND.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-md ${v >= 85 ? "bg-emerald-500" : v >= 70 ? "bg-yellow-400" : "bg-red-500"}`}
                      style={{ height: `${(v / MAX) * 100}px` }}
                    />
                    <span className="text-[9px] text-slate-400 dark:text-slate-500">{MONTHS[i]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">91%</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Current compliance · +3% this month</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {selected && <StopDetail report={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}