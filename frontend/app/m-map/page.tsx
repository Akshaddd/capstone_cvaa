"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ThemeToggle, BottomNav, StatusBadge } from "../shared";
import rawStops from "../data/stops.json";

type Stop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  mode: "tram" | "bus";
  status: "mostly_accessible" | "partial_access" | "review_required";
  features: string[];
  notes: string;
};

const ALL_STOPS = rawStops as Stop[];

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
      <div className="text-center">
        <div className="w-7 h-7 border-[3px] border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400 dark:text-slate-500">Loading map...</p>
      </div>
    </div>
  ),
});

const FILTERS = [
  { key: "all",               label: "All"        },
  { key: "tram",              label: "Tram"        },
  { key: "bus",               label: "Bus"         },
  { key: "mostly_accessible", label: "Accessible"  },
  { key: "partial_access",    label: "Partial"     },
  { key: "review_required",   label: "Review"      },
];

const NAV = [
  { label: "Home",    href: "/m-home"    },
  { label: "Scan",    href: "/m-scan"    },
  { label: "Map",     href: "/m-map"     },
  { label: "Reports", href: "/m-reports" },
];

export default function MapPage() {
  const [filter,   setFilter]   = useState("all");
  const [selected, setSelected] = useState<Stop | null>(null);
  const [view,     setView]     = useState<"map" | "list">("map");

  const filtered = useMemo(() => {
    if (filter === "all") return ALL_STOPS;
    if (filter === "tram" || filter === "bus")
      return ALL_STOPS.filter((s) => s.mode === filter);
    return ALL_STOPS.filter((s) => s.status === filter);
  }, [filter]);

  function selectStop(stop: Stop) {
    setSelected(stop);
    setView("map");
  }

  function scanStop(stop: Stop) {
    const url = `/m-scan?id=${encodeURIComponent(stop.id)}&name=${encodeURIComponent(stop.name)}&mode=${encodeURIComponent(stop.mode)}&status=${encodeURIComponent(stop.status)}`;
    window.location.href = url;
  }

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900" style={{ height: "100dvh", overflow: "hidden" }}>

      <header className="flex-shrink-0 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-5 py-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Accessibility Map</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{filtered.length} stops</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="/m-home"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
          >
            ← Back
          </a>
        </div>
      </header>

      <div className="flex-shrink-0 overflow-x-auto bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-2.5">
        <div className="flex gap-2" style={{ width: "max-content" }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold ${
                filter === f.key
                  ? "bg-emerald-700 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        {(["map", "list"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-2.5 text-xs font-semibold capitalize border-b-2 transition-colors ${
              view === v
                ? "border-emerald-700 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400"
                : "border-transparent text-slate-400 dark:text-slate-500"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === "map" && (
        <>
          <div className="relative flex-shrink-0" style={{ height: "50%" }}>
            <LeafletMap
              stops={filtered}
              selectedStop={selected}
              onSelectStop={selectStop}
            />
            <div className="absolute bottom-3 left-3 z-20 bg-white/95 dark:bg-slate-900/95 rounded-xl p-2.5 shadow pointer-events-none">
              {[
                { color: "#16a34a", label: "Accessible" },
                { color: "#d97706", label: "Partial"    },
                { color: "#dc2626", label: "Review"     },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1 last:mb-0">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {selected ? (
            <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 py-3">
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{selected.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 capitalize mt-0.5">{selected.mode} stop</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={selected.status} />
                  <button
                    onClick={() => setSelected(null)}
                    className="text-xl text-slate-400 dark:text-slate-500 leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
              <button
                onClick={() => scanStop(selected)}
                className="w-full bg-emerald-700 text-white font-bold text-sm rounded-xl py-3"
              >
                Scan this stop
              </button>
            </div>
          ) : (
            <div className="flex-shrink-0 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 px-4 py-2.5">
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center">Tap a marker to select a stop</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50 dark:bg-slate-950">
            {filtered.slice(0, 100).map((stop) => (
              <button
                key={stop.id}
                onClick={() => selectStop(stop)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-slate-100 dark:border-slate-800 ${
                  selected?.id === stop.id
                    ? "bg-emerald-50 dark:bg-emerald-950 border-l-[3px] border-l-emerald-700"
                    : "bg-white dark:bg-slate-900"
                }`}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{
                  background: stop.status === "mostly_accessible" ? "#16a34a" : stop.status === "partial_access" ? "#d97706" : "#dc2626"
                }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{stop.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{stop.mode}</p>
                </div>
                <StatusBadge status={stop.status} />
              </button>
            ))}
            <div className="h-16" />
          </div>
        </>
      )}

      {view === "list" && (
        <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50 dark:bg-slate-950">
          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {filtered.length} stops
          </p>
          {filtered.map((stop) => (
            <button
              key={stop.id}
              onClick={() => { setSelected(stop); setView("map"); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800"
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{
                background: stop.status === "mostly_accessible" ? "#16a34a" : stop.status === "partial_access" ? "#d97706" : "#dc2626"
              }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{stop.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{stop.mode}</p>
              </div>
              <StatusBadge status={stop.status} />
            </button>
          ))}
          <div className="h-16" />
        </div>
      )}

      <BottomNav items={NAV} active="/m-map" />
    </div>
  );
}
