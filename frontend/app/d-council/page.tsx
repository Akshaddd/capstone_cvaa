"use client";

import { useState } from "react";
import { Sidebar, PageHeader, COUNCIL_NAV } from "../shared-desktop";

const STATS = [
  { val: "342", label: "Public reports", color: "text-slate-900 dark:text-white"           },
  { val: "78%", label: "Resolved",       color: "text-emerald-700 dark:text-emerald-400"   },
  { val: "41",  label: "Under review",   color: "text-yellow-600 dark:text-yellow-400"     },
  { val: "12",  label: "Escalated",      color: "text-red-600 dark:text-red-400"           },
];

interface Report {
  id: string; title: string; location: string;
  suburb: string; ago: string; status: string; note?: string;
}

const REPORTS: Report[] = [
  { id: "RPT-001", title: "Broken kerb ramp",                 location: "Chapel St / Commercial Rd", suburb: "Stonnington", ago: "1 day ago",   status: "Active"    },
  { id: "RPT-002", title: "Missing tactile strip",             location: "Bourke St Mall / Swanston", suburb: "CBD",         ago: "3 days ago",  status: "Review"    },
  { id: "RPT-003", title: "No accessible path to stop",        location: "Smith St / Johnston St",    suburb: "Fitzroy",     ago: "4 days ago",  status: "Review"    },
  { id: "RPT-004", title: "Broken lift — Flinders St Station", location: "Flinders St / Swanston St", suburb: "CBD",         ago: "5 days ago",  status: "Escalated", note: "Council action required" },
  { id: "RPT-005", title: "Petition: Brunswick St stop",       location: "Brunswick St",              suburb: "Fitzroy",     ago: "6 days ago",  status: "28/50",     note: "Community support"       },
  { id: "RPT-006", title: "Damaged boarding ramp",             location: "Swanston St / La Trobe St", suburb: "CBD",         ago: "1 week ago",  status: "Review"    },
  { id: "RPT-007", title: "Signage obstruction",               location: "Elizabeth St / Collins St", suburb: "CBD",         ago: "1 week ago",  status: "Active"    },
  { id: "RPT-008", title: "Broken shelter — stop 47",          location: "St Kilda Rd / Toorak Rd",   suburb: "Melbourne",   ago: "2 weeks ago", status: "Escalated" },
];

function statusChip(s: string) {
  if (s === "Active")    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
  if (s === "Review")    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
  if (s === "Escalated") return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
  return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
}

function ReportDetail({ report, onClose }: { report: Report; onClose: () => void }) {
  const [action, setAction] = useState<string | null>(null);
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-bold text-slate-900 dark:text-white">Report Detail</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none">x</button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{report.title}</h3>
            <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${statusChip(report.status)}`}>{report.status}</span>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { label: "Location", val: report.location },
              { label: "Suburb",   val: report.suburb   },
              { label: "Reported", val: report.ago       },
              { label: "ID",       val: report.id        },
              ...(report.note ? [{ label: "Note", val: report.note }] : []),
            ].map((row) => (
              <div key={row.label} className="flex gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span className="text-sm text-slate-400 dark:text-slate-500 w-24 flex-shrink-0">{row.label}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{row.val}</span>
              </div>
            ))}
          </div>
          {action && (
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2.5">
              {action}
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setAction("Report marked as resolved.")} className="flex-1 bg-emerald-700 text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-emerald-800">Mark resolved</button>
            <button onClick={() => setAction("Report escalated to council.")} className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">Escalate</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CouncilReportsPage() {
  const [selected, setSelected] = useState<Report | null>(null);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar nav={COUNCIL_NAV} active="/d-council" user={{ initials: "SR", name: "S. Roberts", role: "City of Melbourne" }} />

      <div className="flex flex-1 flex-col min-w-0">
        <PageHeader title="Public Reports" subtitle="City of Melbourne" />

        <main className="flex-1 p-6 flex flex-col gap-6">
          <div className="grid grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <p className={`text-3xl font-bold ${s.color}`}>{s.val}</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-white">Active reports — newest first</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Title</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Location</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Suburb</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Reported</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {REPORTS.map((r, i) => (
                  <tr key={r.id} className={i < REPORTS.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{r.title}</p>
                      {r.note && <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5">{r.note}</p>}
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{r.location}</td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{r.suburb}</td>
                    <td className="px-5 py-3 text-slate-400 dark:text-slate-500">{r.ago}</td>
                    <td className="px-5 py-3"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusChip(r.status)}`}>{r.status}</span></td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setSelected(r)} className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {selected && <ReportDetail report={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}