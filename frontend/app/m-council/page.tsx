"use client";

import { useRouter } from "next/navigation";

export default function CouncilMobilePage() {
  const router = useRouter();

  const reports = [
    { title: "Broken kerb ramp", meta: "Chapel St / Commercial Rd · Stonnington · 1 day ago", status: "Active" },
    { title: "Missing tactile strip", meta: "Bourke St Mall / Swanston · CBD · 3 days ago", status: "Review" },
    { title: "No accessible path to stop", meta: "Smith St / Johnston St · Fitzroy · 4 days ago", status: "Review" },
    { title: "Broken lift — Flinders St Station", meta: "CBD · 5 days ago · Council action required", status: "Escalated" },
    { title: "Petition: Brunswick St stop", meta: "Fitzroy · 6 days ago · Community support", status: "28/50" },
  ];

  const areas: [string, number][] = [["CBD", 88], ["Carlton", 82], ["Fitzroy", 71], ["Richmond", 68], ["Footscray", 48]];

  const chip = (s: string) => {
    if (s === "Active") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (s === "Review") return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (s === "Escalated") return "bg-red-100 text-red-700 border-red-200";
    return "bg-purple-100 text-purple-700 border-purple-200";
  };

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
        <div className="flex items-center justify-between px-5 pb-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Public Reports</h1>
            <p className="text-xs text-slate-400">City of Melbourne</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">SR</div>
        </div>
        <div className="flex gap-5 overflow-x-auto px-5 pb-0 text-sm">
          {["Reports", "Area index", "Community", "Insights"].map((tab, i) => (
            <span key={tab} className={`pb-2.5 whitespace-nowrap text-sm font-semibold ${i === 0 ? "border-b-2 border-emerald-700 text-emerald-700" : "text-slate-400"}`}>{tab}</span>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: "342", label: "Public reports", color: "text-slate-900" },
            { val: "78%", label: "Resolved", color: "text-emerald-700" },
            { val: "41", label: "Under review", color: "text-yellow-600" },
            { val: "12", label: "Escalated", color: "text-red-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white border border-slate-200 p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Reports */}
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Active reports</p>
          <div className="space-y-2">
            {reports.map((item) => (
              <div key={item.title} className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="mb-1.5 flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${chip(item.status)}`}>{item.status}</span>
                </div>
                <p className="text-xs text-slate-400">{item.meta}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Area index */}
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Area accessibility index</p>
          <div className="space-y-3 rounded-2xl bg-white border border-slate-200 p-4">
            {areas.map(([name, value]) => (
              <div key={name}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">{name}</span>
                  <span className="font-semibold text-slate-900">{value}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100">
                  <div className={`h-1.5 rounded-full ${value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-yellow-400" : "bg-red-500"}`} style={{ width: `${value}%` }} />
                </div>
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