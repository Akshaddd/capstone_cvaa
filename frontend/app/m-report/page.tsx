"use client";

import { useEffect, useState } from "react";
import { BottomNav } from "../shared";

const NAV = [
  { label: "Home",    href: "/m-home"    },
  { label: "Scan",    href: "/m-scan"    },
  { label: "Map",     href: "/m-map"     },
  { label: "Reports", href: "/m-reports" },
];

type Severity = "critical" | "moderate" | "minor";

interface DsaptEntry {
  name: string;
  clause: string;
  description: string;
  passNote: string;
  failNote: string;
  action: string;
  severity: Severity;
}

const DSAPT: Record<string, DsaptEntry> = {
  tactile:    { name: "Tactile Ground Surface",  clause: "DSAPT Clause 11.2", description: "Tactile indicators must be present at boarding zones.",            passNote: "Compliant tactile indicators detected.",                       failNote: "Tactile indicators not detected or insufficient.",   action: "Install tactile indicators per AS 1428.4.1. Min 600mm depth.",            severity: "critical" },
  ramp:       { name: "Kerb Ramp",               clause: "DSAPT Clause 12.3", description: "A kerb ramp or level boarding must be provided.",                 passNote: "Kerb ramp detected. Gradient appears compliant.",              failNote: "No kerb ramp detected. Wheelchair users cannot board safely.", action: "Install compliant kerb ramp: max 1:8 gradient, 1200mm min width.",         severity: "critical" },
  wheelchair: { name: "Wheelchair Access",        clause: "DSAPT Clause 13.1", description: "Stops must provide a clear path accessible to wheelchair users.", passNote: "Wheelchair access path detected and clear.",                   failNote: "Wheelchair access compromised.",                     action: "Ensure 1800x1800mm clear waiting area and 1200mm unobstructed path.",      severity: "critical" },
  stop_sign:  { name: "Accessible Signage",       clause: "DSAPT Clause 17.2", description: "Stop information must be clearly visible.",                       passNote: "Accessible signage detected.",                                 failNote: "Signage partially obstructed or unclear.",           action: "Ensure signage uses min 70pt font and includes tactile elements.",         severity: "moderate" },
  gap:        { name: "Platform Gap Clearance",   clause: "DSAPT Clause 15.4", description: "Gap must not exceed 80mm horizontal or 50mm vertical.",           passNote: "Platform gap within DSAPT limits.",                            failNote: "Excessive platform gap — risk of entrapment.",       action: "Install platform humps or gap fillers.",                                   severity: "critical" },
  tram:       { name: "Tram Platform",            clause: "DSAPT Clause 15.1", description: "Tram stops must provide level boarding.",                         passNote: "Tram platform detected. Boarding appears compliant.",          failNote: "Platform insufficient for step-free boarding.",      action: "Upgrade to high-floor platform or install boarding ramp.",                severity: "critical" },
  bus:        { name: "Vehicle Access",           clause: "DSAPT Clause 13.3", description: "Buses must kerb-align within 230mm of the stop.",                passNote: "Vehicle alignment appears compliant.",                         failNote: "Kerb alignment may prevent accessible boarding.",    action: "Review bus bay geometry and road markings.",                               severity: "moderate" },
  person:     { name: "Path of Travel",           clause: "DSAPT Clause 12.1", description: "Pedestrians must not obstruct the accessible path.",              passNote: "Path clear at time of scan.",                                  failNote: "Obstruction detected on accessible path.",           action: "Improve layout to separate waiting passengers from boarding path.",        severity: "minor"    },
};

const FALLBACK_DETECTIONS = [
  { class: "tactile",   confidence: 0.91, bbox: [] as number[] },
  { class: "ramp",      confidence: 0.83, bbox: [] as number[] },
  { class: "stop_sign", confidence: 0.52, bbox: [] as number[] },
  { class: "gap",       confidence: 0.28, bbox: [] as number[] },
];

interface Detection { class: string; confidence: number; bbox: number[]; }
interface ScanResult {
  detections?: Detection[];
  _demo?: boolean;
  selectedStop?: { name?: string; mode?: string };
  scannedAt?: string;
}

function getEntry(cls: string): DsaptEntry {
  return DSAPT[cls] ?? {
    name: cls.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    clause: "DSAPT General",
    description: "Accessibility feature detected by AI model.",
    passNote: "Feature appears compliant.",
    failNote: "Low confidence — manual review recommended.",
    action: "Conduct a manual accessibility audit.",
    severity: "minor",
  };
}

function getStatus(confidence: number) {
  if (confidence >= 0.65) return "Pass";
  if (confidence >= 0.35) return "Warning";
  return "Failed";
}

// ── Accessibility profile ─────────────────────────────────────────────────────
// Given a set of detections, work out which user groups can use this stop

interface UserGroup {
  icon: string;
  label: string;
  suitable: boolean;
  reason: string;
}

function getAccessibilityProfile(detections: Detection[]): UserGroup[] {
  const passing = new Set(
    detections
      .filter((d) => getStatus(d.confidence) === "Pass")
      .map((d) => d.class)
  );
  const failing = new Set(
    detections
      .filter((d) => getStatus(d.confidence) === "Failed")
      .map((d) => d.class)
  );

  const hasRamp       = passing.has("ramp")       || passing.has("wheelchair");
  const hasTactile    = passing.has("tactile");
  const hasSignage    = passing.has("stop_sign");
  const hasGap        = !failing.has("gap");
  const hasPath       = !failing.has("person");

  const wheelchairOk  = hasRamp && hasGap && hasPath;
  const visualOk      = hasTactile && hasSignage;
  const mobilityOk    = hasRamp && hasPath;
  const generalOk     = hasSignage && hasPath;

  return [
    {
      icon: "♿",
      label: "Wheelchair users",
      suitable: wheelchairOk,
      reason: wheelchairOk
        ? "Ramp and accessible path detected — suitable for wheelchair access."
        : !hasRamp
        ? "No kerb ramp detected. This stop may not be safely accessible for wheelchair users."
        : !hasGap
        ? "Platform gap may prevent safe wheelchair boarding."
        : "Path of travel may be obstructed for wheelchair users.",
    },
    {
      icon: "🦯",
      label: "Vision impairment",
      suitable: visualOk,
      reason: visualOk
        ? "Tactile ground indicators and accessible signage detected."
        : !hasTactile
        ? "No tactile ground surface detected. Navigation may be difficult for people with vision impairment."
        : "Signage may not meet accessibility requirements for people with vision impairment.",
    },
    {
      icon: "🦽",
      label: "Mobility aids (walker/crutches)",
      suitable: mobilityOk,
      reason: mobilityOk
        ? "Ramp and clear path detected — suitable for mobility aid users."
        : "Ramp or clear path not detected. This stop may present challenges for people using walkers or crutches.",
    },
    {
      icon: "👤",
      label: "General public",
      suitable: generalOk,
      reason: generalOk
        ? "Stop appears generally usable with visible signage and clear access."
        : "Some access issues detected that may affect all passengers.",
    },
  ];
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AccessibilityProfile({ detections }: { detections: Detection[] }) {
  const groups = getAccessibilityProfile(detections);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
        Who can use this stop
      </p>
      <div className="flex flex-col gap-2">
        {groups.map((g) => (
          <div
            key={g.label}
            className={`flex gap-3 rounded-xl p-3 ${
              g.suitable
                ? "bg-emerald-50 dark:bg-emerald-950"
                : "bg-red-50 dark:bg-red-950"
            }`}
          >
            <span className="text-xl flex-shrink-0">{g.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{g.label}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  g.suitable
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                }`}>
                  {g.suitable ? "Suitable" : "Not suitable"}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{g.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pass:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    Warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    Failed:  "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${styles[status] ?? styles.Failed}`}>
      {status}
    </span>
  );
}

function SeverityChip({ severity }: { severity: Severity }) {
  const styles: Record<Severity, string> = {
    critical: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    moderate: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    minor:    "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  };
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${styles[severity]}`}>
      {severity}
    </span>
  );
}

function FindingRow({ detection }: { detection: Detection }) {
  const [open, setOpen] = useState(false);
  const entry  = getEntry(detection.class);
  const status = getStatus(detection.confidence);
  const pct    = Math.round(detection.confidence * 100);

  const rowBg: Record<string, string> = {
    Pass:    "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950",
    Warning: "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950",
    Failed:  "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950",
  };
  const barColor: Record<string, string> = {
    Pass: "bg-emerald-500", Warning: "bg-yellow-500", Failed: "bg-red-500",
  };

  return (
    <div className={`rounded-2xl border overflow-hidden ${rowBg[status]}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-3 p-3.5 text-left bg-transparent"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{entry.name}</span>
            <SeverityChip severity={entry.severity} />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">{entry.clause}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusChip status={status} />
          <span className="text-[10px] text-slate-400 dark:text-slate-500">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-black/5 dark:border-white/5 px-3.5 pb-4 pt-3 flex flex-col gap-3">
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1">
              <span>Detection confidence</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full">
              <div
                className={`h-1.5 rounded-full ${barColor[status]}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Standard</p>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{entry.description}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Finding</p>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {status === "Pass" ? entry.passNote : entry.failNote}
            </p>
          </div>
          {status !== "Pass" && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Recommended action
              </p>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{entry.action}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const [scan,    setScan]    = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("scanResult");
      if (raw) setScan(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="w-7 h-7 border-[3px] border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400 dark:text-slate-500">Loading report...</p>
        </div>
      </div>
    );
  }

  const rawDetections = scan?.detections?.length ? scan.detections : FALLBACK_DETECTIONS;

  // Deduplicate — keep highest confidence per class
  const deduped = Object.values(
    rawDetections.reduce<Record<string, Detection>>((acc, d) => {
      if (!acc[d.class] || d.confidence > acc[d.class].confidence) acc[d.class] = d;
      return acc;
    }, {})
  ).sort((a, b) => {
    const so: Record<string, number> = { Failed: 0, Warning: 1, Pass: 2 };
    const sv: Record<string, number> = { critical: 0, moderate: 1, minor: 2 };
    const sa = getStatus(a.confidence), sb = getStatus(b.confidence);
    return (so[sa] - so[sb]) || (sv[getEntry(a.class).severity] - sv[getEntry(b.class).severity]);
  });

  const passed   = deduped.filter((d) => getStatus(d.confidence) === "Pass").length;
  const warnings = deduped.filter((d) => getStatus(d.confidence) === "Warning").length;
  const failed   = deduped.filter((d) => getStatus(d.confidence) === "Failed").length;
  const score    = Math.round((passed / Math.max(deduped.length, 1)) * 100);
  const isDemo   = !scan?.detections?.length || !!scan?._demo;

  const stopName = scan?.selectedStop?.name ?? "Selected Stop";
  const stopMode = scan?.selectedStop?.mode ?? "transport";
  const reportId = `RPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  const overallLabel = failed > 0 ? "Non-compliant" : warnings > 0 ? "Partial" : "Compliant";
  const overallStyle = failed > 0
    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
    : warnings > 0
    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";

  const summary = failed > 0
    ? `This stop does not fully meet DSAPT 2002 requirements. ${failed} issue${failed > 1 ? "s" : ""} detected that may limit access for some passengers.`
    : warnings > 0
    ? `No critical failures detected. ${warnings} item${warnings > 1 ? "s" : ""} require review to achieve full DSAPT compliance.`
    : "All detected features meet DSAPT 2002 requirements. This stop appears fully accessible.";

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">

      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-5 py-4">
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">{reportId}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize mt-0.5">
            {stopName} · {stopMode} stop
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDemo && (
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-0.5">
              Demo
            </span>
          )}
          <a
            href="/m-home"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
          >
            ← Back
          </a>
        </div>
      </header>

      <main className="flex flex-col gap-3 p-4 pb-24">

        {/* Score card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full border-[3px] border-emerald-700 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{score}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{stopName}</p>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${overallStyle}`}>
                  {overallLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 capitalize mt-0.5">
                {stopMode} stop · {isDemo ? "Demo data" : "Live scan"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center bg-emerald-50 dark:bg-emerald-950 rounded-xl py-2.5">
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{passed}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Passed</p>
            </div>
            <div className="text-center bg-yellow-50 dark:bg-yellow-950 rounded-xl py-2.5">
              <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{warnings}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Warnings</p>
            </div>
            <div className="text-center bg-red-50 dark:bg-red-950 rounded-xl py-2.5">
              <p className="text-lg font-bold text-red-600 dark:text-red-400">{failed}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Failed</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
            Summary
          </p>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{summary}</p>
        </div>

        {/* Accessibility profile — who can use this stop */}
        <AccessibilityProfile detections={deduped} />

        {/* DSAPT Findings */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
            DSAPT Findings — tap to expand
          </p>
          <div className="flex flex-col gap-2">
            {deduped.map((d) => (
              <FindingRow key={d.class} detection={d} />
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-500">
            Assessed against the{" "}
            <strong className="text-slate-600 dark:text-slate-300">
              Disability Standards for Accessible Public Transport (DSAPT) 2002
            </strong>
            . AI-generated — verify with a qualified auditor before remediation.
          </p>
        </div>

        <a
          href="/m-ptv"
          className="block w-full bg-emerald-700 text-white font-bold text-sm text-center py-4 rounded-2xl"
        >
          Submit to PTV
        </a>
        <a
          href="/m-scan"
          className="block w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm text-center py-4 rounded-2xl"
        >
          Scan another stop
        </a>

      </main>

      <BottomNav items={NAV} active="/m-report" />
    </div>
  );
}