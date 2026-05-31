"use client";

import { useEffect, useState } from "react";
import { Sidebar, PageHeader, USER_NAV } from "../shared-desktop";

type Severity = "critical" | "moderate" | "minor";

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
    name: "Kerb Ramp", clause: "DSAPT 12.3",
    description: "A kerb ramp or level boarding must be provided.",
    passNote: "Kerb ramp detected. Gradient appears compliant.",
    failNote: "No kerb ramp detected. Wheelchair users cannot board safely.",
    action: "Install compliant kerb ramp: max 1:8 gradient, 1200mm min width.",
    plainEnglish: "The sloped ramp that lets people in wheelchairs, with prams, or using mobility aids get on and off without having to step up a kerb.",
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
    passNote: "Accessible signage detected.",
    failNote: "Signage partially obstructed or unclear.",
    action: "Ensure signage uses min 70pt font and includes tactile elements.",
    plainEnglish: "Clear signs showing the stop number and routes, large enough to read from a distance and usable by people with low vision.",
    severity: "moderate",
  },
  gap: {
    name: "Platform Gap Clearance", clause: "DSAPT 15.4",
    description: "Gap must not exceed 80mm horizontal or 50mm vertical.",
    passNote: "Platform gap within DSAPT limits.",
    failNote: "Excessive platform gap — risk of entrapment.",
    action: "Install platform humps or gap fillers.",
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
    description: "Buses must kerb-align within 230mm of the stop.",
    passNote: "Vehicle alignment appears compliant.",
    failNote: "Kerb alignment may prevent accessible boarding.",
    action: "Review bus bay geometry and road markings.",
    plainEnglish: "How close the bus can pull up to the kerb. If the bus is too far away, the gap makes it hard or impossible for wheelchair users to board.",
    severity: "moderate",
  },
  person: {
    name: "Path of Travel", clause: "DSAPT 12.1",
    description: "Pedestrians must not obstruct the accessible path.",
    passNote: "Path clear at time of scan.",
    failNote: "Obstruction detected on accessible path.",
    action: "Improve stop layout to separate waiting passengers from boarding path.",
    plainEnglish: "A clear, unobstructed walkway from the footpath to the boarding zone so people with mobility aids can reach the stop without going around obstacles.",
    severity: "minor",
  },
};

const FALLBACK = [
  { class: "tactile",   confidence: 0.91, bbox: [] as number[] },
  { class: "ramp",      confidence: 0.83, bbox: [] as number[] },
  { class: "stop_sign", confidence: 0.52, bbox: [] as number[] },
  { class: "gap",       confidence: 0.28, bbox: [] as number[] },
];

interface Detection { class: string; confidence: number; bbox: number[]; }
interface ScanResult {
  detections?: Detection[]; _demo?: boolean;
  selectedStop?: { name?: string; mode?: string };
  scannedAt?: string;
}

function getEntry(cls: string): DsaptEntry {
  return DSAPT[cls] ?? {
    name: cls.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    clause: "DSAPT General", description: "Feature detected.",
    passNote: "Appears compliant.", failNote: "Manual review recommended.",
    action: "Conduct manual audit.",
    plainEnglish: "An accessibility feature detected at this stop.",
    severity: "minor",
  };
}

function getStatus(c: number) { return c >= 0.65 ? "Pass" : c >= 0.35 ? "Warning" : "Failed"; }

function statusChip(s: string) {
  if (s === "Pass")    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
  if (s === "Warning") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
  return                      "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
}

function sevChip(s: Severity) {
  if (s === "critical") return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
  if (s === "moderate") return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
  return                       "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
}

function rowBg(s: string) {
  if (s === "Pass")    return "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950";
  if (s === "Warning") return "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950";
  return                      "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950";
}

function getProfile(dets: Detection[]) {
  const passing = new Set(dets.filter((d) => getStatus(d.confidence) === "Pass").map((d) => d.class));
  const failing  = new Set(dets.filter((d) => getStatus(d.confidence) === "Failed").map((d) => d.class));
  const hasRamp    = passing.has("ramp") || passing.has("wheelchair");
  const hasTactile = passing.has("tactile");
  const hasSignage = passing.has("stop_sign");
  const hasGap     = !failing.has("gap");
  const hasPath    = !failing.has("person");
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
  const status = getStatus(detection.confidence);
  const pct    = Math.round(detection.confidence * 100);

  return (
    <div className={`rounded-xl border overflow-hidden ${rowBg(status)}`}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left bg-transparent">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{entry.name}</span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${sevChip(entry.severity)}`}>{entry.severity}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 hidden xl:block">{entry.clause}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-24 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div className={`h-1.5 rounded-full ${status === "Pass" ? "bg-emerald-500" : status === "Warning" ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
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
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">DSAPT standard</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{entry.description}</p>
            </div>
          </div>

          {status !== "Pass" && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Recommended action</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{entry.action}</p>
            </div>
          )}

          <div>
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1">
              <span>Detection confidence</span><span>{pct}%</span>
            </div>
            <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full">
              <div className={`h-1.5 rounded-full ${status === "Pass" ? "bg-emerald-500" : status === "Warning" ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
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
    try { const r = sessionStorage.getItem("scanResult"); if (r) setScan(JSON.parse(r)); } catch {}
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
      if (!acc[d.class] || d.confidence > acc[d.class].confidence) acc[d.class] = d;
      return acc;
    }, {})
  ).sort((a, b) => {
    const so: Record<string, number> = { Failed: 0, Warning: 1, Pass: 2 };
    const sv: Record<string, number> = { critical: 0, moderate: 1, minor: 2 };
    return (so[getStatus(a.confidence)] - so[getStatus(b.confidence)]) ||
           (sv[getEntry(a.class).severity] - sv[getEntry(b.class).severity]);
  });

  const passed   = deduped.filter((d) => getStatus(d.confidence) === "Pass").length;
  const warnings = deduped.filter((d) => getStatus(d.confidence) === "Warning").length;
  const failed   = deduped.filter((d) => getStatus(d.confidence) === "Failed").length;
  const score    = Math.round((passed / Math.max(deduped.length, 1)) * 100);
  const isDemo   = !scan?.detections?.length || !!scan._demo;
  const stopName = scan?.selectedStop?.name ?? "Selected Stop";
  const stopMode = scan?.selectedStop?.mode ?? "transport";
  const profile  = getProfile(deduped);
  const reportId = `RPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  const overallLabel = failed > 0 ? "Non-compliant" : warnings > 0 ? "Partial" : "Compliant";
  const overallStyle = failed > 0
    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
    : warnings > 0
    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";

  const plainSummary = failed > 0
    ? `This stop has ${failed} accessibility issue${failed > 1 ? "s" : ""} that could prevent some passengers from boarding safely${warnings > 0 ? `, and ${warnings} item${warnings > 1 ? "s" : ""} that need attention` : ""}.`
    : warnings > 0
    ? `This stop has no critical failures but ${warnings} item${warnings > 1 ? "s" : ""} need review before it fully meets accessibility requirements.`
    : "This stop meets all checked accessibility requirements and appears safe and usable for all passengers.";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar nav={USER_NAV} active="/d-reports" user={{ initials: "JD", name: "J. Doe", role: "Public user" }} />

      <div className="flex flex-1 flex-col min-w-0">
        <PageHeader
          title={stopName}
          subtitle={`${stopMode} stop · ${reportId}${isDemo ? " · Demo data" : ""}`}
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
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize mb-3">{stopMode} stop · {isDemo ? "Demo data" : "Live scan"}</p>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">In plain English</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{plainSummary}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center bg-emerald-50 dark:bg-emerald-950 rounded-xl py-3">
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{passed}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Passed</p>
                </div>
                <div className="text-center bg-yellow-50 dark:bg-yellow-950 rounded-xl py-3">
                  <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{warnings}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Warnings</p>
                </div>
                <div className="text-center bg-red-50 dark:bg-red-950 rounded-xl py-3">
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">{failed}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Failed</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                DSAPT Findings — click any row to expand with plain English explanation
              </p>
              <div className="flex flex-col gap-2">
                {deduped.map((d) => <FindingRow key={d.class} detection={d} />)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                Assessed against the <strong className="text-slate-600 dark:text-slate-300">Disability Standards for Accessible Public Transport (DSAPT) 2002</strong>. AI-generated — verify with a qualified auditor before remediation.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Who can use this stop</p>
            <div className="flex flex-col gap-2">
              {profile.map((g) => (
                <div key={g.label} className={`rounded-xl p-3 ${g.suitable ? "bg-emerald-50 dark:bg-emerald-950" : "bg-red-50 dark:bg-red-950"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{g.label}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${g.suitable ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"}`}>
                      {g.suitable ? "Suitable" : "Not suitable"}
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
