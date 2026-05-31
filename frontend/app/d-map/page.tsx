"use client";

import { useMemo, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { Sidebar, PageHeader, StatusBadge, USER_NAV } from "../shared-desktop";
import rawStops from "../data/stops.json";

type Stop = {
  id: string; name: string; lat: number; lng: number;
  mode: "tram" | "bus";
  status: "mostly_accessible" | "partial_access" | "review_required";
  features: string[]; notes: string;
};

const ALL_STOPS = rawStops as Stop[];

const LeafletMap = dynamic(() => import("../m-map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
      <div className="text-center">
        <div className="w-7 h-7 border-[3px] border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-400 dark:text-slate-500">Loading map...</p>
      </div>
    </div>
  ),
});

const FILTERS = ["All", "Tram", "Bus", "Accessible", "Partial", "Review"];

export default function DesktopMapPage() {
  const [filter,   setFilter]   = useState("All");
  const [selected, setSelected] = useState<Stop | null>(null);
  const [search,   setSearch]   = useState("");

  const filtered = useMemo(() => {
    let list = ALL_STOPS;
    if (filter === "Tram")       list = list.filter((s) => s.mode === "tram");
    if (filter === "Bus")        list = list.filter((s) => s.mode === "bus");
    if (filter === "Accessible") list = list.filter((s) => s.status === "mostly_accessible");
    if (filter === "Partial")    list = list.filter((s) => s.status === "partial_access");
    if (filter === "Review")     list = list.filter((s) => s.status === "review_required");
    if (search.trim()) list = list.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [filter, search]);

  function scanStop(stop: Stop) {
    window.location.href = `/d-scan?id=${encodeURIComponent(stop.id)}&name=${encodeURIComponent(stop.name)}&mode=${encodeURIComponent(stop.mode)}&status=${encodeURIComponent(stop.status)}`;
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}
      className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      <Sidebar nav={USER_NAV} active="/d-map" user={{ initials: "JD", name: "J. Doe", role: "Public user" }} />

      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, overflow: "hidden" }}>

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Accessibility Map</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{filtered.length} stops</p>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stops..."
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-600 w-56"
          />
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
            className="border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">

            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 flex-shrink-0">
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    filter === f
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}>
                  {f}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {filtered.slice(0, 200).map((stop) => (
                <button key={stop.id} onClick={() => setSelected(stop)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-slate-100 dark:border-slate-800 ${
                    selected?.id === stop.id
                      ? "bg-emerald-50 dark:bg-emerald-950 border-l-2 border-l-emerald-700"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{
                    background: stop.status === "mostly_accessible" ? "#16a34a" : stop.status === "partial_access" ? "#d97706" : "#dc2626"
                  }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{stop.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{stop.mode}</p>
                  </div>
                  <StatusBadge status={stop.status} />
                </button>
              ))}
              {filtered.length > 200 && (
                <p className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500 text-center">
                  Showing 200 of {filtered.length} — use filters to narrow down
                </p>
              )}
            </div>

            {selected && (
              <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex-shrink-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate mb-0.5">{selected.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 capitalize mb-3">{selected.mode} stop</p>
                <button onClick={() => scanStop(selected)}
                  className="w-full bg-emerald-700 text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-emerald-800">
                  Scan this stop
                </button>
              </div>
            )}
          </div>

          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <Suspense>
              <LeafletMap stops={filtered} selectedStop={selected} onSelectStop={setSelected} />
            </Suspense>

            <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm pointer-events-none">
              {[
                { color: "#16a34a", label: "Accessible" },
                { color: "#d97706", label: "Partial"    },
                { color: "#dc2626", label: "Review"     },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 last:mb-0">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
