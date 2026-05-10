"use client";

import { useRouter } from "next/navigation";

export default function PtvMobileDashboardPage() {
  const router = useRouter();

  const reports = [
    { color: "bg-red-600", title: "Stop #14 — Platform gap 82mm", meta: "Swanston St / Bourke St · 2h ago", chip: "Critical", chipStyle: "bg-red-100 text-red-700" },
    { color: "bg-yellow-500", title: "Stop #27 — Tactile surface wear", meta: "Collins St / Spencer St · Yesterday", chip: "Active", chipStyle: "bg-yellow-100 text-yellow-700" },
    { color: "bg-blue-600", title: "Stop #3 — Signage obstruction", meta: "Flinders St / Elizabeth St · 3d ago", chip: "Scheduled", chipStyle: "bg-blue-100 text-blue-700" },
    { color: "bg-emerald-600", title: "Stop #89 — Kerb ramp damage", meta: "Chapel St / Toorak Rd · 4d ago", chip: "Resolved", chipStyle: "bg-emerald-100 text-emerald-700" },
  ];

  const routes = [
    ["Route 70", 96, "bg-emerald-600"],
    ["Route 86", 88, "bg-emerald-600"],
    ["Route 48", 79, "bg-yellow-400"],
    ["Route 12", 58, "bg-red-500"],
  ];

  return (
    <main className="mx-auto min-h-screen max-w-sm bg-[#08120c] text-white shadow-2xl">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-sm font-semibold text-emerald-300">9:41</span>
        <div className="flex gap-2">
          <div className="h-3 w-5 rounded bg-emerald-300" />
          <div className="h-3 w-6 rounded border border-emerald-300" />
        </div>
      </div>

      {/* Header */}
      <header className="space-y-4 border-b border-emerald-900 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-sm font-semibold">Network Dashboard</h1>
            <p className="text-xs text-emerald-300/70">Melbourne tram · live overview</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-slate-700">
              🔔
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-xs font-bold">PK</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-[11px]">
          <div className="rounded-full bg-emerald-600 px-2 py-1 text-center font-medium">Overview</div>
          <div className="rounded-full bg-[#102018] px-2 py-1 text-center text-emerald-300/60">Maintenance</div>
          <div className="rounded-full bg-[#102018] px-2 py-1 text-center text-emerald-300/60">Reports</div>
          <div className="rounded-full bg-[#102018] px-2 py-1 text-center text-emerald-300/60">Map</div>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 px-4 py-4 text-center text-xs">
        <div className="rounded-2xl bg-[#0f1d14] p-3">
          <p className="text-xl font-bold text-blue-300">148</p>
          <p className="text-emerald-100/60">Total stops</p>
        </div>
        <div className="rounded-2xl bg-[#0f1d14] p-3">
          <p className="text-xl font-bold text-emerald-300">91%</p>
          <p className="text-emerald-100/60">Compliance</p>
        </div>
        <div className="rounded-2xl bg-[#0f1d14] p-3">
          <p className="text-xl font-bold text-yellow-300">23</p>
          <p className="text-emerald-100/60">Pending</p>
        </div>
        <div className="rounded-2xl bg-[#0f1d14] p-3">
          <p className="text-xl font-bold text-red-300">7</p>
          <p className="text-emerald-100/60">Critical</p>
        </div>
      </section>

      <div className="space-y-5 px-4 pb-6">
        {/* Reports */}
        <section>
          <h2 className="mb-3 text-sm font-semibold">Critical & active</h2>
          <div className="space-y-3">
            {reports.map((item) => (
              <div key={item.title} className="flex gap-3 rounded-2xl bg-[#0f1d14] p-3">
                <div className={`mt-1 h-3 w-3 shrink-0 rounded-full ${item.color}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-emerald-100/50">{item.meta}</p>
                </div>
                <span className={`h-fit rounded-full px-2 py-1 text-[10px] font-semibold ${item.chipStyle}`}>{item.chip}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Route compliance */}
        <section>
          <h2 className="mb-3 text-sm font-semibold">Compliance by route</h2>
          <div className="space-y-4 rounded-2xl bg-[#0f1d14] p-4">
            {routes.map((item) => (
              <div key={item[0]} className="flex items-center gap-3 text-xs">
                <span className="w-16 text-emerald-100/60">{item[0]}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700">
                  <div className={`h-2 ${item[2]}`} style={{ width: `${item[1]}%` }} />
                </div>
                <span className="w-8 text-right font-medium">{item[1]}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 grid grid-cols-4 border-t border-emerald-900 bg-[#08120c] py-3 text-center text-[11px]">
        <div onClick={() => router.push("/m-home")} className="cursor-pointer font-medium text-emerald-300">Home</div>
        <div onClick={() => router.push("/map")} className="cursor-pointer text-emerald-300/40">Map</div>
        <div onClick={() => router.push("/m-report")} className="cursor-pointer text-emerald-300/40">Reports</div>
        <div className="text-emerald-300/40">Profile</div>
      </nav>
    </main>
  );
}