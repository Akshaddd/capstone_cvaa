"use client";

import { useState } from "react";
import { Sidebar, PageHeader, PTV_NAV } from "../../shared-desktop";

interface StopReport {
  id: string; stopNumber: string; title: string;
  location: string; ago: string;
  status: "Critical" | "Active" | "Scheduled" | "Resolved";
}

const STOPS: StopReport[] = [
  { id: "SR-001", stopNumber: "Stop #14",  title: "Platform gap 82mm — exceeds DSAPT limit", location: "Swanston St / Bourke St",      ago: "2h ago",      status: "Critical"  },
  { id: "SR-002", stopNumber: "Stop #27",  title: "Tactile surface wear — 60% degraded",      location: "Collins St / Spencer St",     ago: "Yesterday",   status: "Active"    },
  { id: "SR-003", stopNumber: "Stop #3",   title: "Signage obstruction — tree branch",         location: "Flinders St / Elizabeth St",  ago: "3 days ago",  status: "Scheduled" },
  { id: "SR-004", stopNumber: "Stop #89",  title: "Kerb ramp damage — surface cracked",        location: "Chapel St / Toorak Rd",       ago: "4 days ago",  status: "Resolved"  },
  { id: "SR-005", stopNumber: "Stop #52",  title: "Missing boarding ramp",                     location: "St Kilda Rd / Domain Rd",     ago: "5 days ago",  status: "Critical"  },
  { id: "SR-006", stopNumber: "Stop #71",  title: "Shelter damage — wind damage",              location: "Brunswick St / Alexandra Pde",ago: "1 week ago",  status: "Active"    },
  { id: "SR-007", stopNumber: "Stop #104", title: "Gap filler worn — needs replacement",       location: "Nicholson St / Gertrude St",  ago: "1 week ago",  status: "Scheduled" },
  { id: "SR-008", stopNumber: "Stop #33",  title: "Tactile strip fully replaced",              location: "Elizabeth St / La Trobe St",  ago: "2 weeks ago", status: "Resolved"  },
];

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
            <span className="text-sm text-slate-400 w-24">Location</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{report.location}</span>
          </div>
          <div className="flex gap-3 py-2">
            <span className="text-sm text-slate-400 w-24">Reported</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{report.ago}</span>
          </div>
          {action && (
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2.5">
              {action}
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setAction("Report marked as resolved.")} className="flex-1 bg-emerald-700 text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-emerald-800">Mark resolved</button>
            <button onClick={() => setAction("Maintenance scheduled for this stop.")} className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">Schedule</button>
            <button onClick={() => setAction("Report escalated to council.")} className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">Escalate</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PtvStopsPage() {
  const [selected, setSelected] = useState<StopReport | null>(null);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar nav={PTV_NAV} active="/d-ptv/stops" user={{ initials: "PK", name: "P. Khanna", role: "PTV Operations" }} />

      <div className="flex flex-1 flex-col min-w-0">
        <PageHeader title="Stop Reports" subtitle="All reports — newest first" />

        <main className="flex-1 p-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Stop</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Issue</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Location</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Reported</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {STOPS.map((r, i) => (
                  <tr key={r.id} className={i < STOPS.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}>
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{r.stopNumber}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{r.title}</td>
                    <td className="px-5 py-3 text-slate-400 dark:text-slate-500">{r.location}</td>
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

      {selected && <StopDetail report={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}