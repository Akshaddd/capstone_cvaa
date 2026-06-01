"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar, PageHeader, StatusBadge, USER_NAV } from "../shared-desktop";
import rawStops from "../data/stops.json";

type StopStatus = "mostly_accessible" | "partial_access" | "review_required";

type Stop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  mode: "tram" | "bus";
  status: StopStatus;
  features: string[];
  notes: string;
};

type SavedStop = Stop & {
  lastAssessment?: string;
  source?: "Saved" | "Recent assessment";
};

const STOP_STATUS_KEYS = ["myaccess_stop_statuses", "myaccess_stop_status", "stopStatuses"];
const REPORT_HISTORY_KEY = "myaccess_report_history";
const HIDDEN_SAVED_STOPS_KEY = "myaccess_hidden_saved_stops";

const DEFAULT_SAVED = (rawStops as Stop[])
  .filter((s) => s.lat > -37.726 && s.lat < -37.700 && s.lng > 145.044 && s.lng < 145.062)
  .slice(0, 6);

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readStopStatuses() {
  for (const key of STOP_STATUS_KEYS) {
    const value = readJson<Record<string, StopStatus>>(key, {});
    if (Object.keys(value).length > 0) return value;
  }
  return {} as Record<string, StopStatus>;
}

function normalizeClassName(cls: string) {
  const lower = String(cls).toLowerCase().replace(/[\s-]+/g, "_");

  if (lower.includes("ramp") || lower.includes("level_access") || lower.includes("step_free")) return "ramp";
  if (lower.includes("tactile") || lower.includes("paving")) return "tactile";
  if (lower.includes("sign") || lower.includes("information")) return "signage";
  if (lower.includes("path") || lower.includes("clear_path") || lower.includes("travel")) return "path_of_travel";
  if (lower.includes("wheelchair")) return "wheelchair";
  if (lower.includes("bus")) return "bus";
  if (lower.includes("train")) return "train";
  if (lower.includes("tram")) return "tram";
  if (lower.includes("vehicle")) return "vehicle_access";
  if (lower.includes("person")) return "person";

  return lower;
}

function scoreReportDetections(rawDetections: Array<{ class?: string; confidence?: number }>) {
  const detections = rawDetections.map((d) => ({
    class: normalizeClassName(d.class ?? "unknown"),
    confidence: typeof d.confidence === "number" ? d.confidence : 0,
  }));

  const bestByClass = new Map<string, number>();
  detections.forEach((d) => {
    const current = bestByClass.get(d.class) ?? -1;
    if (d.confidence > current) bestByClass.set(d.class, d.confidence);
  });

  const hasBoardingContext = ["bus", "train", "tram", "vehicle_access", "path_of_travel", "person", "wheelchair", "ramp"].some((cls) => bestByClass.has(cls));
  const expected = hasBoardingContext ? ["ramp", "tactile", "signage", "path_of_travel"] : Array.from(bestByClass.keys());
  const classesToScore = Array.from(new Set([...expected, ...Array.from(bestByClass.keys()).filter((cls) => ["ramp", "tactile", "signage", "path_of_travel", "vehicle_access"].includes(cls))]));

  let passed = 0;
  let warnings = 0;
  let failed = 0;

  classesToScore.forEach((cls) => {
    const confidence = bestByClass.get(cls) ?? 0;
    const detectedThreshold = cls === "ramp" || cls === "wheelchair" ? 0.3 : 0.65;

    if (confidence >= detectedThreshold) passed += 1;
    else if (confidence >= 0.35) warnings += 1;
    else failed += 1;
  });

  return { passed, warnings, failed };
}

function buildCurrentReportFromSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem("scanResult");
    if (!raw) return null;

    const scan = JSON.parse(raw);
    const selectedStop = scan.selectedStop;
    if (!selectedStop?.id && !selectedStop?.name) return null;

    const detections = Array.isArray(scan.detections) ? scan.detections : [];
    const { warnings, failed } = scoreReportDetections(detections);

    return {
      stopId: selectedStop.id,
      stopName: selectedStop.name,
      stopMode: selectedStop.mode,
      scannedAt: scan.scannedAt ?? new Date().toISOString(),
      failed,
      warnings,
    };
  } catch {
    return null;
  }
}

function readRecentReports() {
  const stored = readJson<Array<{ stopId?: string; stopName?: string; stopMode?: string; scannedAt?: string; failed?: number; warnings?: number }>>(REPORT_HISTORY_KEY, []);
  const current = buildCurrentReportFromSession();
  const combined = current ? [current, ...stored] : stored;
  const seen = new Set<string>();

  const unique = combined
    .filter((report) => {
      const key = `${report.stopId ?? report.stopName}-${report.scannedAt}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.scannedAt ?? 0).getTime() - new Date(a.scannedAt ?? 0).getTime())
    .slice(0, 20);

  if (typeof window !== "undefined" && unique.length > 0) {
    window.localStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(unique));
  }

  return unique;
}

function statusFromReport(report: { failed?: number; warnings?: number }) : StopStatus {
  if ((report.failed ?? 0) > 0) return "review_required";
  if ((report.warnings ?? 0) > 0) return "partial_access";
  return "mostly_accessible";
}

function buildScanUrl(stop: SavedStop) {
  const params = new URLSearchParams({
    id: stop.id,
    name: stop.name,
    mode: stop.mode,
    status: stop.status,
  });

  return `/d-scan?${params.toString()}`;
}

function formatDate(value?: string) {
  if (!value) return "Not assessed yet";

  return new Date(value).toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DesktopSavedPage() {
  const [savedStops, setSavedStops] = useState<SavedStop[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const statuses = readStopStatuses();
    const reports = readRecentReports();
    const byId = new Map((rawStops as Stop[]).map((stop) => [stop.id, stop]));
    const hidden = new Set(readJson<string[]>(HIDDEN_SAVED_STOPS_KEY, []));

    const defaults = DEFAULT_SAVED.map((stop) => ({
      ...stop,
      status: statuses[stop.id] ?? stop.status,
      source: "Saved" as const,
    }));

    const assessedStops = reports
      .filter((report) => report.stopId || report.stopName)
      .map((report) => {
        const base = report.stopId ? byId.get(report.stopId) : undefined;
        const stop: SavedStop = {
          ...(base ?? {
            id: report.stopId ?? report.stopName ?? "unknown-stop",
            name: report.stopName ?? "Unknown stop",
            lat: 0,
            lng: 0,
            mode: (report.stopMode === "bus" ? "bus" : "tram") as "tram" | "bus",
            status: statusFromReport(report),
            features: [],
            notes: "Recently assessed stop.",
          }),
          status: report.stopId && statuses[report.stopId] ? statuses[report.stopId] : statusFromReport(report),
          lastAssessment: report.scannedAt,
          source: "Recent assessment",
        };
        return stop;
      });

    const combined = [...assessedStops, ...defaults];
    const seen = new Set<string>();
    const unique = combined.filter((stop) => {
      if (hidden.has(stop.id)) return false;
      if (seen.has(stop.id)) return false;
      seen.add(stop.id);
      return true;
    });

    setSavedStops(unique);
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return savedStops;

    return savedStops.filter((stop) =>
      stop.name.toLowerCase().includes(query) ||
      stop.mode.toLowerCase().includes(query) ||
      stop.id.toLowerCase().includes(query)
    );
  }, [savedStops, search]);

  const totals = useMemo(() => ({
    all: savedStops.length,
    accessible: savedStops.filter((s) => s.status === "mostly_accessible").length,
    partial: savedStops.filter((s) => s.status === "partial_access").length,
    review: savedStops.filter((s) => s.status === "review_required").length,
  }), [savedStops]);

  function removeStop(stop: SavedStop) {
    const confirmed = window.confirm(`Remove ${stop.name} from saved stops?`);
    if (!confirmed) return;

    const hidden = new Set(readJson<string[]>(HIDDEN_SAVED_STOPS_KEY, []));
    hidden.add(stop.id);
    window.localStorage.setItem(HIDDEN_SAVED_STOPS_KEY, JSON.stringify(Array.from(hidden)));

    const reports = readJson<Array<{ stopId?: string; stopName?: string; stopMode?: string; scannedAt?: string; failed?: number; warnings?: number }>>(REPORT_HISTORY_KEY, []);
    const nextReports = reports.filter((report) => {
      const reportKey = report.stopId ?? report.stopName;
      return reportKey !== stop.id && report.stopName !== stop.name;
    });
    window.localStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(nextReports));

    setSavedStops((current) => current.filter((item) => item.id !== stop.id));
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar nav={USER_NAV} active="/d-saved" user={{ initials: "OP", name: "Operator Team", role: "Network operator" }} />

      <div className="flex flex-1 flex-col min-w-0">
        <PageHeader
          title="Saved stops"
          subtitle="Stops saved or recently assessed for operator follow-up review"
          actions={
            <div className="flex items-center gap-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search saved stops..."
                className="w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <a href="/d-map" className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Open network map</a>
            </div>
          }
        />

        <main className="flex-1 p-6 space-y-5">
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Saved stops</p>
              <p className="mt-2 text-2xl font-bold">{totals.all}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Accessible</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totals.accessible}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Partial access</p>
              <p className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">{totals.partial}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Needs review</p>
              <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">{totals.review}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Stop</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Mode</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Last assessment</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((stop, index) => (
                  <tr key={stop.id} className={index < filtered.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">{stop.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{stop.source ?? "Saved"}{stop.notes ? ` · ${stop.notes}` : ""}</p>
                    </td>
                    <td className="px-5 py-4 capitalize text-slate-500 dark:text-slate-400">{stop.mode}</td>
                    <td className="px-5 py-4"><StatusBadge status={stop.status} /></td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{formatDate(stop.lastAssessment)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a href={buildScanUrl(stop)} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800">Capture evidence</a>
                        <button
                          type="button"
                          onClick={() => removeStop(stop)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-950 dark:hover:text-red-300 dark:hover:border-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-slate-400 dark:text-slate-500">No saved stops match your search.</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}