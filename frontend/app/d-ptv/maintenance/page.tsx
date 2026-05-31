"use client";

import { useState } from "react";
import { Sidebar, PageHeader, PTV_NAV } from "../../shared-desktop";

const MAINTENANCE = [
  { id: "M-001", title: "Tactile replacement",  stop: "Stop #27", location: "Collins St / Spencer St",     due: "Tomorrow",   priority: "High",     assignee: "Team A" },
  { id: "M-002", title: "Gap filler repair",    stop: "Stop #14", location: "Swanston St / Bourke St",     due: "In 2 days",  priority: "Critical", assignee: "Team B" },
  { id: "M-003", title: "Signage replacement",  stop: "Stop #3",  location: "Flinders St / Elizabeth St",  due: "This week",  priority: "Medium",   assignee: "Team C" },
  { id: "M-004", title: "Shelter repair",        stop: "Stop #71", location: "Brunswick St / Alexandra Pde",due: "Next week",  priority: "Low",      assignee: "Team A" },
  { id: "M-005", title: "Ramp installation",    stop: "Stop #52", location: "St Kilda Rd / Domain Rd",     due: "Next week",  priority: "High",     assignee: "Team B" },
  { id: "M-006", title: "Gap filler worn",       stop: "Stop #104",location: "Nicholson St / Gertrude St",  due: "2 weeks",    priority: "Medium",   assignee: "Team C" },
];

function priorityChip(p: string) {
  if (p === "Critical") return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
  if (p === "High")     return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
  if (p === "Medium")   return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
  return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
}

export default function PtvMaintenancePage() {
  const [done, setDone] = useState<string[]>([]);
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar nav={PTV_NAV} active="/d-ptv/maintenance" user={{ initials: "PK", name: "P. Khanna", role: "PTV Operations" }} />

      <div className="flex flex-1 flex-col min-w-0">
        <PageHeader title="Maintenance" subtitle="Scheduled jobs" />

        <main className="flex-1 p-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Job</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Stop</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Location</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Due</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Priority</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Assigned</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {MAINTENANCE.map((m, i) => (
                  <tr key={m.id} className={i < MAINTENANCE.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{m.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{m.id}</p>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">{m.stop}</td>
                    <td className="px-5 py-3 text-slate-400 dark:text-slate-500">{m.location}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300 font-medium">{m.due}</td>
                    <td className="px-5 py-3"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${priorityChip(m.priority)}`}>{m.priority}</span></td>
                    <td className="px-5 py-3 text-slate-400 dark:text-slate-500">{m.assignee}</td>
                    <td className="px-5 py-3 text-right">
                      {done.includes(m.id) ? (
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Done ✓</span>
                      ) : (
                        <button onClick={() => setDone((d) => [...d, m.id])} className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Mark done</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}