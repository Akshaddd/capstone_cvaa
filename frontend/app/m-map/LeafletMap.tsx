"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

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

function statusColor(s: Stop["status"]) {
  if (s === "mostly_accessible") return "#16a34a";
  if (s === "partial_access")    return "#d97706";
  return "#dc2626";
}

function statusLabel(s: Stop["status"]) {
  if (s === "mostly_accessible") return "Accessible";
  if (s === "partial_access")    return "Partial";
  return "Review";
}

// Sub-component: fly to the selected stop
function FlyTo({ stop }: { stop: Stop | null }) {
  const map = useMap();
  const prevId = useRef<string | null>(null);
  useEffect(() => {
    if (stop && stop.id !== prevId.current) {
      map.flyTo([stop.lat, stop.lng], 16, { animate: true, duration: 0.8 });
      prevId.current = stop.id;
    }
  }, [stop, map]);
  return null;
}

export default function LeafletMap({
  stops,
  onSelectStop,
  selectedStop,
}: {
  stops: Stop[];
  onSelectStop: (stop: Stop) => void;
  selectedStop: Stop | null;
}) {
  const center: LatLngExpression = [-37.813, 144.963];

  const displayStops = useMemo(() => stops.slice(0, 400), [stops]);

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      <FlyTo stop={selectedStop} />
      {displayStops.map((stop) => (
        <CircleMarker
          key={stop.id}
          center={[stop.lat, stop.lng]}
          radius={selectedStop?.id === stop.id ? 10 : 6}
          pathOptions={{
            color: "#fff",
            weight: selectedStop?.id === stop.id ? 2 : 1,
            fillColor: statusColor(stop.status),
            fillOpacity: 0.9,
          }}
          eventHandlers={{
            click: () => onSelectStop(stop),
          }}
        >
          <Popup>
            <div style={{ minWidth: 160, fontFamily: "sans-serif" }}>
              <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 2px" }}>{stop.name}</p>
              <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 6px", textTransform: "capitalize" }}>
                {stop.mode} stop
              </p>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99,
                background: stop.status === "mostly_accessible" ? "#d1fae5" : stop.status === "partial_access" ? "#fef9c3" : "#fee2e2",
                color: stop.status === "mostly_accessible" ? "#047857" : stop.status === "partial_access" ? "#a16207" : "#b91c1c",
              }}>
                {statusLabel(stop.status)}
              </span>
              <button
                onClick={() => onSelectStop(stop)}
                style={{
                  marginTop: 8, display: "block", width: "100%", padding: "8px 0",
                  background: "#047857", color: "white", border: "none", borderRadius: 10,
                  fontWeight: 700, fontSize: 12, cursor: "pointer",
                }}
              >
                Scan this stop
              </button>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
