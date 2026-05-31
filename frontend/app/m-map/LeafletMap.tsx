"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";

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
  partial_access: "#d97706",
  review_required: "#dc2626",
};

const STATUS_LABEL: Record<Stop["status"], string> = {
  mostly_accessible: "Accessible",
  partial_access: "Partial access",
  review_required: "Needs review",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function scanUrl(stop: Stop) {
  const params = new URLSearchParams({
    id: stop.id,
    name: stop.name,
    mode: stop.mode,
    status: stop.status,
  });

  return `/d-scan?${params.toString()}`;
}

function popupHtml(stop: Stop) {
  const background = stop.status === "mostly_accessible" ? "#d1fae5" : stop.status === "partial_access" ? "#fef9c3" : "#fee2e2";
  const color = stop.status === "mostly_accessible" ? "#047857" : stop.status === "partial_access" ? "#a16207" : "#b91c1c";

  return `
    <div style="min-width:170px;font-family:system-ui,sans-serif">
      <p style="font-weight:700;font-size:13px;margin:0 0 2px">${escapeHtml(stop.name)}</p>
      <p style="font-size:11px;color:#64748b;margin:0 0 8px;text-transform:capitalize">${escapeHtml(stop.mode)} stop · ${escapeHtml(stop.id)}</p>
      <p style="display:inline-block;font-size:10px;font-weight:700;padding:3px 10px;border-radius:99px;background:${background};color:${color};margin:0 0 8px">${STATUS_LABEL[stop.status]}</p>
      <p style="font-size:11px;color:#475569;line-height:1.4;margin:0 0 8px">${escapeHtml(stop.notes ?? "Select this stop to begin assessment.")}</p>
      <a href="${escapeHtml(scanUrl(stop))}" style="display:block;width:100%;padding:9px 0;border-radius:8px;background:#047857;color:white;border:none;font-weight:700;font-size:12px;cursor:pointer;text-align:center;text-decoration:none;box-sizing:border-box">
        Start assessment
      </a>
    </div>
  `;
}

export default function LeafletMap({
  stops,
  selectedStop,
  onSelectStop,
  onScanStop,
  userLocation,
  onRequestLocation,
}: {
  stops: Stop[];
  selectedStop: Stop | null;
  onSelectStop: (stop: Stop) => void;
  onScanStop?: (stop: Stop) => void;
  userLocation?: { lat: number; lng: number } | null;
  onRequestLocation?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const recenterControlRef = useRef<L.Control | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-37.7206, 145.0486],
      zoom: 14,
      minZoom: 11,
      maxZoom: 19,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const markerLayer = L.layerGroup().addTo(map);
    mapRef.current = map;
    markerLayerRef.current = markerLayer;

    const timer = window.setTimeout(() => map.invalidateSize(), 150);

    return () => {
      window.clearTimeout(timer);
      markerLayer.clearLayers();
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      userMarkerRef.current = null;
      recenterControlRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    stops
      .filter((stop) => Number.isFinite(stop.lat) && Number.isFinite(stop.lng))
      .forEach((stop, index) => {
        const selected = selectedStop?.id === stop.id;
        const marker = L.circleMarker([stop.lat, stop.lng], {
          radius: selected ? 10 : 7,
          color: "#ffffff",
          weight: selected ? 2.5 : 1.5,
          fillColor: STATUS_COLOR[stop.status],
          fillOpacity: 0.9,
        });

        marker.bindPopup(popupHtml(stop));
        marker.on("click", () => onSelectStop(stop));
        marker.addTo(layer);
      });
  }, [stops, selectedStop, onSelectStop]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedStop) return;
    map.flyTo([selectedStop.lat, selectedStop.lng], 16, { animate: true, duration: 0.7 });
  }, [selectedStop]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.removeFrom(map);
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const marker = L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 9,
        color: "#2563eb",
        weight: 3,
        fillColor: "#3b82f6",
        fillOpacity: 0.85,
      }).bindPopup(`
        <div style="min-width:130px;font-family:system-ui,sans-serif">
          <p style="font-weight:700;font-size:13px;margin:0 0 2px">Your location</p>
          <p style="font-size:11px;color:#64748b;margin:0">Use nearby stops for evidence capture.</p>
        </div>
      `);

      marker.addTo(map);
      userMarkerRef.current = marker;
      map.flyTo([userLocation.lat, userLocation.lng], 16, { animate: true, duration: 0.7 });
    }
  }, [userLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (recenterControlRef.current) {
      recenterControlRef.current.remove();
      recenterControlRef.current = null;
    }

    const control = new L.Control({ position: "bottomright" });
    control.onAdd = () => {
      const container = L.DomUtil.create("div", "leaflet-bar myaccess-recenter-control");
      const button = L.DomUtil.create("button", "", container);

      button.type = "button";
      button.title = userLocation ? "Re-centre on your location" : "Use device location";
      button.setAttribute("aria-label", button.title);
      button.innerHTML = "⌖";
      button.style.width = "38px";
      button.style.height = "38px";
      button.style.border = "0";
      button.style.borderRadius = "10px";
      button.style.background = userLocation ? "#047857" : "#ffffff";
      button.style.color = userLocation ? "#ffffff" : "#0f172a";
      button.style.fontSize = "22px";
      button.style.fontWeight = "700";
      button.style.cursor = "pointer";
      button.style.boxShadow = "0 10px 24px rgba(15,23,42,0.22)";

      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.on(button, "click", (event) => {
        L.DomEvent.preventDefault(event);
        if (userLocation) {
          map.flyTo([userLocation.lat, userLocation.lng], 16, { animate: true, duration: 0.7 });
        } else {
          onRequestLocation?.();
        }
      });

      return container;
    };

    control.addTo(map);
    recenterControlRef.current = control;

    return () => {
      control.remove();
      recenterControlRef.current = null;
    };
  }, [userLocation, onRequestLocation]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}