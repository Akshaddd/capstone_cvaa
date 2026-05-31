"use client";

import { useEffect, useState } from "react";
import { Sidebar, PageHeader, USER_NAV } from "../shared-desktop";

type Severity = "critical" | "moderate" | "minor";

function severityLabel(s: Severity) {
  if (s === "critical") return "High priority";
  if (s === "moderate") return "Medium priority";
  return "Low priority";
}

interface DsaptEntry {
  name: string; clause: string; description: string;
  passNote: string; failNote: string; action: string; severity: Severity;
  plainEnglish: string;
}

const DSAPT: Record<string, DsaptEntry> = {
  tactile: {
    name: "Tactile Ground Surface", clause: "DSAPT 11.2",
    description: "Tactile indicators must be present at boarding zones.",
    passNote: "Compliant tactile indicators detected at the boarding zone.",
    failNote: "Tactile indicators not detected or insufficient.",
    action: "Install tactile indicators per AS 1428.4.1. Min 600mm depth.",
    plainEnglish: "The bumpy yellow strips on the ground that help people who are blind or have low vision know where to stand and board safely.",
    severity: "critical",
  },
  ramp: {
    name: "Ramp or Level Access", clause: "DSAPT 12.3",
    description: "A kerb ramp, vehicle ramp, lift, or level path should be provided where a level change exists.",
    passNote: "Ramp or level-access indicator detected. Confirm gradient and usable width during manual review.",
    failNote: "Ramp or level access could not be confirmed from the uploaded evidence.",
    action: "Verify the full approach path, ramp deployment, gradient, landing area, and any level changes during manual inspection.",
    plainEnglish: "A step-free route or deployed vehicle ramp that lets wheelchair users, people with prams, or passengers using mobility aids reach the boarding area without having to step up or down.",
    severity: "critical",
  },
  wheelchair: {
    name: "Wheelchair Access", clause: "DSAPT 13.1",
    description: "Stops must provide a clear path accessible to wheelchair users.",
    passNote: "Wheelchair access path detected and clear.",
    failNote: "Wheelchair access compromised.",
    action: "Ensure 1800x1800mm clear waiting area and 1200mm unobstructed path.",
    plainEnglish: "Enough clear space at the stop for a wheelchair to move around freely and get close enough to board the vehicle.",
    severity: "critical",
  },
  stop_sign: {
    name: "Accessible Signage", clause: "DSAPT 17.2",
    description: "Stop information must be clearly visible.",
    passNote: "Passenger information signage appears visible in the uploaded evidence.",
    failNote: "Passenger information signage could not be confirmed clearly from the uploaded evidence.",
    action: "Capture a closer image of the stop ID, route boards, and passenger information signage for manual review.",
    plainEnglish: "Clear signs showing the stop number and routes, large enough to read from a distance and usable by people with low vision.",
    severity: "moderate",
  },
  gap: {
    name: "Platform Gap Clearance", clause: "DSAPT 15.4",
    description: "Gap must not exceed 80mm horizontal or 50mm vertical.",
    passNote: "Boarding gap appears within review threshold in the uploaded evidence.",
    failNote: "Boarding gap could not be confirmed from the uploaded evidence.",
    action: "Capture a closer boarding interface image with the vehicle present, then verify horizontal and vertical gap measurements manually.",
    plainEnglish: "The space between the vehicle door and the platform edge. If it is too wide or too high, wheelchairs, canes, and small wheels can get caught.",
    severity: "critical",
  },
  tram: {
    name: "Tram Platform", clause: "DSAPT 15.1",
    description: "Tram stops must provide level boarding.",
    passNote: "Tram platform detected. Boarding appears compliant.",
    failNote: "Platform insufficient for step-free boarding.",
    action: "Upgrade to high-floor platform or install boarding ramp.",
    plainEnglish: "A raised platform that lines up with the tram floor so passengers do not have to step up or down to get on.",
    severity: "critical",
  },
  bus: {
    name: "Vehicle Access", clause: "DSAPT 13.3",
    description: "Vehicle boarding access should support safe boarding from the stop, including kerb alignment or deployed ramp access where required.",
    passNote: "Vehicle access indicator detected. Confirm ramp deployment, alignment, and safe boarding conditions during review.",
    failNote: "Vehicle access could not be confirmed from the uploaded evidence.",
    action: "Review bus bay geometry, ramp deployment, kerb alignment, and boarding gap measurements.",
    plainEnglish: "Whether the vehicle can provide safe access at the boarding point. This may include close kerb alignment, a deployed ramp, or another step-free boarding method.",
    severity: "moderate",
  },
  person: {
    name: "Path of Travel", clause: "DSAPT 12.1",
    description: "An accessible path of travel should be clear, continuous, and free from obstructions.",
    passNote: "Clear path of travel appears visible in the uploaded evidence.",
    failNote: "Clear path of travel could not be confirmed from the uploaded evidence.",
    action: "Capture additional evidence of the approach path and confirm minimum clear width during manual review.",
    plainEnglish: "A clear, unobstructed walkway from the footpath or concourse to the boarding zone so people with mobility aids can reach the stop without going around barriers.",
    severity: "minor",
  },
};

const FALLBACK = [
  { class: "tactile",   confidence: 0.88, bbox: [] as number[] },
  { class: "person",    confidence: 0.72, bbox: [] as number[] },
  { class: "stop_sign", confidence: 0.48, bbox: [] as number[] },
  { class: "gap",       confidence: 0.42, bbox: [] as number[] },
];

interface Detection { class: string; confidence: number; bbox: number[]; }
interface ScanResult {
  detections?: Detection[]; _demo?: boolean;
  selectedStop?: { id?: string; name?: string; mode?: string; status?: string };
  scannedAt?: string;
}

function normalizeClassName(cls: string) {
  const key = cls.toLowerCase().trim().replace(/[\s-]+/g, "_");
  const aliases: Record<string, string> = {
    tactile_paving: "tactile",
    tactile_ground_surface: "tactile",
    tgsi: "tactile",
    tactile_indicators: "tactile",
    kerb_ramp: "ramp",
    curb_ramp: "ramp",
    level_access: "ramp",
    level_boarding: "ramp",
    ramp_or_level_access: "ramp",
    accessible_signage: "stop_sign",
    signage: "stop_sign",
    stop_signage: "stop_sign",
    route_board: "stop_sign",
    passenger_information: "stop_sign",
    platform_gap: "gap",
    boarding_gap: "gap",
    vehicle_platform_gap: "gap",
    clear_path: "person",
    clear_path_of_travel: "person",
    path: "person",
    path_of_travel: "person",
    wheelchair_access: "wheelchair",
    wheelchair_space: "wheelchair",
    vehicle_access: "bus",
    bus_access: "bus",
    bus_door: "bus",
    vehicle_ramp: "ramp",
    deployed_ramp: "ramp",
    wheelchair_ramp: "ramp",
    access_ramp: "ramp",
  };
  return aliases[key] ?? key;
}

function getEntry(cls: string): DsaptEntry {
  const normalized = normalizeClassName(cls);
  return DSAPT[normalized] ?? {
    name: cls.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    clause: "DSAPT General", description: "Feature detected.",
    passNote: "Appears compliant.", failNote: "Manual review recommended.",
    action: "Conduct manual audit.",
    plainEnglish: "An accessibility feature detected at this stop.",
    severity: "minor",
  };
}

function getStatus(c: number, cls?: string) {
  const normalized = cls ? normalizeClassName(cls) : "";

  // Ramps and level-access indicators are often partially visible in a single boarding image.
  // Treat a moderate-confidence ramp detection as detected, but keep the confidence visible for auditor review.
  if ((normalized === "ramp" || normalized === "wheelchair") && c >= 0.35) return "Detected";

  return c >= 0.65 ? "Detected" : c >= 0.35 ? "Review" : "Not detected";
}

function statusChip(s: string) {
  if (s === "Detected") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
  if (s === "Review")   return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
  return                      "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
}

function sevChip(s: Severity, status?: string) {
  if (status === "Detected") return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300";
  if (s === "critical") return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
  if (s === "moderate") return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
  return                       "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
}

function rowBg(s: string) {
  if (s === "Detected") return "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950";
  if (s === "Review")   return "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950";
  return                      "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950";
}

function getProfile(dets: Detection[]) {
  const passing = new Set(dets.filter((d) => getStatus(d.confidence, d.class) === "Detected").map((d) => normalizeClassName(d.class)));
  const review  = new Set(dets.filter((d) => getStatus(d.confidence, d.class) === "Review").map((d) => normalizeClassName(d.class)));
  const failing = new Set(dets.filter((d) => getStatus(d.confidence, d.class) === "Not detected").map((d) => normalizeClassName(d.class)));
  const hasRampDetected = passing.has("ramp") || passing.has("wheelchair");
  const hasRampReview   = review.has("ramp") || review.has("wheelchair");
  const hasVehicleAccess = passing.has("bus") || review.has("bus");
  const hasStepFreeAccess = hasRampDetected || hasRampReview || hasVehicleAccess;
  const hasTactile = passing.has("tactile");
  const hasSignage = passing.has("stop_sign");
  const hasGap     = passing.has("gap") || review.has("gap") || !failing.has("gap");
  const hasPath    = passing.has("person") || review.has("person") || !failing.has("person");
  return [
    { label: "Wheelchair users",   suitable: hasRamp && hasGap && hasPath,  reason: hasRamp && hasGap && hasPath ? "Ramp and accessible path detected." : !hasRamp ? "No kerb ramp detected — wheelchair users may not be able to board safely." : "Path or gap issues may affect wheelchair access." },
    { label: "Vision impairment",  suitable: hasTactile && hasSignage,       reason: hasTactile && hasSignage ? "Tactile ground indicators and accessible signage detected." : !hasTactile ? "No tactile ground surface detected — navigation may be difficult for people with low vision." : "Signage may not meet requirements." },
    { label: "Mobility aids",      suitable: hasRamp && hasPath,             reason: hasRamp && hasPath ? "Ramp and clear path detected." : "Ramp or clear path not detected — may present challenges for people using walkers or crutches." },
    { label: "General public",     suitable: hasSignage && hasPath,          reason: hasSignage && hasPath ? "Stop appears generally usable." : "Some access issues detected that may affect all passengers." },
  ];
}

function FindingRow({ detection }: { detection: Detection }) {
  const [open, setOpen] = useState(false);
  const entry  = getEntry(detection.class);
  const status = getStatus(detection.confidence, detection.class);
  const pct    = Math.round(detection.confidence * 100);

  return (
    <div className={`rounded-xl border overflow-hidden ${rowBg(status)}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left bg-transparent">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{entry.name}</span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${sevChip(entry.severity, status)}`}>{severityLabel(entry.severity)}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 hidden xl:block">{entry.clause}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-24 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div className={`h-1.5 rounded-full ${status === "Detected" ? "bg-emerald-500" : status === "Review" ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 w-8 text-right">{pct}%</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusChip(status)}`}>{status}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-black/5 dark:border-white/5 px-4 py-4 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">What this means</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{entry.plainEnglish}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Finding</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {status === "Pass" ? entry.passNote : entry.failNote}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Relevant DSAPT indicator</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{entry.description}</p>
            </div>
          </div>

          {status !== "Pass" && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Recommended review action</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{entry.action}</p>
            </div>
          )}
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1">
              <span>Detection confidence</span><span>{pct}%</span>
            </div>
            <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full">
              <div className={`h-1.5 rounded-full ${status === "Detected" ? "bg-emerald-500" : status === "Review" ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DesktopReportPage() {
  const [scan,    setScan]    = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const r = sessionStorage.getItem("scanResult");
      if (r) {
        const parsed = JSON.parse(r) as ScanResult;
        setScan(parsed);
        saveStopStatusFromReport(parsed);
      }
    } catch {}
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-900">
      <div className="w-7 h-7 border-[3px] border-emerald-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const raws = scan?.detections?.length ? scan.detections : FALLBACK;

  const deduped = Object.values(
    raws.reduce<Record<string, Detection>>((acc, d) => {
      const normalized = normalizeClassName(d.class);
      if (!DSAPT[normalized]) return acc;
      const normalizedDetection = { ...d, class: normalized };
      if (!acc[normalized] || d.confidence > acc[normalized].confidence) acc[normalized] = normalizedDetection;
      return acc;
    }, {})
  ).sort((a, b) => {
    const so: Record<string, number> = { "Not detected": 0, Review: 1, Detected: 2 };
    const sv: Record<string, number> = { critical: 0, moderate: 1, minor: 2 };
    return (so[getStatus(a.confidence, a.class)] - so[getStatus(b.confidence, b.class)]) ||
           (sv[getEntry(a.class).severity] - sv[getEntry(b.class).severity]);
  });

  const passed   = deduped.filter((d) => getStatus(d.confidence, d.class) === "Detected").length;
  const warnings = deduped.filter((d) => getStatus(d.confidence, d.class) === "Review").length;
  const failed   = deduped.filter((d) => getStatus(d.confidence, d.class) === "Not detected").length;
  const score    = Math.round((passed / Math.max(deduped.length, 1)) * 100);
  const isReviewDataset = !scan?.detections?.length || !!scan._demo;
  const stopName = scan?.selectedStop?.name ?? "Selected Stop";
  const stopMode = scan?.selectedStop?.mode ?? "transport";
  const profile  = getProfile(deduped);
  const reportId = `RPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const assessmentMode = isReviewDataset ? "Evidence review" : "Live scan";

  const overallLabel = failed > 0 ? "Review required" : warnings > 0 ? "Action recommended" : "No issues flagged";
  const overallStyle = failed > 0
    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
    : warnings > 0
    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";

  const plainSummary = isReviewDataset
    ? `This evidence set shows ${passed} accessibility indicator${passed !== 1 ? "s" : ""} and ${warnings} item${warnings !== 1 ? "s" : ""} requiring closer operator review. No final compliance decision should be made from this output alone.`
    : failed > 0
    ? `This assessment flagged ${failed} high-priority accessibility issue${failed > 1 ? "s" : ""} that may affect safe boarding${warnings > 0 ? `, plus ${warnings} item${warnings > 1 ? "s" : ""} requiring review` : ""}.`
    : warnings > 0
    ? `This assessment found no high-priority failures, but ${warnings} item${warnings > 1 ? "s" : ""} should be reviewed before the stop is marked as fully accessible.`
    : "No issues were flagged across the checked visual indicators. Operator verification is still recommended before confirming compliance.";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar nav={USER_NAV} active="/d-reports" user={{ initials: "JD", name: "J. Doe", role: "Public user" }} />

      <div className="flex flex-1 flex-col min-w-0">
        <PageHeader
          title={stopName === "Selected Stop" ? "Accessibility assessment report" : stopName}
          subtitle={`${stopMode} stop · ${reportId} · ${assessmentMode}`}
          actions={
            <div className="flex gap-2">
              {isDemo && <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2.5 py-1">Demo</span>}
              <a href="/d-ptv" className="text-sm font-semibold bg-emerald-700 text-white px-4 py-2 rounded-xl hover:bg-emerald-800">Submit to PTV</a>
              <a href="/d-scan" className="text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">Scan another</a>
            </div>
          }
        />

        <main className="flex-1 p-6 grid grid-cols-3 gap-6 items-start">

          <div className="col-span-2 flex flex-col gap-5">

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{score}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{stopName}</p>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${overallStyle}`}>{overallLabel}</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize mb-3">{stopMode} stop · {assessmentMode}</p>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Assessment summary</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{plainSummary}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center bg-emerald-50 dark:bg-emerald-950 rounded-xl py-3">
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{passed}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Detected</p>
                </div>
                <div className="text-center bg-yellow-50 dark:bg-yellow-950 rounded-xl py-3">
                  <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{warnings}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Needs review</p>
                </div>
                <div className="text-center bg-red-50 dark:bg-red-950 rounded-xl py-3">
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">{failed}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Not detected</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                DSAPT-linked observations — expand a row for evidence, risk and recommended review action
              </p>
              <div className="flex flex-col gap-2">
                {deduped.map((d) => <FindingRow key={d.class} detection={d} />)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                Observations are mapped against selected <strong className="text-slate-600 dark:text-slate-300">Disability Standards for Accessible Public Transport (DSAPT) 2002</strong> indicators. Priority labels show review importance, not a final compliance verdict. Verify with a qualified auditor before remediation.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Passenger impact estimate</p>
            <div className="flex flex-col gap-2">
              {profile.map((g) => (
                <div key={g.label} className={`rounded-xl p-3 ${g.suitable ? "bg-emerald-50 dark:bg-emerald-950" : "bg-red-50 dark:bg-red-950"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{g.label}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${g.suitable ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"}`}>
                      {g.suitable ? "Likely supported" : "Review needed"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{g.reason}</p>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}