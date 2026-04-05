"use client";

import { useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import rawLocations from "./real-stops.json";

type StopLocation = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  mode: "tram" | "bus";
  status: "mostly_accessible" | "partial_access" | "review_required";
  features: string[];
  notes: string;
};

const locations = rawLocations as StopLocation[];

type FilterOption =
  | "all"
  | "tram"
  | "bus"
  | "mostly_accessible"
  | "partial_access"
  | "review_required"
  | "wheelchair"
  | "ramp"
  | "handrail"
  | "elderly_friendly"
  | "tactile_paving";

function getStatusStyles(status: StopLocation["status"]) {
  switch (status) {
    case "mostly_accessible":
      return {
        label: "Mostly Accessible",
        backgroundColor: "#dcfce7",
        color: "#166534",
      };
    case "partial_access":
      return {
        label: "Partial Access",
        backgroundColor: "#fef3c7",
        color: "#92400e",
      };
    default:
      return {
        label: "Review Required",
        backgroundColor: "#fee2e2",
        color: "#991b1b",
      };
  }
}

function getMarkerColor(status: StopLocation["status"]) {
  switch (status) {
    case "mostly_accessible":
      return "#16a34a";
    case "partial_access":
      return "#d97706";
    default:
      return "#dc2626";
  }
}

function getFeatureLabel(feature: StopLocation["features"][number]) {
  switch (feature) {
    case "wheelchair":
      return "♿ Wheelchair";
    case "ramp":
      return "🛗 Ramp";
    case "handrail":
      return "🦯 Handrail";
    case "elderly_friendly":
      return "👴 Elderly Friendly";
    case "tactile_paving":
      return "🟨 Tactile";
    default:
      return feature;
  }
}

function createCustomIcon(status: StopLocation["status"]) {
  const color = getMarkerColor(status);

  return L.divIcon({
    className: "custom-accessibility-marker",
    html: `
      <div style="
        width: 18px;
        height: 18px;
        border-radius: 999px;
        background: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

function getFilterLabel(filter: FilterOption) {
  switch (filter) {
    case "all":
      return "All";
    case "tram":
      return "Tram";
    case "bus":
      return "Bus";
    case "mostly_accessible":
      return "Mostly Accessible";
    case "partial_access":
      return "Partial Access";
    case "review_required":
      return "Review Required";
    case "wheelchair":
      return "Wheelchair";
    case "ramp":
      return "Ramp";
    case "handrail":
      return "Handrail";
    case "elderly_friendly":
      return "Elderly Friendly";
    case "tactile_paving":
      return "Tactile Paving";
    default:
      return filter;
  }
}

function getModeBadgeStyles(mode: StopLocation["mode"]) {
  switch (mode) {
    case "tram":
      return {
        label: "Tram",
        backgroundColor: "#dbeafe",
        color: "#1d4ed8",
      };
    case "bus":
      return {
        label: "Bus",
        backgroundColor: "#ede9fe",
        color: "#6d28d9",
      };
    default:
      return {
        label: mode,
        backgroundColor: "#f3f4f6",
        color: "#374151",
      };
  }
}

export default function MapView() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef<Record<string, LeafletMarker | null>>({});

  const filteredLocations = useMemo(() => {
    if (activeFilter === "all") {
      return locations;
    }

    if (activeFilter === "tram" || activeFilter === "bus") {
      return locations.filter((loc) => loc.mode === activeFilter);
    }

    if (
      activeFilter === "mostly_accessible" ||
      activeFilter === "partial_access" ||
      activeFilter === "review_required"
    ) {
      return locations.filter((loc) => loc.status === activeFilter);
    }

    return locations.filter((loc) => loc.features.includes(activeFilter));
  }, [activeFilter]);

  const filterOptions: FilterOption[] = [
    "all",
    "tram",
    "bus",
    "mostly_accessible",
    "partial_access",
    "review_required",
    "wheelchair",
    "ramp",
    "handrail",
    "elderly_friendly",
    "tactile_paving",
  ];

  function getLocationKey(loc: StopLocation) {
    return `${loc.mode}-${loc.id}`;
  }

  function focusLocation(locationKey: string) {
    const location = filteredLocations.find((loc) => getLocationKey(loc) === locationKey);

    if (!location || !mapRef.current) {
      return;
    }

    setSelectedLocationId(locationKey);
    mapRef.current.flyTo([location.lat, location.lng], 15, {
      duration: 1.2,
    });

    window.setTimeout(() => {
      markerRefs.current[locationKey]?.openPopup();
    }, 300);
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        {filterOptions.map((filter) => {
          const isActive = activeFilter === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: "8px 12px",
                borderRadius: "999px",
                border: isActive ? "1px solid #111827" : "1px solid #d1d5db",
                backgroundColor: isActive ? "#111827" : "#ffffff",
                color: isActive ? "#ffffff" : "#111827",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {getFilterLabel(filter)}
            </button>
          );
        })}
      </div>

      <div
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <MapContainer
          center={[-37.72, 145.048] as [number, number]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredLocations.map((loc) => {
            const locationKey = getLocationKey(loc);
            const statusStyle = getStatusStyles(loc.status);
            const modeStyle = getModeBadgeStyles(loc.mode);
            const customIcon = createCustomIcon(loc.status);

            return (
              <Marker
                key={locationKey}
                position={[loc.lat, loc.lng] as [number, number]}
                icon={customIcon}
                ref={(marker) => {
                  markerRefs.current[locationKey] = marker;
                }}
              >
                <Popup>
                  <div style={{ minWidth: "240px" }}>
                    <h3
                      style={{
                        fontWeight: 700,
                        fontSize: "16px",
                        marginBottom: "10px",
                      }}
                    >
                      {loc.name}
                    </h3>

                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 600,
                        backgroundColor: statusStyle.backgroundColor,
                        color: statusStyle.color,
                        marginBottom: "12px",
                      }}
                    >
                      {statusStyle.label}
                    </span>

                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 600,
                        backgroundColor: modeStyle.backgroundColor,
                        color: modeStyle.color,
                        marginLeft: "8px",
                        marginBottom: "12px",
                      }}
                    >
                      {modeStyle.label}
                    </span>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "10px",
                        marginBottom: "6px",
                        fontSize: "12px",
                        color: "#4b5563",
                      }}
                    >
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "999px",
                          backgroundColor: getMarkerColor(loc.status),
                          display: "inline-block",
                        }}
                      />
                      Map marker matches this accessibility status
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        marginTop: "12px",
                        marginBottom: "12px",
                      }}
                    >
                      {loc.features.map((feature) => (
                        <span
                          key={feature}
                          style={{
                            backgroundColor: "#f3f4f6",
                            color: "#111827",
                            padding: "6px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 500,
                          }}
                        >
                          {getFeatureLabel(feature)}
                        </span>
                      ))}
                    </div>

                    <p
                      style={{
                        fontSize: "13px",
                        lineHeight: 1.5,
                        color: "#374151",
                        margin: 0,
                      }}
                    >
                      {loc.notes}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div style={{ marginTop: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#111827",
              margin: 0,
            }}
          >
            Nearby Locations
          </h2>
          <span
            style={{
              fontSize: "13px",
              color: "#6b7280",
            }}
          >
            {filteredLocations.length} shown
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "12px",
          }}
        >
          {filteredLocations.map((loc) => {
            const locationKey = getLocationKey(loc);
            const statusStyle = getStatusStyles(loc.status);
            const modeStyle = getModeBadgeStyles(loc.mode);

            return (
              <button
                key={`card-${locationKey}`}
                type="button"
                onClick={() => focusLocation(locationKey)}
                style={{
                  backgroundColor: "#ffffff",
                  border:
                    selectedLocationId === locationKey
                      ? "1px solid #111827"
                      : "1px solid #e5e7eb",
                  borderRadius: "16px",
                  padding: "16px",
                  boxShadow:
                    selectedLocationId === locationKey
                      ? "0 8px 18px rgba(17,24,39,0.12)"
                      : "0 4px 14px rgba(0,0,0,0.04)",
                  textAlign: "left",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    {loc.name}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "6px",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 600,
                        backgroundColor: statusStyle.backgroundColor,
                        color: statusStyle.color,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {statusStyle.label}
                    </span>

                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 600,
                        backgroundColor: modeStyle.backgroundColor,
                        color: modeStyle.color,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {modeStyle.label}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginBottom: "10px",
                  }}
                >
                  {loc.features.slice(0, 3).map((feature) => (
                    <span
                      key={`card-feature-${locationKey}-${feature}`}
                      style={{
                        backgroundColor: "#f3f4f6",
                        color: "#111827",
                        padding: "5px 9px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 500,
                      }}
                    >
                      {getFeatureLabel(feature)}
                    </span>
                  ))}
                </div>

                <p
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.5,
                    color: "#4b5563",
                    margin: 0,
                  }}
                >
                  {loc.notes}
                </p>

                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  View on map
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
