"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Sidebar, StatusBadge, USER_NAV, COUNCIL_NAV, PTV_NAV } from "../shared-desktop";
import rawStops from "../data/stops.json";

type Stop = {
  id: string; name: string; lat: number; lng: number;
  mode: "tram" | "bus";
  status: "mostly_accessible" | "partial_access" | "review_required";
  features: string[]; notes: string;
};

const STOP_STATUS_OVERRIDES_KEY = "myaccess_stop_status_overrides";
type StopStatus = Stop["status"];

function readStopStatusOverrides() {
  if (typeof window === "undefined") return {} as Record<string, StopStatus>;

  try {
    const raw = window.localStorage.getItem(STOP_STATUS_OVERRIDES_KEY);
    if (!raw) return {} as Record<string, StopStatus>;
    return JSON.parse(raw) as Record<string, StopStatus>;
  } catch {
    return {} as Record<string, StopStatus>;
  }
}

type UserLocation = { lat: number; lng: number } | null;

const CAMPUS_STOPS: Stop[] = [
  {
    id: "768",
    name: "La Trobe Uni Jenny Graves Building/Science Dr",
    lat: -37.720962,
    lng: 145.046527,
    mode: "bus",
    status: "partial_access",
    features: ["Passenger information", "Path of travel", "Campus interchange"],
    notes: "Official public transport stop near the Jenny Graves Building. Capture path of travel, waiting area and passenger information signage.",
  },
  {
    id: "48036",
    name: "La Trobe Uni Jenny Graves Building/Science Dr",
    lat: -37.720599,
    lng: 145.046332,
    mode: "bus",
    status: "partial_access",
    features: ["Passenger information", "Path of travel", "Campus interchange"],
    notes: "Official public transport stop near the Jenny Graves Building. Recommended for campus bus accessibility evidence capture.",
  },
  {
    id: "405",
    name: "La Trobe Uni Jenny Graves Building/Science Dr",
    lat: -37.72086,
    lng: 145.046337,
    mode: "bus",
    status: "partial_access",
    features: ["Passenger information", "Path of travel", "Campus interchange"],
    notes: "Official public transport stop near the Jenny Graves Building. Capture approach path, boarding zone and signage.",
  },
  {
    id: "6664",
    name: "La Trobe University",
    lat: -37.717221,
    lng: 145.044277,
    mode: "bus",
    status: "partial_access",
    features: ["Boarding zone", "Passenger information", "Path of travel"],
    notes: "Official La Trobe University bus stop. Capture bus bay alignment, waiting area and route information.",
  },
  {
    id: "6665",
    name: "La Trobe University",
    lat: -37.717119,
    lng: 145.044109,
    mode: "bus",
    status: "partial_access",
    features: ["Boarding zone", "Passenger information", "Path of travel"],
    notes: "Official La Trobe University bus stop. Useful for campus accessibility assessment and operator review.",
  },
  {
    id: "4495",
    name: "La Trobe University/Plenty Rd #60",
    lat: -37.717367,
    lng: 145.042764,
    mode: "tram",
    status: "partial_access",
    features: ["Tactile indicators", "Platform access", "Route information"],
    notes: "Official Route 86 tram stop at La Trobe University. Capture platform edge, tactile indicators and passenger information.",
  },
  {
    id: "4186",
    name: "La Trobe University/Plenty Rd #60",
    lat: -37.716447,
    lng: 145.043254,
    mode: "tram",
    status: "partial_access",
    features: ["Tactile indicators", "Platform access", "Route information"],
    notes: "Official Route 86 tram stop at La Trobe University. Capture both boarding edge and path of travel.",
  },
  {
    id: "2738",
    name: "La Trobe University Medical Centre/Plenty Rd",
    lat: -37.715667,
    lng: 145.044023,
    mode: "bus",
    status: "review_required",
    features: ["Boarding zone", "Passenger information"],
    notes: "Official stop near the La Trobe University Medical Centre. Review boarding zone, signage visibility and clear path.",
  },
  {
    id: "217",
    name: "La Trobe University Medical Centre/Plenty Rd",
    lat: -37.71607,
    lng: 145.043309,
    mode: "bus",
    status: "review_required",
    features: ["Boarding zone", "Passenger information"],
    notes: "Official stop near the La Trobe University Medical Centre. Recommended for capture of accessible path and passenger information.",
  },
  {
    id: "4496",
    name: "Preston Cemetery/Plenty Rd #59",
    lat: -37.719039,
    lng: 145.039759,
    mode: "tram",
    status: "review_required",
    features: ["Boarding zone", "Route information"],
    notes: "Official Route 86 tram stop near La Trobe. Capture platform edge, tactile indicators and approach path.",
  },
  {
    id: "4187",
    name: "Preston Cemetery/Plenty Rd #59",
    lat: -37.718982,
    lng: 145.039625,
    mode: "tram",
    status: "review_required",
    features: ["Boarding zone", "Route information"],
    notes: "Official Route 86 tram stop near La Trobe. Useful for testing nearby network assessment.",
  },
  {
    id: "4494",
    name: "Bundoora Park/Plenty Rd #61",
    lat: -37.713152,
    lng: 145.04562,
    mode: "tram",
    status: "review_required",
    features: ["Boarding zone", "Route information"],
    notes: "Official Route 86 tram stop north of La Trobe University. Capture boarding edge and accessible path.",
  },
  {
    id: "4185",
    name: "Bundoora Park/Plenty Rd #61",
    lat: -37.712488,
    lng: 145.046353,
    mode: "tram",
    status: "review_required",
    features: ["Boarding zone", "Route information"],
    notes: "Official Route 86 tram stop north of La Trobe University. Review passenger information and platform edge.",
  },
  {
    id: "4493",
    name: "Metropolitan Fire Brigade/Plenty Rd #62",
    lat: -37.710551,
    lng: 145.049103,
    mode: "tram",
    status: "review_required",
    features: ["Boarding zone", "Route information"],
    notes: "Official Route 86 tram stop near Bundoora. Recommended for broader corridor accessibility review.",
  },
  {
    id: "4183",
    name: "Metropolitan Fire Brigade/Plenty Rd #62",
    lat: -37.710531,
    lng: 145.048968,
    mode: "tram",
    status: "review_required",
    features: ["Boarding zone", "Route information"],
    notes: "Official Route 86 tram stop near Bundoora. Capture boarding edge, route information and path of travel.",
  },
];

const ALL_STOPS = [
  ...CAMPUS_STOPS,
  ...(rawStops as Stop[]).filter((stop) => !CAMPUS_STOPS.some((campusStop) => campusStop.id === stop.id)),
];

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
  const [userLocation, setUserLocation] = useState<UserLocation>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "locating" | "found" | "error">("idle");

const [userRole, setUserRole] = useState<"operator" | "compliance" | "council">("operator");
  const [roleReady, setRoleReady] = useState(false);
  const [sessionName, setSessionName] = useState("");

  const [statusOverrides, setStatusOverrides] = useState<Record<string, StopStatus>>({});

  useLayoutEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;

    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
    }

    if (storedTheme === "light") {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    const refreshOverrides = () => setStatusOverrides(readStopStatusOverrides());

    refreshOverrides();
    window.addEventListener("storage", refreshOverrides);
    window.addEventListener("focus", refreshOverrides);

    return () => {
      window.removeEventListener("storage", refreshOverrides);
      window.removeEventListener("focus", refreshOverrides);
    };
  }, []);

  useEffect(() => {
    const readRole = () => {
      const storedRole = window.localStorage.getItem("myaccess_user_role");
      const storedName = window.localStorage.getItem("myaccess_user_name") || "";
      setSessionName(storedName);
      if (storedRole === "council" || storedRole === "operator" || storedRole === "compliance") {
        setUserRole(storedRole);
      } else {
        setUserRole("operator");
      }
      setRoleReady(true);
    };

    readRole();
    window.addEventListener("storage", readRole);
    window.addEventListener("focus", readRole);

    return () => {
      window.removeEventListener("storage", readRole);
      window.removeEventListener("focus", readRole);
    };
  }, []);

  const nav = userRole === "council" ? COUNCIL_NAV : userRole === "compliance" ? PTV_NAV : USER_NAV;
  const initials = sessionName
    ? sessionName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
    : userRole === "council"
      ? "CR"
      : userRole === "compliance"
        ? "CO"
        : "OP";

  const sidebarUser = userRole === "council"
    ? { initials, name: sessionName || "Council Reviewer", role: "Council reviewer" }
    : userRole === "compliance"
      ? { initials, name: sessionName || "Compliance Officer", role: "Accessibility compliance" }
      : { initials, name: sessionName || "Operator User", role: "Network operator" };

  const stopsWithStatus = useMemo(
    () => ALL_STOPS.map((stop) => {
      const updatedStatus = statusOverrides[stop.id];
      if (!updatedStatus) return stop;

      return {
        ...stop,
        status: updatedStatus,
        notes: stop.notes.includes("Latest assessment updated this stop status.")
          ? stop.notes
          : `${stop.notes} Latest assessment updated this stop status.`,
      };
    }),
    [statusOverrides]
  );

  const filtered = useMemo(() => {
    let list = stopsWithStatus;
    if (filter === "Tram")       list = list.filter((s) => s.mode === "tram");
    if (filter === "Bus")        list = list.filter((s) => s.mode === "bus");
    if (filter === "Accessible") list = list.filter((s) => s.status === "mostly_accessible");
    if (filter === "Partial")    list = list.filter((s) => s.status === "partial_access");
    if (filter === "Review")     list = list.filter((s) => s.status === "review_required");
    if (search.trim()) list = list.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [filter, search, stopsWithStatus]);

  function distanceBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
  }

  function selectNearestStop(location: { lat: number; lng: number }) {
    const nearest = stopsWithStatus.reduce((best, stop) => {
      const distance = distanceBetween(location, stop);
      if (!best || distance < best.distance) return { stop, distance };
      return best;
    }, null as { stop: Stop; distance: number } | null);

    if (nearest) setSelected(nearest.stop);
  }

  function scanStop(stop: Stop) {
    window.location.href = `/d-scan?id=${encodeURIComponent(stop.id)}&name=${encodeURIComponent(stop.name)}&mode=${encodeURIComponent(stop.mode)}&status=${encodeURIComponent(stop.status)}`;
  }

  function useDeviceLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    setLocationStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(location);
        selectNearestStop(location);
        setLocationStatus("found");
      },
      () => setLocationStatus("error"),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}
      className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      <div className="w-64 flex-shrink-0">
        {roleReady ? (
          <Sidebar nav={nav} active="/d-map" user={sidebarUser} />
        ) : (
          <aside className="flex w-64 flex-shrink-0 flex-col h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700" />
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, overflow: "hidden" }}>

        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Network accessibility map</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
              {filtered.length} of {ALL_STOPS.length} stops shown · {Object.keys(statusOverrides).length} updated from latest assessments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={useDeviceLocation}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60"
              disabled={locationStatus === "locating"}
            >
              {locationStatus === "locating" ? "Finding location..." : locationStatus === "found" ? "Location shown" : "Use device location"}
            </button>
            <button
              type="button"
              onClick={() => {
                const campusLocation = { lat: -37.7206, lng: 145.0486 };
                setUserLocation(campusLocation);
                selectNearestStop(campusLocation);
                setLocationStatus("found");
              }}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Centre on La Trobe
            </button>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by stop name..."
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-600 w-64"
            />
          </div>
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

            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Map status</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-2 text-center">
                  <p className="text-sm font-bold text-emerald-500">{stopsWithStatus.filter((s) => s.status === "mostly_accessible").length}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Accessible</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-2 text-center">
                  <p className="text-sm font-bold text-yellow-500">{stopsWithStatus.filter((s) => s.status === "partial_access").length}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Partial</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-2 text-center">
                  <p className="text-sm font-bold text-red-500">{stopsWithStatus.filter((s) => s.status === "review_required").length}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Needs review</p>
                </div>
              </div>
              {locationStatus === "error" && (
                <p className="text-xs text-red-400 mt-2">Location unavailable. You can still search or select a stop manually.</p>
              )}
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {filtered.map((stop, index) => (
                <button key={`${stop.id}-${stop.lat}-${stop.lng}-${index}`} onClick={() => setSelected(stop)}
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
            </div>

            {selected && (
              <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex-shrink-0 bg-slate-50 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate mb-0.5">{selected.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{selected.mode} stop · {selected.id}</p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">{selected.notes}</p>
                <button onClick={() => scanStop(selected)}
                  className="w-full bg-emerald-700 text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-emerald-800">
                  Start accessibility assessment
                </button>
              </div>
            )}
          </div>

          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <LeafletMap
              key="desktop-network-map"
              stops={filtered}
              selectedStop={selected}
              onSelectStop={setSelected}
              userLocation={userLocation}
              onRequestLocation={useDeviceLocation}
            />

          </div>
        </div>
      </div>
    </div>
  );
}
