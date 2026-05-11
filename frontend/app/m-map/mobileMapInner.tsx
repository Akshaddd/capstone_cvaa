"use client";

import { useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import rawLocations from "../map/real-stops.json";

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

const locations = rawLocations as Stop[];

function markerColor(status: Stop["status"]) {
  if (status === "mostly_accessible") return "#16a34a";
  if (status === "partial_access") return "#d97706";
  return "#dc2626";
}
function statusLabel(status: Stop["status"]) {
  if (status === "mostly_accessible") return "Accessible";
  if (status === "partial_access") return "Partial";
  return "Review";
}
function statusChip(status: Stop["status"]) {
  if (status === "mostly_accessible") return "bg-emerald-100 text-emerald-700";
  if (status === "partial_access") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}
function createIcon(status: Stop["status"], selected: boolean) {
  const color = markerColor(status);
  const size = selected ? 20 : 14;
  const border = selected ? 3 : 2.5;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:999px;background:${color};border:${border}px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)${selected ? ";outline:3px solid " + color + "44" : ""}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -10],
  });
}

export default function MobileMapInner({ filter }: { filter: string }) {
  const router = useRouter();
  const mapRef = useRef<LeafletMap | null>(null);
  const [selected, setSelected] = useState<Stop | null>(null);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return locations;
    if (filter === "tram" || filter === "bus") return locations.filter((l) => l.mode === filter);
    return locations.filter((l) => l.status === filter);
  }, [filter]);

  const searchResults = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return locations.filter((l) => l.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  function flyToStop(loc: Stop) {
    setSelected(loc);
    setQuery("");
    setShowResults(false);
    mapRef.current?.flyTo([loc.lat, loc.lng], 16, { duration: 1 });
  }

  function handleScanStop(stop: Stop) {
    // Save selected stop to sessionStorage so scan page can read it
    sessionStorage.setItem("selectedStop", JSON.stringify({
      id: stop.id,
      name: stop.name,
      mode: stop.mode,
      status: stop.status,
    }));
    router.push("/m-scan");
  }

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {/* Search bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000]">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search stops..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            className="w-full rounded-2xl bg-white pl-8 pr-8 py-2.5 text-sm text-slate-900 shadow-lg outline-none placeholder:text-slate-400 border border-slate-200"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setShowResults(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base leading-none"
            >×</button>
          )}
        </div>

        {/* Search results */}
        {showResults && searchResults.length > 0 && (
          <div className="mt-1.5 rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
            {searchResults.map((loc, i) => (
              <button
                key={`search-${loc.id}-${i}`}
                onClick={() => flyToStop(loc)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0"
              >
                <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: markerColor(loc.status) }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{loc.name}</p>
                  <p className="text-[10px] text-slate-400">{loc.mode}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusChip(loc.status)}`}>
                  {statusLabel(loc.status)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <MapContainer
        center={[-37.72, 145.048]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
        zoomControl={false}
        onClick={() => { setShowResults(false); }}
      >
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {filtered.map((loc, i) => (
          <Marker
            key={`${loc.id}-${i}`}
            position={[loc.lat, loc.lng]}
            icon={createIcon(loc.status, selected?.id === loc.id)}
            eventHandlers={{
              click: () => {
                setSelected(loc);
                setShowResults(false);
                mapRef.current?.flyTo([loc.lat, loc.lng], 16, { duration: 0.8 });
              }
            }}
          />
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-1.5 rounded-2xl bg-white/90 p-3 shadow-lg backdrop-blur-sm">
        {[
          { color: "#16a34a", label: "Accessible" },
          { color: "#d97706", label: "Partial" },
          { color: "#dc2626", label: "Review" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Stop count */}
      <div className="absolute bottom-4 right-4 z-[1000] rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-lg backdrop-blur-sm">
        {filtered.length} stops
      </div>

      {/* Selected stop card */}
      {selected && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] rounded-2xl bg-white p-4 shadow-xl border border-slate-100">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900">{selected.name}</p>
              <p className="text-xs text-slate-500 mt-0.5 capitalize">{selected.mode} stop</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusChip(selected.status)}`}>
                {statusLabel(selected.status)}
              </span>
              <button onClick={() => setSelected(null)} className="text-slate-400 text-lg leading-none">×</button>
            </div>
          </div>

          {selected.notes && (
            <p className="text-xs text-slate-500 leading-relaxed mb-3">{selected.notes}</p>
          )}

          {/* Scan this stop button */}
          <button
            onClick={() => handleScanStop(selected)}
            className="w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-bold text-white active:opacity-80 transition-opacity"
          >
            📷 Scan this stop
          </button>
        </div>
      )}
    </div>
  );
}