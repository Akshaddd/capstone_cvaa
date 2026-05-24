"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { label: "Home",    href: "/m-home"   },
  { label: "Scan",    href: "/m-scan"   },
  { label: "Map",     href: "/m-map"    },
  { label: "Reports", href: "/m-report" },
];

const DSAPT: Record<string, {
  name: string; clause: string; description: string;
  passNote: string; failNote: string; action: string;
  severity: "critical" | "moderate" | "minor";
}> = {
  tactile: {
    name: "Tactile Ground Surface", clause: "DSAPT Clause 11.2",
    description: "Tactile indicators must be present at boarding zones to assist passengers with vision impairment.",
    passNote: "Compliant tactile indicators detected at the boarding zone.",
    failNote: "Tactile ground surface indicators not detected or insufficient at the boarding zone.",
    action: "Install or replace tactile indicators per AS 1428.4.1. Minimum 600mm depth from the kerb edge.",
    severity: "critical",
  },
  ramp: {
    name: "Kerb Ramp", clause: "DSAPT Clause 12.3",
    description: "A kerb ramp or level boarding must be provided for wheelchair and mobility aid access.",
    passNote: "Kerb ramp detected. Gradient appears compliant.",
    failNote: "No kerb ramp detected. Wheelchair users cannot board safely.",
    action: "Install a compliant kerb ramp: max 1:8 gradient, 1200mm minimum width, tactile hazard indicators at top.",
    severity: "critical",
  },
  wheelchair: {
    name: "Wheelchair Access", clause: "DSAPT Clause 13.1",
    description: "Stops must provide a clear path and boarding zone accessible to wheelchair users.",
    passNote: "Wheelchair access path detected and appears clear.",
    failNote: "Wheelchair access compromised — obstructions or insufficient clearance detected.",
    action: "Ensure 1800mm × 1800mm clear waiting area and unobstructed 1200mm path to the boarding point.",
    severity: "critical",
  },
  stop_sign: {
    name: "Accessible Signage", clause: "DSAPT Clause 17.2",
    description: "Stop information must be clearly visible and include route numbers and destination details.",
    passNote: "Accessible signage detected. Route information visible.",
    failNote: "Signage partially obstructed or unclear.",
    action: "Ensure signage is unobstructed, uses min 70pt font, and includes Braille or tactile elements.",
    severity: "moderate",
  },
  gap: {
    name: "Platform Gap Clearance", clause: "DSAPT Clause 15.4",
    description: "Gap between vehicle and platform must not exceed 80mm horizontal or 50mm vertical.",
    passNote: "Platform gap appears within acceptable DSAPT limits.",
    failNote: "Excessive platform gap detected — risk of mobility aid entrapment.",
    action: "Install platform humps, gap fillers, or portable ramps to reduce gap to within DSAPT limits.",
    severity: "critical",
  },
  tram: {
    name: "Tram Platform", clause: "DSAPT Clause 15.1",
    description: "Tram stops must provide a raised platform or level boarding to eliminate the step gap.",
    passNote: "Tram platform detected. Boarding appears compliant.",
    failNote: "Platform may be insufficient for step-free boarding.",
    action: "Upgrade to high-floor platform or install boarding ramp aligned to tram floor height.",
    severity: "critical",
  },
  bus: {
    name: "Vehicle Access", clause: "DSAPT Clause 13.3",
    description: "Buses must kerb-align within 230mm of the stop to enable step-free boarding.",
    passNote: "Vehicle alignment appears compliant.",
    failNote: "Kerb alignment may prevent accessible boarding.",
    action: "Review bus bay geometry and road markings to enable full kerb alignment.",
    severity: "moderate",
  },
  person: {
    name: "Path of Travel — Obstruction", clause: "DSAPT Clause 12.1",
    description: "Pedestrian traffic must not obstruct the accessible path to the boarding zone.",
    passNote: "Path of travel clear at time of scan.",
    failNote: "Obstruction detected on accessible path.",
    action: "Improve stop layout to separate waiting passengers from the accessible boarding path.",
    severity: "minor",
  },
};

function getEntry(cls: string) {
  return DSAPT[cls] ?? {
    name: cls.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    clause: "DSAPT General",
    description: "Accessibility feature detected by AI model.",
    passNote: "Feature detected and appears compliant.",
    failNote: "Feature detected with low confidence — manual review recommended.",
    action: "Conduct a manual accessibility audit to assess compliance.",
    severity: "minor" as const,
  };
}

function getStatus(confidence: number) {
  if (confidence >= 0.65) return "Pass";
  if (confidence >= 0.35) return "Warning";
  return "Failed";
}

const STATUS_ORDER   = { Failed: 0, Warning: 1, Pass: 2 };
const SEVERITY_ORDER = { critical: 0, moderate: 1, minor: 2 };

interface Detection { class: string; confidence: number; bbox: number[]; source_model?: string; }
interface ScanResult { detections?: Detection[]; stopName?: string; stopMode?: string; _demo?: boolean; selectedStop?: { name?: string; mode?: string } }

export default function ReportPage() {
  const [result,   setResult]   = useState<ScanResult | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("scanResult");
      if (raw) setResult(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-[3px] border-emerald-700 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading report…</p>
        </div>
      </div>
    );
  }

  const rawDetections: Detection[] = result?.detections?.length
    ? result.detections
    : [
        { class: "tactile",   confidence: 0.91, bbox: [] },
        { class: "ramp",      confidence: 0.83, bbox: [] },
        { class: "stop_sign", confidence: 0.52, bbox: [] },
        { class: "gap",       confidence: 0.28, bbox: [] },
      ];

  const deduped: Record<string, Detection> = {};
  for (const d of rawDetections) {
    if (!deduped[d.class] || d.confidence > deduped[d.class].confidence) {
      deduped[d.class] = d;
    }
  }

  const findings = Object.values(deduped)
    .map((d) => ({ ...d, status: getStatus(d.confidence), entry: getEntry(d.class) }))
    .sort((a, b) => {
      const s = STATUS_ORDER[a.status as keyof typeof STATUS_ORDER] - STATUS_ORDER[b.status as keyof typeof STATUS_ORDER];
      if (s !== 0) return s;
      return SEVERITY_ORDER[a.entry.severity] - SEVERITY_ORDER[b.entry.severity];
    });

  const passed   = findings.filter((f) => f.status === "Pass").length;
  const warnings = findings.filter((f) => f.status === "Warning").length;
  const failed   = findings.filter((f) => f.status === "Failed").length;
  const score    = Math.round((passed / Math.max(findings.length, 1)) * 100);
  const isReal   = !!result?.detections?.length && !result?._demo;

  const critical     = findings.filter((f) => f.status !== "Pass" && f.entry.severity === "critical").length;
  const overallLabel = failed > 0 ? "Non-compliant" : warnings > 0 ? "Partial" : "Compliant";
  const overallStyle = failed > 0
    ? "bg-red-100 text-red-700 border-red-200"
    : warnings > 0
    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
    : "bg-emerald-100 text-emerald-700 border-emerald-200";

  // Pull stop name from scanResult
  const displayName = result?.selectedStop?.name || result?.stopName || "Selected Stop";
  const displayMode = result?.selectedStop?.mode || result?.stopMode || "transport";

  const reportId = `RPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const summary = failed > 0
    ? `${critical > 0 ? `${critical} critical failure${critical > 1 ? "s" : ""} detected. ` : ""}This stop does not meet DSAPT 2002 requirements and requires remediation.${warnings > 0 ? ` ${warnings} additional item${warnings > 1 ? "s" : ""} flagged for review.` : ""}`
    : warnings > 0
    ? `No critical failures detected. ${warnings} item${warnings > 1 ? "s" : ""} require${warnings === 1 ? "s" : ""} review to achieve full DSAPT compliance.`
    : "All detected features meet DSAPT 2002 requirements. This stop appears fully accessible.";

  const chip = (s: string) =>
    s === "Pass"    ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
    s === "Warning" ? "bg-yellow-100 text-yellow-700 border-yellow-200"   :
                      "bg-red-100 text-red-700 border-red-200";

  const row = (s: string) =>
    s === "Pass"    ? "border-emerald-200 bg-emerald-50" :
    s === "Warning" ? "border-yellow-200 bg-yellow-50"   :
                      "border-red-200 bg-red-50";

  const severity = (s: string) =>
    s === "critical" ? "bg-red-100 text-red-700 border-red-200"           :
    s === "moderate" ? "bg-orange-100 text-orange-700 border-orange-200"   :
                       "bg-slate-100 text-slate-500 border-slate-200";

  return (
    <div className="min-h-screen bg-slate-50">

      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 pb-4 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900">{reportId}</p>
            <p className="text-xs text-slate-400 capitalize">{displayName} · {displayMode} stop</p>
          </div>
          <div className="flex items-center gap-2">
            {!isReal && (
              <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                Demo
              </span>
            )}
            <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
              Share
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-3 p-4 pb-24">

        {/* Score card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-emerald-700 text-lg font-bold text-emerald-700">
              {score}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-slate-900 truncate max-w-[140px]">{displayName}</h2>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${overallStyle}`}>
                  {overallLabel}
                </span>
              </div>
              <p className="text-xs capitalize text-slate-400">{displayMode} stop</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Scanned {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {isReal ? "Live AI scan" : "Demo data"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-base font-bold text-emerald-700">{passed}</p>
              <p className="text-slate-500">Passed</p>
            </div>
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-base font-bold text-yellow-600">{warnings}</p>
              <p className="text-slate-500">Warnings</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-base font-bold text-red-600">{failed}</p>
              <p className="text-slate-500">Failed</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Audit Summary
          </p>
          <p className="text-xs leading-relaxed text-slate-700">{summary}</p>
        </div>

        {/* Findings */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            DSAPT Findings · Tap to expand
          </p>
          <div className="flex flex-col gap-2">
            {findings.map((f) => {
              const open = expanded === f.class;
              return (
                <div key={f.class} className={`overflow-hidden rounded-2xl border ${row(f.status)}`}>
                  <button
                    className="flex w-full items-start justify-between gap-3 p-3.5 text-left"
                    onClick={() => setExpanded(open ? null : f.class)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-semibold text-slate-900">{f.entry.name}</p>
                        <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase ${severity(f.entry.severity)}`}>
                          {f.entry.severity}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">{f.entry.clause}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${chip(f.status)}`}>
                        {f.status}
                      </span>
                      <span className="text-[10px] text-slate-400">{open ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  {open && (
                    <div className="border-t border-black/5 px-3.5 pb-4 pt-3 flex flex-col gap-3">
                      <div>
                        <div className="mb-1 flex justify-between text-[10px] text-slate-400">
                          <span>Detection confidence</span>
                          <span>{Math.round(f.confidence * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/80">
                          <div
                            className={`h-1.5 rounded-full ${f.status === "Pass" ? "bg-emerald-500" : f.status === "Warning" ? "bg-yellow-400" : "bg-red-500"}`}
                            style={{ width: `${Math.round(f.confidence * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Standard requirement</p>
                        <p className="text-xs leading-relaxed text-slate-600">{f.entry.description}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Finding</p>
                        <p className="text-xs leading-relaxed text-slate-700">
                          {f.status === "Pass" ? f.entry.passNote : f.entry.failNote}
                        </p>
                      </div>
                      {f.status !== "Pass" && (
                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Recommended action</p>
                          <p className="text-xs leading-relaxed text-slate-700">{f.entry.action}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] leading-relaxed text-slate-400">
            Assessed against the{" "}
            <span className="font-semibold text-slate-600">Disability Standards for Accessible Public Transport (DSAPT) 2002</span>.
            Results are AI-generated and should be verified by a qualified accessibility auditor before remediation work is undertaken.
          </p>
        </div>

        <Link href="/m-ptv" className="block w-full rounded-2xl bg-emerald-700 py-3.5 text-center text-sm font-semibold text-white shadow-sm">
          Submit to PTV
        </Link>
        <Link href="/m-scan" className="block w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-center text-sm font-semibold text-slate-700">
          Scan another stop
        </Link>
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-10 grid grid-cols-4 border-t border-slate-200 bg-white"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV_ITEMS.map((n) => (
          <Link
            key={n.label}
            href={n.href}
            className={`py-3 text-center text-[11px] font-semibold ${n.href === "/m-report" ? "text-emerald-700" : "text-slate-400"}`}
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
