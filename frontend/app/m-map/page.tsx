"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ThemeProvider, ThemeToggle, BottomNav } from "../shared";
import rawLocations from "../map/real-stops.json";

// Dynamic import — Leaflet uses window so must be client-only, no SSR
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-[3px] border-emerald-700 border-t-transparent" />
        <p className="text-xs text-slate-500">Loading map…</p>
      </div>
    </div>
  ),
});

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

const ALL_STOPS = rawLocations as Stop[];

const FILTERS = [
  { key: "all",               label: "All"        },
  { key: "tram",              label: "Tram"        },
  { key: "bus",               label: "Bus"         },
  { key: "mostly_accessible", label: "Accessible"  },
  { key: "partial_access",    label: "Partial"     },
  { key: "review_required",   label: "Review"      },
];

const NAV = [
  { label: "Home",    href: "/m-home"   },
  { label: "Scan",    href: "/m-scan"   },
  { label: "Map",     href: "/m-map"    },
  { label: "Reports", href: "/m-report" },
];

function statusLabel(s: Stop["status"]) {
  if (s === "mostly_accessible") return "Accessible";
  if (s === "partial_access")    return "Partial";
  return "Review";
}

function statusColors(s: Stop["status"]) {
  if (s === "mostly_accessible") return { dot: "#16a34a", bg: "#d1fae5", text: "#047857" };
  if (s === "partial_access")    return { dot: "#d97706", bg: "#fef9c3", text: "#a16207" };
  return                                { dot: "#dc2626", bg: "#fee2e2", text: "#b91c1c" };
}

type ViewMode = "map" | "list";

function MapContent() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Stop | null>(null);
  const [view, setView] = useState<ViewMode>("map");

  const filtered = useMemo(() => {
    if (filter === "all") return ALL_STOPS;
    if (filter === "tram" || filter === "bus") return ALL_STOPS.filter((s) => s.mode === filter);
    return ALL_STOPS.filter((s) => s.status === filter);
  }, [filter]);

  function scanStop(stop: Stop) {
    sessionStorage.setItem("selectedStop", JSON.stringify({
      id: stop.id, name: stop.name, mode: stop.mode, status: stop.status,
    }));
    window.location.href = `/m-scan?id=${encodeURIComponent(stop.id)}&name=${encodeURIComponent(stop.name)}&mode=${encodeURIComponent(stop.mode)}&status=${encodeURIComponent(stop.status)}`;
  }

  function handleSelectStop(stop: Stop) {
    setSelected(stop);
    setView("map"); // always show map when a marker is tapped
  }

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-slate-900" style={{ overflow: "hidden" }}>

      {/* Header */}
      <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Accessibility Map</h1>
            <p className="text-xs text-slate-400">{filtered.length} stops · tap marker or row to select</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a href="/m-home" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
              ← Back
            </a>
          </div>
        </div>
      </header>

      {/* Filter pills */}
      <div className="shrink-0 overflow-x-auto border-b border-slate-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex gap-2" style={{ width: "max-content" }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                filter === f.key
                  ? "bg-emerald-700 text-white"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map / List toggle */}
      <div className="shrink-0 flex border-b border-slate-100 dark:border-slate-800">
        {(["map", "list"] as ViewMode[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${
              view === v
                ? "border-b-2 border-emerald-700 text-emerald-700 dark:text-emerald-400"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {v === "map" ? "🗺 Map" : "📋 List"}
          </button>
        ))}
      </div>

      {/* Map */}
      {view === "map" && (
        <div className="relative shrink-0" style={{ flex: "0 0 55%", minHeight: 220 }}>
          <LeafletMap
            stops={filtered}
            selectedStop={selected}
            onSelectStop={handleSelectStop}
          />
          {/* Legend */}
          <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-xl bg-white/95 p-2.5 shadow dark:bg-slate-800/95">
            {[
              { color: "#16a34a", label: "Accessible" },
              { color: "#d97706", label: "Partial"    },
              { color: "#dc2626", label: "Review"     },
            ].map((item) => (
              <div key={item.label} className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold text-slate-700 last:mb-0 dark:text-slate-300">
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected stop card (map mode) */}
      {view === "map" && selected && (
        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{selected.name}</p>
              <p className="text-xs capitalize text-slate-400 dark:text-slate-500">{selected.mode} stop</p>
            </div>
            <div className="flex items-center gap-2">
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                background: statusColors(selected.status).bg,
                color: statusColors(selected.status).text,
              }}>
                {statusLabel(selected.status)}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="text-xl leading-none text-slate-400 dark:text-slate-500"
              >×</button>
            </div>
          </div>
          <button
            onClick={() => scanStop(selected)}
            className="mt-2.5 w-full rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white active:bg-emerald-800"
          >
            Scan this stop
          </button>
        </div>
      )}

      {/* Stop list (list mode or below map) */}
      <div
        className="overflow-y-auto bg-slate-50 dark:bg-slate-950"
        style={{ flex: 1, minHeight: 0 }}
      >
        {view === "list" && (
          <p className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {filtered.length} stops
          </p>
        )}
        {view === "map" && (
          <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Tap a stop
          </p>
        )}
        {filtered.slice(0, 200).map((stop) => {
          const c = statusColors(stop.status);
          const isSelected = selected?.id === stop.id;
          return (
            <button
              key={stop.id}
              onClick={() => { handleSelectStop(stop); }}
              className="flex w-full items-center gap-3 border-b border-slate-100 bg-white px-4 py-4 text-left dark:border-slate-800 dark:bg-slate-900"
              style={{
                borderLeft: isSelected ? "3px solid #047857" : "3px solid transparent",
                background: isSelected ? "#f0fdf4" : undefined,
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{stop.name}</p>
                <p className="mt-0.5 text-xs capitalize text-slate-400 dark:text-slate-500">{stop.mode}</p>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99,
                background: c.bg, color: c.text, flexShrink: 0,
              }}>
                {statusLabel(stop.status)}
              </span>
            </button>
          );
        })}
        {filtered.length > 200 && (
          <p className="px-4 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
            Showing 200 of {filtered.length} stops — apply a filter to narrow down
          </p>
        )}
        {/* Bottom nav spacer */}
        <div style={{ height: 56 }} />
      </div>

      <BottomNav items={NAV} active="/m-map" />
    </div>
  );
}

export default function MapPage() {
  return (
    <ThemeProvider>
      <MapContent />
    </ThemeProvider>
  );
}
