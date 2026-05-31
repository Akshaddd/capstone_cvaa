"use client";

import { Sidebar, PageHeader, StatusBadge, USER_NAV } from "../shared-desktop";
import rawStops from "../data/stops.json";

type Stop = {
  id: string; name: string; lat: number; lng: number;
  mode: "tram" | "bus";
  status: "mostly_accessible" | "partial_access" | "review_required";
  features: string[]; notes: string;
};

const SAVED = (rawStops as Stop[]).filter(
  (s) => s.lat > -37.726 && s.lat < -37.700 && s.lng > 145.044 && s.lng < 145.062
).slice(0, 6);

export default function DesktopSavedPage() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar nav={USER_NAV} active="/d-saved" user={{ initials: "JD", name: "J. Doe", role: "Public user" }} />

      <div className="flex flex-1 flex-col min-w-0">
        <PageHeader title="Saved Stops" subtitle="Your favourites" />
        <main className="flex-1 p-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
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
                {SAVED.map((s, i) => (
                  <tr key={s.id} className={i < SAVED.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}>
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{s.name}</td>
                    <td className="px-5 py-3 capitalize text-slate-400 dark:text-slate-500">{s.mode}</td>
                    <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <a href={`/d-scan?id=${encodeURIComponent(s.id)}&name=${encodeURIComponent(s.name)}&mode=${encodeURIComponent(s.mode)}&status=${encodeURIComponent(s.status)}`}
                        className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Scan</a>
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