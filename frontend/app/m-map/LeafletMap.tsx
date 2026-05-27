"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";

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

const STATUS_COLOR: Record<Stop["status"], string> = {
  mostly_accessible: "#16a34a",
  partial_access:    "#d97706",
  review_required:   "#dc2626",
};

const STATUS_LABEL: Record<Stop["status"], string> = {
  mostly_accessible: "Accessible",
  partial_access:    "Partial",
  review_required:   "Review",
};

function FlyTo({ stop }: { stop: Stop | null }) {
  const map   = useMap();
  const prevId = useRef<string | null>(null);

  useEffect(() => {
    if (stop && stop.id !== prevId.current) {
      map.flyTo([stop.lat, stop.lng], 16, { animate: true, duration: 0.7 });
      prevId.current = stop.id;
    }
  }, [stop, map]);

  return null;
}

export default function LeafletMap({
  stops,
  selectedStop,
  onSelectStop,
}: {
  stops: Stop[];
  selectedStop: Stop | null;
  onSelectStop: (stop: Stop) => void;
}) {
  // Cap at 300 markers for mobile performance
  const visible = useMemo(() => stops.slice(0, 300), [stops]);

  return (
    <MapContainer
      center={[-37.72, 145.05]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      <FlyTo stop={selectedStop} />

      {visible.map((stop) => (
        <CircleMarker
          key={stop.id}
          center={[stop.lat, stop.lng]}
          radius={selectedStop?.id === stop.id ? 10 : 7}
          pathOptions={{
            color: "#fff",
            weight: 1.5,
            fillColor: STATUS_COLOR[stop.status],
            fillOpacity: 0.9,
          }}
          eventHandlers={{ click: () => onSelectStop(stop) }}
        >
          <Popup>
            <div style={{ minWidth: 160, fontFamily: "system-ui, sans-serif" }}>
              <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 2px" }}>{stop.name}</p>
              <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 8px", textTransform: "capitalize" }}>
                {stop.mode} stop
              </p>
              <p style={{
                display: "inline-block",
                fontSize: 10, fontWeight: 700,
                padding: "3px 10px", borderRadius: 99,
                background: stop.status === "mostly_accessible" ? "#d1fae5" : stop.status === "partial_access" ? "#fef9c3" : "#fee2e2",
                color: stop.status === "mostly_accessible" ? "#047857" : stop.status === "partial_access" ? "#a16207" : "#b91c1c",
                marginBottom: 8,
              }}>
                {STATUS_LABEL[stop.status]}
              </p>
              <button
                onClick={() => onSelectStop(stop)}
                style={{
                  display: "block", width: "100%",
                  padding: "9px 0", borderRadius: 8,
                  background: "#047857", color: "white",
                  border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer",
                }}
              >
                Select this stop
              </button>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}