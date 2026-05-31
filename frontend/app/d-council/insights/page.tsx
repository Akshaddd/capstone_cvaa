"use client";

import { Sidebar, PageHeader, COUNCIL_NAV } from "../../shared-desktop";

const INSIGHTS = [
  { title: "Most reported issue",    value: "Missing tactile strips", sub: "38% of all reports",   color: "text-red-600 dark:text-red-400"         },
  { title: "Fastest resolved",       value: "Signage issues",         sub: "Avg 2.1 days",         color: "text-emerald-600 dark:text-emerald-400" },
  { title: "Slowest to resolve",     value: "Lift / elevator faults", sub: "Avg 18.4 days",        color: "text-yellow-600 dark:text-yellow-400"   },
  { title: "Highest complaint area", value: "Footscray",              sub: "22 active reports",    color: "text-red-600 dark:text-red-400"         },
  { title: "Most improved",          value: "CBD",                    sub: "+14% this quarter",    color: "text-emerald-600 dark:text-emerald-400" },
  { title: "Satisfaction score",     value: "3.8 / 5",               sub: "Based on 124 reviews", color: "text-slate-900 dark:text-white"         },
];

const MONTHLY = [28, 34, 22, 41, 38, 52, 48];
const MONTHS  = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
const MAX     = Math.max(...MONTHLY);

export default function CouncilInsightsPage() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar nav={COUNCIL_NAV} active="/d-council/insights" user={{ initials: "SR", name: "S. Roberts", role: "City of Melbourne" }} />

      <div className="flex flex-1 flex-col min-w-0">
        <PageHeader title="Insights" subtitle="Trends and performance metrics" />

        <main className="flex-1 p-6 grid grid-cols-3 gap-6 items-start">

          <div className="col-span-2 flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-5">Reports resolved per month</p>
              <div className="flex items-end gap-3 h-40">
                {MONTHLY.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{v}</span>
                    <div className="w-full bg-emerald-500 rounded-t-md" style={{ height: `${(v / MAX) * 100}px` }} />
                    <span className="text-xs text-slate-400 dark:text-slate-500">{MONTHS[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {INSIGHTS.map((ins) => (
                <div key={ins.title} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{ins.title}</p>
                  <p className={`text-xl font-bold ${ins.color}`}>{ins.value}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{ins.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Quarter summary</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Reports submitted",  val: "138", delta: "+12%", up: true  },
                  { label: "Reports resolved",   val: "107", delta: "+18%", up: true  },
                  { label: "Avg resolution time",val: "6.2d", delta: "-8%", up: true  },
                  { label: "Escalations",        val: "12",  delta: "+2",   up: false },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span className="text-sm text-slate-600 dark:text-slate-300">{row.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{row.val}</span>
                      <span className={`text-xs font-semibold ${row.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>{row.delta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}