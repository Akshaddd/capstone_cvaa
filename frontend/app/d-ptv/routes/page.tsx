"use client";

import { Sidebar, PageHeader, PTV_NAV } from "../../shared-desktop";

const ROUTES = [
  { name: "Route 70",  pct: 96, stops: 34, actions: 1, trend: "+2%" },
  { name: "Route 86",  pct: 88, stops: 28, actions: 3, trend: "+1%" },
  { name: "Route 48",  pct: 79, stops: 22, actions: 5, trend: "-3%" },
  { name: "Route 12",  pct: 58, stops: 19, actions: 8, trend: "-5%" },
  { name: "Route 96",  pct: 94, stops: 31, actions: 2, trend: "+4%" },
  { name: "Route 109", pct: 83, stops: 26, actions: 4, trend: "0%"  },
];

function scoreColor(n: number) {
  if (n >= 85) return { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" };
  if (n >= 70) return { bar: "bg-yellow-400",  text: "text-yellow-600 dark:text-yellow-400",  badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"   };
  return              { bar: "bg-red-500",     text: "text-red-600 dark:text-red-400",        badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"               };
}

export default function PtvRoutesPage() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar nav={PTV_NAV} active="/d-ptv/routes" user={{ initials: "CO", name: "Compliance Officer", role: "Accessibility compliance" }} />

      <div className="flex flex-1 flex-col min-w-0">
        <PageHeader title="Route compliance" subtitle="Verified accessibility confidence and remediation actions by route" />

        <main className="flex-1 p-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Route</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Confidence</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-48">Progress</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Stops</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Actions</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Trend</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Compliance band</th>
                </tr>
              </thead>
              <tbody>
                {ROUTES.map((r, i) => {
                  const c = scoreColor(r.pct);
                  return (
                    <tr key={r.name} className={i < ROUTES.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}>
                      <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{r.name}</td>
                      <td className={`px-5 py-3 font-bold ${c.text}`}>{r.pct}%</td>
                      <td className="px-5 py-3">
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-2 rounded-full ${c.bar}`} style={{ width: `${r.pct}%` }} />
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-400 dark:text-slate-500">{r.stops}</td>
                      <td className="px-5 py-3 text-slate-400 dark:text-slate-500">{r.actions}</td>
                      <td className={`px-5 py-3 font-semibold text-sm ${r.trend.startsWith("+") ? "text-emerald-600 dark:text-emerald-400" : r.trend.startsWith("-") ? "text-red-500" : "text-slate-400"}`}>{r.trend}</td>
                      <td className="px-5 py-3"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.badge}`}>{r.pct >= 85 ? "Verified" : r.pct >= 70 ? "Review" : "Action required"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}