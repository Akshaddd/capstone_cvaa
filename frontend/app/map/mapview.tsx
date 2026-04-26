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

type UserLocation = {
  lat: number;
  lng: number;
};

type SuggestedStopLocation = StopLocation & {
  distanceKm?: number;
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

function getDistanceKm(from: UserLocation, to: { lat: number; lng: number }) {
  const earthRadiusKm = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m away`;
  return `${distanceKm.toFixed(1)} km away`;
}

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

function createUserLocationIcon() {
  return L.divIcon({
    className: "custom-user-location-marker",
    html: `
      <div style="
        width: 22px;
        height: 22px;
        border-radius: 999px;
        background: #2563eb;
        border: 4px solid white;
        box-shadow: 0 0 0 8px rgba(37,99,235,0.18), 0 4px 12px rgba(15,23,42,0.3);
      "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
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
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const mapRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef<Record<string, LeafletMarker | null>>({});

  const filteredLocations = useMemo(() => {
    if (activeFilter === "all") return locations;

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

  const suggestedLocations = useMemo<SuggestedStopLocation[]>(() => {
    if (!userLocation) return filteredLocations;

    return [...filteredLocations]
      .map((loc) => ({
        ...loc,
        distanceKm: getDistanceKm(userLocation, loc),
      }))
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }, [filteredLocations, userLocation]);

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
    const location = suggestedLocations.find((loc) => getLocationKey(loc) === locationKey);

    if (!location || !mapRef.current) return;

    setSelectedLocationId(locationKey);
    mapRef.current.flyTo([location.lat, location.lng], 15, {
      duration: 1.2,
    });

    window.setTimeout(() => {
      markerRefs.current[locationKey]?.openPopup();
    }, 300);
  }

  function useDeviceLocation() {
    if (!navigator.geolocation) {
      setLocationError("Location is not supported by this browser.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(nextLocation);
        setIsLocating(false);

        if (mapRef.current) {
          mapRef.current.flyTo([nextLocation.lat, nextLocation.lng], 14, {
            duration: 1.2,
          });
        }
      },
      () => {
        setLocationError("Could not access your location. Please allow location permission and try again.");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#111827",
        display: "grid",
        gridTemplateColumns: "360px 1fr",
        gap: 0,
      }}
    >
      <aside
        style={{
          background: "#ffffff",
          borderRight: "1px solid #e5e7eb",
          padding: "22px",
          overflowY: "auto",
          height: "100vh",
        }}
      >
        <div style={{ marginBottom: "22px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#ecfdf5",
              border: "1px solid #bbf7d0",
              color: "#166534",
              borderRadius: "999px",
              padding: "7px 11px",
              fontSize: "12px",
              fontWeight: 800,
              marginBottom: "12px",
            }}
          >
            Live accessibility network
          </div>

          <h1
            style={{
              fontSize: "27px",
              lineHeight: 1.1,
              fontWeight: 850,
              margin: "0 0 8px",
              letterSpacing: "-0.03em",
            }}
          >
            Accessibility Map
          </h1>

          <p
            style={{
              color: "#64748b",
              fontSize: "14px",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Explore tram and bus stops by accessibility status, transport mode and available features.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "12px",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: 850 }}>{suggestedLocations.length}</div>
            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700 }}>Shown</div>
          </div>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "12px",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: 850 }}>{locations.length}</div>
            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700 }}>Total</div>
          </div>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "12px",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: 850 }}>
              {locations.filter((loc) => loc.status === "mostly_accessible").length}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700 }}>Accessible</div>
          </div>
        </div>

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            padding: "14px",
            marginBottom: "20px",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 850, marginBottom: "6px" }}>
            Find closest stops
          </div>

          <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5, margin: "0 0 12px" }}>
            Use your device location to sort nearby tram and bus stops by distance.
          </p>

          <button
            type="button"
            onClick={useDeviceLocation}
            disabled={isLocating}
            style={{
              width: "100%",
              border: "none",
              borderRadius: "14px",
              padding: "10px 12px",
              background: isLocating ? "#bbf7d0" : "#16a34a",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 850,
              cursor: isLocating ? "not-allowed" : "pointer",
            }}
          >
            {isLocating ? "Locating..." : userLocation ? "Refresh my location" : "Use my location"}
          </button>

          {userLocation && (
            <div style={{ fontSize: "12px", color: "#166534", fontWeight: 750, marginTop: "10px" }}>
              Showing closest stops first
            </div>
          )}

          {locationError && (
            <div style={{ fontSize: "12px", color: "#b91c1c", fontWeight: 700, marginTop: "10px" }}>
              {locationError}
            </div>
          )}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "12px",
              color: "#475569",
              fontWeight: 850,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "10px",
            }}
          >
            Filters
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
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
                    border: isActive ? "1px solid #16a34a" : "1px solid #d1d5db",
                    backgroundColor: isActive ? "#16a34a" : "#ffffff",
                    color: isActive ? "#ffffff" : "#111827",
                    fontSize: "12px",
                    fontWeight: 750,
                    cursor: "pointer",
                    boxShadow: isActive ? "0 8px 18px rgba(22, 163, 74, 0.22)" : "none",
                  }}
                >
                  {getFilterLabel(filter)}
                </button>
              );
            })}
          </div>
        </div>

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
              fontSize: "16px",
              fontWeight: 850,
              color: "#111827",
              margin: 0,
            }}
          >
            Nearby Locations
          </h2>
          <span
            style={{
              fontSize: "12px",
              color: "#64748b",
              fontWeight: 700,
            }}
          >
            {suggestedLocations.length} shown
          </span>
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          {suggestedLocations.map((loc) => {
            const locationKey = getLocationKey(loc);
            const statusStyle = getStatusStyles(loc.status);
            const modeStyle = getModeBadgeStyles(loc.mode);
            const isSelected = selectedLocationId === locationKey;

            return (
              <button
                key={`card-${locationKey}`}
                type="button"
                onClick={() => focusLocation(locationKey)}
                style={{
                  backgroundColor: isSelected ? "#f0fdf4" : "#ffffff",
                  border: isSelected ? "1px solid #16a34a" : "1px solid #e5e7eb",
                  borderRadius: "18px",
                  padding: "14px",
                  boxShadow: isSelected
                    ? "0 12px 26px rgba(22,163,74,0.14)"
                    : "0 8px 18px rgba(15,23,42,0.04)",
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
                      fontSize: "14px",
                      lineHeight: 1.35,
                      fontWeight: 800,
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    {loc.name}
                  </h3>

                  <span
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "999px",
                      backgroundColor: getMarkerColor(loc.status),
                      boxShadow: "0 0 0 4px rgba(226,232,240,0.8)",
                      flexShrink: 0,
                      marginTop: "3px",
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "5px 9px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 750,
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
                      padding: "5px 9px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 750,
                      backgroundColor: modeStyle.backgroundColor,
                      color: modeStyle.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {modeStyle.label}
                  </span>

                  {typeof loc.distanceKm === "number" && (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "5px 9px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 750,
                        backgroundColor: "#ecfdf5",
                        color: "#166534",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDistance(loc.distanceKm)}
                    </span>
                  )}
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
                        backgroundColor: "#f1f5f9",
                        color: "#334155",
                        padding: "5px 8px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 650,
                      }}
                    >
                      {getFeatureLabel(feature)}
                    </span>
                  ))}
                </div>

                <p
                  style={{
                    fontSize: "12px",
                    lineHeight: 1.5,
                    color: "#64748b",
                    margin: 0,
                  }}
                >
                  {loc.notes}
                </p>
              </button>
            );
          })}
        </div>
      </aside>

      <main
        style={{
          height: "100vh",
          padding: "18px",
          display: "grid",
          gridTemplateRows: "auto 1fr",
          gap: "14px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "22px",
            padding: "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 750 }}>Active view</div>
            <div style={{ fontSize: "20px", fontWeight: 850, marginTop: "2px" }}>
              {userLocation ? `Closest ${getFilterLabel(activeFilter)} stops` : `${getFilterLabel(activeFilter)} stops`}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: "#475569", fontWeight: 700 }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "999px", backgroundColor: "#2563eb" }} />
              Your Location
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: "#475569", fontWeight: 700 }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "999px", backgroundColor: "#16a34a" }} />
              Mostly Accessible
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: "#475569", fontWeight: 700 }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "999px", backgroundColor: "#d97706" }} />
              Partial
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: "#475569", fontWeight: 700 }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "999px", backgroundColor: "#dc2626" }} />
              Review
            </div>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            borderRadius: "26px",
            overflow: "hidden",
            boxShadow: "0 18px 46px rgba(15,23,42,0.12)",
            border: "1px solid #e5e7eb",
            background: "#ffffff",
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

            {userLocation && (
              <Marker
                position={[userLocation.lat, userLocation.lng] as [number, number]}
                icon={createUserLocationIcon()}
              >
                <Popup>
                  <strong>Your location</strong>
                </Popup>
              </Marker>
            )}

            {suggestedLocations.map((loc) => {
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
                          fontWeight: 800,
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
                          fontWeight: 700,
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
                          fontWeight: 700,
                          backgroundColor: modeStyle.backgroundColor,
                          color: modeStyle.color,
                          marginLeft: "8px",
                          marginBottom: "12px",
                        }}
                      >
                        {modeStyle.label}
                      </span>

                      {typeof loc.distanceKm === "number" && (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 700,
                            backgroundColor: "#ecfdf5",
                            color: "#166534",
                            marginLeft: "8px",
                            marginBottom: "12px",
                          }}
                        >
                          {formatDistance(loc.distanceKm)}
                        </span>
                      )}

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
                              fontWeight: 600,
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
      </main>
    </div>
  );
}