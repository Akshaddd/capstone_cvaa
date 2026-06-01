"use client";

import { Sidebar, PageHeader, COUNCIL_NAV } from "../../shared-desktop";

const AREAS = [
  { name: "CBD",         score: 88, reports: 12, trend: "up"   as const },
  { name: "Carlton",     score: 82, reports: 8,  trend: "flat" as const },
  { name: "Fitzroy",     score: 71, reports: 15, trend: "down" as const },
  { name: "Richmond",    score: 68, reports: 11, trend: "down" as const },
  { name: "Footscray",   score: 48, reports: 22, trend: "up"   as const },
  { name: "Northcote",   score: 61, reports: 9,  trend: "flat" as const },
  { name: "Collingwood", score: 74, reports: 7,  trend: "up"   as const },
];

function scoreColor(n: number) {
  if (n >= 80) return { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" };
  if (n >= 60) return { bar: "bg-yellow-400",  text: "text-yellow-600 dark:text-yellow-400",  badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"   };
  return              { bar: "bg-red-500",     text: "text-red-600 dark:text-red-400",        badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"               };
}

export default function CouncilAreaPage() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar nav={COUNCIL_NAV} active="/d-council/area" user={{ initials: "SR", name: "S. Roberts", role: "City of Melbourne" }} />

      <div className="flex flex-1 flex-col min-w-0">
        <PageHeader title="Area Index" subtitle="Accessibility score by suburb" />

        <main className="flex-1 p-6 grid grid-cols-3 gap-6 items-start">

          <div className="col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Suburb</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Score</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-48">Progress</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Reports</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Trend</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Rating</th>
                </tr>
              </thead>
              <tbody>
                {AREAS.map((a, i) => {
                  const c = scoreColor(a.score);
                  return (
                    <tr key={a.name} className={i < AREAS.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}>
                      <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{a.name}</td>
                      <td className={`px-5 py-3 font-bold ${c.text}`}>{a.score}%</td>
                      <td className="px-5 py-3">
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-2 rounded-full ${c.bar}`} style={{ width: `${a.score}%` }} />
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-400 dark:text-slate-500">{a.reports}</td>
                      <td className={`px-5 py-3 font-semibold ${a.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : a.trend === "down" ? "text-red-500" : "text-slate-400"}`}>
                        {a.trend === "up" ? "↑ Improving" : a.trend === "down" ? "↓ Declining" : "→ Stable"}
                      </td>
                      <td className="px-5 py-3"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.badge}`}>{a.score >= 80 ? "Good" : a.score >= 60 ? "Fair" : "Poor"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">Best performing</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">CBD</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">88% accessible</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">Needs most attention</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">Footscray</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">48% · 22 active reports</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Network average</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">70%</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Across {AREAS.length} suburbs</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}