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

function markerSize(stop: Stop, selected: boolean) {
  return selected ? 8 : 6;
}

function createStopMarker(stop: Stop, selected: boolean) {
  if (stop.mode === "bus") {
    const size = selected ? 14 : 11;
    const border = selected ? 2.5 : 2;

    return L.marker([stop.lat, stop.lng], {
      icon: L.divIcon({
        className: "myaccess-bus-marker",
        html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:3px;background:${STATUS_COLOR[stop.status]};border:${border}px solid #ffffff;box-shadow:0 0 0 1px rgba(15,23,42,0.18);box-sizing:border-box"></span>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
      }),
      keyboard: true,
      riseOnHover: true,
    });
  }

  return L.circleMarker([stop.lat, stop.lng], {
    radius: markerSize(stop, selected),
    color: "#ffffff",
    weight: selected ? 2.75 : 1.75,
    fillColor: STATUS_COLOR[stop.status],
    fillOpacity: 0.92,
  });
}

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

function pageAppearsDark() {
  if (typeof window === "undefined" || typeof document === "undefined") return false;

  const storedTheme = window.localStorage.getItem("theme") ?? window.localStorage.getItem("myaccess-theme");
  if (storedTheme === "dark") return true;
  if (storedTheme === "light") return false;

  return document.documentElement.classList.contains("dark") || document.body.classList.contains("dark");
}

function mapLegendHtml() {
  const isDark = pageAppearsDark();
  const cardBg = isDark ? "#0f172a" : "#ffffff";
  const border = isDark ? "rgba(51,65,85,0.95)" : "rgba(148,163,184,0.45)";
  const heading = isDark ? "#94a3b8" : "#64748b";
  const text = isDark ? "#cbd5e1" : "#334155";
  const divider = isDark ? "#334155" : "#e2e8f0";
  const shadow = isDark ? "0 18px 36px rgba(0,0,0,0.38)" : "0 10px 24px rgba(15,23,42,0.16)";

  return `
    <div style="background:${cardBg};border:1px solid ${border};border-radius:12px;padding:10px 12px;box-shadow:${shadow};font-family:system-ui,sans-serif;min-width:170px;margin-left:10px;margin-bottom:10px">
      <div style="font-size:10px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${heading};margin-bottom:8px">Marker key</div>
      <div style="display:grid;gap:6px;font-size:12px;color:${text}">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="width:11px;height:11px;border-radius:999px;background:#d97706;border:2px solid ${cardBg};box-shadow:0 0 0 1px rgba(148,163,184,0.45);display:inline-block;flex-shrink:0"></span>
          <span>Tram platform</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="width:11px;height:11px;border-radius:3px;background:#d97706;border:2px solid ${cardBg};box-shadow:0 0 0 1px rgba(148,163,184,0.45);display:inline-block;flex-shrink:0"></span>
          <span>Bus stop</span>
        </div>
        <div style="height:1px;background:${divider};margin:2px 0"></div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="width:9px;height:9px;border-radius:999px;background:#16a34a;display:inline-block;flex-shrink:0"></span>
          <span>Accessible</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="width:9px;height:9px;border-radius:999px;background:#d97706;display:inline-block;flex-shrink:0"></span>
          <span>Partial access</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="width:9px;height:9px;border-radius:999px;background:#dc2626;display:inline-block;flex-shrink:0"></span>
          <span>Needs review</span>
        </div>
      </div>
    </div>
  `;
}

function popupHtml(stop: Stop) {
  const background = stop.status === "mostly_accessible" ? "#d1fae5" : stop.status === "partial_access" ? "#fef9c3" : "#fee2e2";
  const color = stop.status === "mostly_accessible" ? "#047857" : stop.status === "partial_access" ? "#a16207" : "#b91c1c";

  return `
    <div style="min-width:170px;font-family:system-ui,sans-serif">
      <p style="font-weight:700;font-size:13px;margin:0 0 2px">${escapeHtml(stop.name)}</p>
      <p style="font-size:11px;color:#64748b;margin:0 0 8px;text-transform:capitalize">${stop.mode === "tram" ? "Tram platform" : "Bus stop"} · ${escapeHtml(stop.id)}</p>
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
  const modeLegendControlRef = useRef<L.Control | null>(null);

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
      if (modeLegendControlRef.current) modeLegendControlRef.current.remove();
      if (recenterControlRef.current) recenterControlRef.current.remove();
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      userMarkerRef.current = null;
      recenterControlRef.current = null;
      modeLegendControlRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    stops
      .filter((stop) => Number.isFinite(stop.lat) && Number.isFinite(stop.lng))
      .forEach((stop) => {
        const selected = selectedStop?.id === stop.id;
        const marker = createStopMarker(stop, selected);

        marker.bindPopup(popupHtml(stop));
        marker.on("click", () => {
          onSelectStop(stop);
        });
        marker.addTo(layer);

        if (selected) {
          window.setTimeout(() => marker.openPopup(), 0);
        }
      });
  }, [stops, selectedStop, onSelectStop]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (modeLegendControlRef.current) {
      modeLegendControlRef.current.remove();
      modeLegendControlRef.current = null;
    }

    let legendContainer: HTMLDivElement | null = null;
    const renderLegend = () => {
      if (legendContainer) legendContainer.innerHTML = mapLegendHtml();
    };

    const control = new L.Control({ position: "bottomleft" });

    control.onAdd = () => {
      legendContainer = L.DomUtil.create("div", "myaccess-mode-legend");
      legendContainer.innerHTML = mapLegendHtml();
      L.DomEvent.disableClickPropagation(legendContainer);
      return legendContainer;
    };

    control.addTo(map);
    modeLegendControlRef.current = control;

    const observer = new MutationObserver(renderLegend);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class", "data-theme"] });

    window.addEventListener("storage", renderLegend);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", renderLegend);
      control.remove();
      modeLegendControlRef.current = null;
      legendContainer = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedStop) return;

    const currentZoom = map.getZoom();
    const targetZoom = currentZoom < 15 ? 15 : currentZoom;
    map.panTo([selectedStop.lat, selectedStop.lng], { animate: true, duration: 0.45 });

    if (currentZoom < targetZoom) {
      map.setZoom(targetZoom, { animate: true });
    }
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
          <p style="font-size:11px;color:#64748b;margin:0">Use nearby stops for evidence capture. Blue marker shows current location.</p>
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

    let buttonRef: HTMLButtonElement | null = null;
    const applyButtonTheme = () => {
      if (!buttonRef) return;
      const isDark = pageAppearsDark();
      buttonRef.style.background = userLocation ? "#047857" : isDark ? "#0f172a" : "#ffffff";
      buttonRef.style.color = userLocation ? "#ffffff" : isDark ? "#cbd5e1" : "#0f172a";
    };

    const control = new L.Control({ position: "bottomright" });
    control.onAdd = () => {
      const container = L.DomUtil.create("div", "leaflet-bar myaccess-recenter-control");
      const button = L.DomUtil.create("button", "", container);
      buttonRef = button;

      button.type = "button";
      button.title = userLocation ? "Re-centre on your location" : "Use device location";
      button.setAttribute("aria-label", button.title);
      button.innerHTML = "⌖";
      button.style.width = "38px";
      button.style.height = "38px";
      button.style.border = "0";
      button.style.borderRadius = "10px";
      button.style.fontSize = "22px";
      button.style.fontWeight = "700";
      button.style.cursor = "pointer";
      button.style.boxShadow = "0 10px 24px rgba(15,23,42,0.22)";
      applyButtonTheme();

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

    const observer = new MutationObserver(applyButtonTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class", "data-theme"] });
    window.addEventListener("storage", applyButtonTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", applyButtonTheme);
      control.remove();
      recenterControlRef.current = null;
      buttonRef = null;
    };
  }, [userLocation, onRequestLocation]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}