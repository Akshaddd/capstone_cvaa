"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar, PageHeader, USER_NAV } from "../shared-desktop";

interface Report {
  reportId: string;
  stopId?: string;
  stopName: string;
  stopMode: string;
  scannedAt: string;
  passed: number;
  warnings: number;
  failed: number;
  score: number;
  source: "Live scan" | "Demo data" | "Evidence review";
}


const REPORT_HISTORY_KEY = "myaccess_report_history";
const DELETED_REPORTS_KEY = "myaccess_deleted_reports";
function readDeletedReports() {
  if (typeof window === "undefined") return [] as string[];

  try {
    const raw = window.localStorage.getItem(DELETED_REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as string[] : [];
  } catch {
    return [];
  }
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

  if (classesToScore.length === 0) {
    return { passed: 0, warnings: 0, failed: 0, score: 0 };
  }

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

  const total = Math.max(classesToScore.length, 1);
  const score = Math.max(0, Math.round(((passed + warnings * 0.5) / total) * 100));

  return { passed, warnings, failed, score };
}

function overall(r: Report) {
  if (r.failed > 0)   return { label: "Review required", cls: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", dot: "bg-red-500" };
  if (r.warnings > 0) return { label: "Partial access",  cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", dot: "bg-yellow-500" };
  return                     { label: "No issues flagged", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300", dot: "bg-emerald-500" };
}

function readHistory() {
  if (typeof window === "undefined") return [] as Report[];

  try {
    const raw = window.localStorage.getItem(REPORT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as Report[] : [];
  } catch {
    return [];
  }
}

function buildCurrentReport(): Report | null {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem("scanResult");
  if (!raw) return null;

  try {
    const r = JSON.parse(raw);
    const detections = Array.isArray(r.detections) ? r.detections : [];
    const { passed, warnings, failed, score } = scoreReportDetections(detections);
    const scannedAt = r.scannedAt ?? new Date().toISOString();
    const stopId = r.selectedStop?.id;

    return {
      reportId: `RPT-${new Date(scannedAt).getFullYear()}-${stopId ?? String(Math.floor(Math.random() * 9000) + 1000)}`,
      stopId,
      stopName: r.selectedStop?.name ?? "Unknown stop",
      stopMode: r.selectedStop?.mode ?? "transport",
      scannedAt,
      passed,
      warnings,
      failed,
      score,
      source: r._demo ? "Demo data" : "Live scan",
    };
  } catch {
    return null;
  }
}

function mergeReports(history: Report[], current: Report | null) {
  const combined = current ? [current, ...history] : history;
  const seen = new Set<string>();
  const deleted = typeof window !== "undefined" ? new Set(readDeletedReports()) : new Set<string>();

  return combined
    .filter((report) => {
      const key = `${report.stopId ?? report.stopName}-${report.scannedAt}`;
      if (deleted.has(key) || deleted.has(report.reportId)) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())
    .slice(0, 20);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DesktopReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const history = readHistory();
    const current = buildCurrentReport();
    const merged = mergeReports(history, current);
    setReports(merged);

    if (merged.length > 0) {
      window.localStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(merged));
    }
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return reports;

    return reports.filter((report) =>
      report.stopName.toLowerCase().includes(query) ||
      report.stopMode.toLowerCase().includes(query) ||
      report.reportId.toLowerCase().includes(query)
    );
  }, [reports, search]);

  const totals = useMemo(() => ({
    reports: reports.length,
    review: reports.filter((report) => report.failed > 0).length,
    partial: reports.filter((report) => report.failed === 0 && report.warnings > 0).length,
    clear: reports.filter((report) => report.failed === 0 && report.warnings === 0).length,
  }), [reports]);

  function removeReport(report: Report) {
    const confirmed = window.confirm(`Remove report ${report.reportId} from history?`);
    if (!confirmed) return;

    const reportKey = `${report.stopId ?? report.stopName}-${report.scannedAt}`;
    const deleted = new Set(readDeletedReports());
    deleted.add(reportKey);
    deleted.add(report.reportId);
    window.localStorage.setItem(DELETED_REPORTS_KEY, JSON.stringify(Array.from(deleted)));

    const nextReports = reports.filter((item) => {
      const itemKey = `${item.stopId ?? item.stopName}-${item.scannedAt}`;
      return itemKey !== reportKey && item.reportId !== report.reportId;
    });

    setReports(nextReports);
    window.localStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(nextReports));
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar nav={USER_NAV} active="/d-reports" user={{ initials: "OP", name: "Operator Team", role: "Network operator" }} />

      <div className="flex flex-1 flex-col min-w-0">
        <PageHeader
          title="Assessment history"
          subtitle={`${reports.length} saved operator assessment${reports.length !== 1 ? "s" : ""} from recent evidence captures`}
          actions={
            <div className="flex items-center gap-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reports..."
                className="w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <a href="/d-scan" className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Capture evidence</a>
            </div>
          }
        />

        <main className="flex-1 p-6 space-y-5">
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total reports</p>
              <p className="mt-2 text-2xl font-bold">{totals.reports}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">No issues</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totals.clear}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Partial access</p>
              <p className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">{totals.partial}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Review required</p>
              <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">{totals.review}</p>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-20 text-center">
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No reports yet</p>
              <p className="max-w-md text-sm text-slate-400 dark:text-slate-500 mb-6">Capture stop evidence to create an operator assessment history for compliance review, follow-up checks and audit tracking.</p>
              <a href="/d-scan" className="bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-800">Capture evidence</a>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Report</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Stop</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Captured</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Result mix</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Score</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((report, index) => {
                    const state = overall(report);
                    return (
                      <tr key={`${report.reportId}-${report.scannedAt}`} className={index < filtered.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}>
                        <td className="px-5 py-4">
                          <p className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">{report.reportId}</p>
                          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{report.source}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${state.dot}`} />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">{report.stopName}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{report.stopMode} stop{report.stopId ? ` · ${report.stopId}` : ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{formatDate(report.scannedAt)}</td>
                        <td className="px-5 py-4">
                          <div className="flex gap-3 text-xs font-semibold">
                            <span className="text-emerald-600 dark:text-emerald-400">{report.passed} detected</span>
                            <span className="text-yellow-600 dark:text-yellow-400">{report.warnings} review</span>
                            <span className="text-red-600 dark:text-red-400">{report.failed} not detected</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${report.score}%` }} />
                            </div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{report.score}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${state.cls}`}>{state.label}</span></td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a href="/d-report" className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800">Open report</a>
                            <button
                              type="button"
                              onClick={() => removeReport(report)}
                              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-950 dark:hover:text-red-300 dark:hover:border-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-slate-400 dark:text-slate-500">No reports match your search.</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}