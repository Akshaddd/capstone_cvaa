"use client";

import { useRouter } from "next/navigation";

export default function PtvMobileDashboardPage() {
  const router = useRouter();

  const reports = [
    { color: "bg-red-500", title: "Stop #14 — Platform gap 82mm", meta: "Swanston St / Bourke St · 2h ago", chip: "Critical", chipStyle: "bg-red-100 text-red-700 border-red-200" },
    { color: "bg-yellow-500", title: "Stop #27 — Tactile surface wear", meta: "Collins St / Spencer St · Yesterday", chip: "Active", chipStyle: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    { color: "bg-blue-500", title: "Stop #3 — Signage obstruction", meta: "Flinders St / Elizabeth St · 3d ago", chip: "Scheduled", chipStyle: "bg-blue-100 text-blue-700 border-blue-200" },
    { color: "bg-emerald-500", title: "Stop #89 — Kerb ramp damage", meta: "Chapel St / Toorak Rd · 4d ago", chip: "Resolved", chipStyle: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  ];

  const routes = [
    ["Route 70", 96, "bg-emerald-500"],
    ["Route 86", 88, "bg-emerald-500"],
    ["Route 48", 79, "bg-yellow-400"],
    ["Route 12", 58, "bg-red-500"],
  ];

  return (
    <main className="mx-auto min-h-screen max-w-sm bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-sm font-semibold text-emerald-700">9:41</span>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-5 rounded-sm bg-emerald-700" />
            <div className="h-2.5 w-6 rounded-sm border border-slate-300" />
          </div>
        </div>
        <div className="flex items-center justify-between px-5 pb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Network Dashboard</h1>
            <p className="text-xs text-slate-400">Melbourne tram · live overview</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">PK</div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: "148", label: "Total stops", color: "text-slate-900" },
            { val: "91%", label: "Compliance", color: "text-emerald-700" },
            { val: "23", label: "Pending", color: "text-yellow-600" },
            { val: "7", label: "Critical", color: "text-red-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white border border-slate-200 p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Active reports */}
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Critical & active</p>
          <div className="space-y-2">
            {reports.map((item) => (
              <div key={item.title} className="flex gap-3 rounded-2xl bg-white border border-slate-200 p-3.5">
                <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.meta}</p>
                </div>
                <span className={`h-fit shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${item.chipStyle}`}>{item.chip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Route compliance */}
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Compliance by route</p>
          <div className="space-y-3 rounded-2xl bg-white border border-slate-200 p-4">
            {routes.map((item) => (
              <div key={item[0]} className="flex items-center gap-3 text-xs">
                <span className="w-16 shrink-0 font-medium text-slate-600">{item[0]}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-1.5 ${item[2]}`} style={{ width: `${item[1]}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right font-semibold text-slate-900">{item[1]}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 grid grid-cols-4 border-t border-slate-200 bg-white py-3 text-center text-[11px]">
        {[
          { label: "Home", route: "/m-home" },
          { label: "Scan", route: "/m-scan" },
          { label: "Map", route: "/m-map" },
          { label: "Reports", route: "/m-report" },
        ].map((n) => (
          <div key={n.label} onClick={() => router.push(n.route)} className="cursor-pointer font-medium text-slate-400">
            {n.label}
          </div>
        ))}
      </nav>
    </main>
  );
}