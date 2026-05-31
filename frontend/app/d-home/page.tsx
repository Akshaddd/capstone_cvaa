"use client";

import { Sidebar, PageHeader, StatusBadge, USER_NAV } from "../shared-desktop";
import rawStops from "../data/stops.json";

type Stop = {
  id: string; name: string; lat: number; lng: number;
  mode: "tram" | "bus";
  status: "mostly_accessible" | "partial_access" | "review_required";
  features: string[]; notes: string;
};

const ALL_STOPS = rawStops as Stop[];

const NEARBY = ALL_STOPS.filter(
  (s) => s.lat > -37.726 && s.lat < -37.700 && s.lng > 145.044 && s.lng < 145.062
).slice(0, 6);

const QUICK_ACTIONS = [
  { label: "Scan a stop",  sub: "Check DSAPT compliance",    href: "/d-scan",    bg: "bg-emerald-700", text: "text-white"                                 },
  { label: "View map",     sub: "Browse all 1,355 stops",    href: "/d-map",     bg: "bg-white dark:bg-slate-900", text: "text-slate-900 dark:text-white" },
  { label: "Past reports", sub: "Your previous audits",      href: "/d-reports", bg: "bg-white dark:bg-slate-900", text: "text-slate-900 dark:text-white" },
  { label: "Saved stops",  sub: "Your favourites",           href: "/d-saved",   bg: "bg-white dark:bg-slate-900", text: "text-slate-900 dark:text-white" },
];

function scanHref(s: Stop) {
  return `/d-scan?id=${encodeURIComponent(s.id)}&name=${encodeURIComponent(s.name)}&mode=${encodeURIComponent(s.mode)}&status=${encodeURIComponent(s.status)}`;
}

export default function DesktopHomePage() {
  const audited = NEARBY.filter((s) => s.status !== "review_required").length;
  const score   = NEARBY.length > 0 ? Math.round((audited / NEARBY.length) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar nav={USER_NAV} active="/d-home" user={{ initials: "JD", name: "J. Doe", role: "Public user" }} />

      <div className="flex flex-1 flex-col min-w-0">
        <PageHeader title="Home" subtitle="Melbourne accessibility network" />

        <main className="flex-1 p-6 flex flex-col gap-6">

          <div className="grid grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((a) => (
              <a key={a.label} href={a.href}
                className={`${a.bg} ${a.text} rounded-2xl border border-slate-200 dark:border-slate-700 p-5 block hover:opacity-90 transition-opacity`}>
                <p className="font-bold text-base">{a.label}</p>
                <p className={`text-sm mt-0.5 ${a.bg.includes("emerald") ? "opacity-80" : "text-slate-400 dark:text-slate-500"}`}>{a.sub}</p>
              </a>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">

            <div className="col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">Nearby stops</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">La Trobe University area</p>
                </div>
                <a href="/d-map" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">View all on map</a>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Stop</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Mode</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {NEARBY.map((s, i) => (
                    <tr key={s.id} className={i < NEARBY.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}>
                      <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{s.name}</td>
                      <td className="px-5 py-3 capitalize text-slate-400 dark:text-slate-500">{s.mode}</td>
                      <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-5 py-3 text-right">
                        <a href={scanHref(s)} className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Scan</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-emerald-700 rounded-2xl p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-75 mb-1">Area score</p>
                <p className="text-5xl font-extrabold leading-none mb-1">{score}%</p>
                <p className="text-sm opacity-70">
                  {audited === 0 ? "Audit required" : "Accessibility score"}
                </p>
                <p className="text-xs opacity-60 mt-1">{NEARBY.length} stops nearby</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">Quick scan</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Upload photos of a stop to get an instant DSAPT compliance report.
                </p>
                <a href="/d-scan" className="block w-full bg-emerald-700 text-white font-semibold text-sm text-center py-2.5 rounded-xl hover:bg-emerald-800">
                  Start scanning
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}