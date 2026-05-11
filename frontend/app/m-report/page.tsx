"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const NAV = [
  { label: "Home", route: "/m-home" },
  { label: "Scan", route: "/m-scan" },
  { label: "Map", route: "/m-map" },
  { label: "Reports", route: "/m-report" },
];

const DSAPT_MAP: Record<string, {
  name: string; clause: string; description: string;
  passNote: string; failNote: string; action: string;
  severity: "critical" | "moderate" | "minor";
}> = {
  tactile: {
    name: "Tactile Ground Surface", clause: "DSAPT Clause 11.2",
    description: "Tactile indicators must be present at boarding zones to assist passengers with vision impairment.",
    passNote: "Compliant tactile indicators detected at boarding zone.",
    failNote: "Tactile ground surface indicators not detected or insufficient coverage at boarding zone.",
    action: "Install or replace tactile ground surface indicators per AS 1428.4.1. Minimum 600mm depth from kerb edge.",
    severity: "critical",
  },
  ramp: {
    name: "Kerb Ramp", clause: "DSAPT Clause 12.3",
    description: "A kerb ramp or level boarding must be provided for wheelchair and mobility aid access.",
    passNote: "Kerb ramp detected. Gradient appears compliant.",
    failNote: "No kerb ramp detected. Wheelchair and mobility aid users cannot board safely.",
    action: "Install a compliant kerb ramp with max 1:8 gradient, 1200mm minimum width, and tactile hazard indicators at the top.",
    severity: "critical",
  },
  wheelchair: {
    name: "Wheelchair Access", clause: "DSAPT Clause 13.1",
    description: "Stops must provide a clear path and boarding zone accessible to wheelchair users.",
    passNote: "Wheelchair access path detected and appears clear.",
    failNote: "Wheelchair access compromised. Obstructions or insufficient clearance detected.",
    action: "Ensure 1800mm × 1800mm clear waiting area and unobstructed 1200mm path of travel to the boarding point.",
    severity: "critical",
  },
  stop_sign: {
    name: "Accessible Signage", clause: "DSAPT Clause 17.2",
    description: "Stop information must be clearly visible and include route numbers and destination details.",
    passNote: "Accessible signage detected. Route information visible.",
    failNote: "Signage partially obstructed or unclear. Passengers with low vision may not identify the stop.",
    action: "Ensure signage is unobstructed, uses minimum 70pt font, and includes Braille or tactile elements where required.",
    severity: "moderate",
  },
  path: {
    name: "Path of Travel", clause: "DSAPT Clause 12.1",
    description: "A continuous accessible path must connect the footpath to the boarding zone.",
    passNote: "Clear path of travel detected from footpath to boarding zone.",
    failNote: "Path of travel obstructed or discontinuous. Accessibility compromised.",
    action: "Clear obstructions and ensure a minimum 1200mm continuous path with compliant surface and gradient (max 1:20).",
    severity: "moderate",
  },
  gap: {
    name: "Platform Gap Clearance", clause: "DSAPT Clause 15.4",
    description: "The gap between vehicle and platform must not exceed 80mm horizontal or 50mm vertical.",
    passNote: "Platform gap appears within acceptable DSAPT limits.",
    failNote: "Excessive platform gap detected. Risk of mobility aid entrapment.",
    action: "Install platform humps, gap fillers, or deploy portable boarding ramps to reduce gap to within 80mm horizontal, 50mm vertical.",
    severity: "critical",
  },
  person: {
    name: "Path of Travel — Obstruction", clause: "DSAPT Clause 12.1",
    description: "Pedestrian traffic must not obstruct the accessible path of travel to the boarding zone.",
    passNote: "Path of travel clear at time of scan.",
    failNote: "Obstruction detected on accessible path. Mobility aid users may be unable to reach the boarding zone.",
    action: "Improve stop layout to separate waiting passengers from the accessible boarding path. Consider physical guidance lines.",
    severity: "minor",
  },
  bus: {
    name: "Vehicle Access", clause: "DSAPT Clause 13.3",
    description: "Buses must be able to kerb-align within 230mm of the stop to enable step-free boarding.",
    passNote: "Vehicle alignment appears compliant for accessible boarding.",
    failNote: "Kerb alignment may prevent accessible boarding.",
    action: "Ensure bus bay design allows kerb alignment. Review road markings and bay geometry.",
    severity: "moderate",
  },
  tram: {
    name: "Tram Platform", clause: "DSAPT Clause 15.1",
    description: "Tram stops must provide a raised platform or level boarding to eliminate the step gap.",
    passNote: "Tram stop platform detected. Boarding appears compliant.",
    failNote: "Tram platform may be insufficient for step-free boarding.",
    action: "Upgrade to a high-floor platform or install boarding ramp system aligned to tram floor height.",
    severity: "critical",
  },
};

function getEntry(cls: string) {
  return DSAPT_MAP[cls] ?? {
    name: cls.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    clause: "DSAPT General",
    description: "Accessibility feature detected by AI model.",
    passNote: "Feature detected and appears compliant.",
    failNote: "Feature detected with low confidence — manual review recommended.",
    action: "Conduct a manual accessibility audit to assess compliance.",
    severity: "minor" as const,
  };
}

function getStatus(c: number) { return c >= 0.65 ? "Pass" : c >= 0.35 ? "Warning" : "Failed"; }

const chipStyle = (s: string) =>
  s === "Pass" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
  s === "Warning" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
  "bg-red-100 text-red-700 border-red-200";

const rowStyle = (s: string) =>
  s === "Pass" ? "border-emerald-200 bg-emerald-50" :
  s === "Warning" ? "border-yellow-200 bg-yellow-50" :
  "border-red-200 bg-red-50";

const severityBadge = (s: string) =>
  s === "critical" ? "bg-red-100 text-red-700 border-red-200" :
  s === "moderate" ? "bg-orange-100 text-orange-700 border-orange-200" :
  "bg-slate-100 text-slate-500 border-slate-200";

const statusOrder: Record<string, number> = { Failed: 0, Warning: 1, Pass: 2 };
const severityOrder: Record<string, number> = { critical: 0, moderate: 1, minor: 2 };

interface RawDetection { class: string; confidence: number; bbox: number[]; source_model?: string; }
interface BackendResponse { status: string; filename?: string; detections?: RawDetection[]; }

export default function MobileReportPage() {
  const router = useRouter();
  const [data, setData] = useState<BackendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    try { const raw = sessionStorage.getItem("scanResult"); if (raw) setData(JSON.parse(raw)); } catch {}
    setLoading(false);
  }, []);

  if (loading) return (
    <main className="mx-auto flex min-h-screen max-w-sm items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-[3px] border-emerald-700 border-t-transparent" />
        <p className="text-sm text-slate-500">Loading report…</p>
      </div>
    </main>
  );

  const rawDetections: RawDetection[] = data?.detections?.length ? data.detections : [
    { class: "tactile", confidence: 0.91, bbox: [] },
    { class: "ramp", confidence: 0.83, bbox: [] },
    { class: "stop_sign", confidence: 0.52, bbox: [] },
    { class: "gap", confidence: 0.28, bbox: [] },
  ];

  const dedupedMap: Record<string, RawDetection> = {};
  for (const d of rawDetections) {
    if (!dedupedMap[d.class] || d.confidence > dedupedMap[d.class].confidence) dedupedMap[d.class] = d;
  }

  const findings = Object.values(dedupedMap)
    .map((d) => ({ class: d.class, confidence: d.confidence, status: getStatus(d.confidence), entry: getEntry(d.class) }))
    .sort((a, b) => {
      if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
      return severityOrder[a.entry.severity] - severityOrder[b.entry.severity];
    });

  const passed = findings.filter((f) => f.status === "Pass").length;
  const warnings = findings.filter((f) => f.status === "Warning").length;
  const failed = findings.filter((f) => f.status === "Failed").length;
  const score = Math.round((passed / Math.max(findings.length, 1)) * 100);
  const isReal = !!data?.detections?.length;
  const criticalIssues = findings.filter((f) => f.status !== "Pass" && f.entry.severity === "critical").length;

  const overallStatus = failed > 0 ? "Non-compliant" : warnings > 0 ? "Partial" : "Compliant";
  const overallChip = failed > 0 ? "bg-red-100 text-red-700 border-red-200" : warnings > 0 ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-emerald-100 text-emerald-700 border-emerald-200";
  const reportId = `RPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  const summary = failed > 0
    ? `${criticalIssues > 0 ? `${criticalIssues} critical failure${criticalIssues > 1 ? "s" : ""} detected. ` : ""}This stop does not meet DSAPT 2002 requirements and requires remediation before it can be considered accessible.${warnings > 0 ? ` ${warnings} additional item${warnings > 1 ? "s" : ""} flagged for review.` : ""}`
    : warnings > 0
    ? `No critical failures detected. ${warnings} item${warnings > 1 ? "s" : ""} require${warnings === 1 ? "s" : ""} review to achieve full DSAPT compliance. Spot checks are recommended.`
    : "All detected features meet DSAPT 2002 requirements. This stop appears accessible for passengers with disabilities.";

  return (
    <main className="mx-auto min-h-screen max-w-sm bg-slate-50 text-slate-900">
      <div className="bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-sm font-semibold text-emerald-700">9:41</span>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-5 rounded-sm bg-emerald-700" />
            <div className="h-2.5 w-6 rounded-sm border border-slate-300" />
          </div>
        </div>
        <div className="flex items-center justify-between px-5 pb-4">
          <div>
            <h1 className="text-sm font-bold text-slate-900">{reportId}</h1>
            <p className="text-xs text-slate-400">Stop 301 · Reservoir Station · Bundoora</p>
          </div>
          <div className="flex items-center gap-2">
            {!isReal && <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-500">Demo</span>}
            <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">Share</button>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {/* Score */}
        <section className="rounded-2xl bg-white border border-slate-200 p-4">
          <div className="flex gap-4 items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-emerald-700 text-lg font-bold text-emerald-700">{score}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-slate-900">Reservoir Station</h2>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${overallChip}`}>{overallStatus}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Stop 301 · Bundoora / La Trobe</p>
              <p className="text-[10px] text-slate-400 mt-1">Scanned {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {isReal ? "Live AI scan" : "Demo data"}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
              <p className="text-base font-bold text-emerald-700">{passed}</p><p className="text-slate-500">Passed</p>
            </div>
            <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-base font-bold text-yellow-600">{warnings}</p><p className="text-slate-500">Warnings</p>
            </div>
            <div className="rounded-xl bg-red-50 border border-red-200 p-3">
              <p className="text-base font-bold text-red-600">{failed}</p><p className="text-slate-500">Failed</p>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="rounded-2xl bg-white border border-slate-200 p-4">
          <p className="mb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Audit Summary</p>
          <p className="text-xs leading-relaxed text-slate-700">{summary}</p>
        </section>

        {/* Findings */}
        <section>
          <p className="mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">DSAPT Findings · Tap to expand</p>
          <div className="space-y-2">
            {findings.map((f) => {
              const isExpanded = expanded === f.class;
              return (
                <div key={f.class} className={`rounded-2xl border overflow-hidden ${rowStyle(f.status)}`}>
                  <button
                    className="flex w-full items-start justify-between gap-3 p-3.5 text-left"
                    onClick={() => setExpanded(isExpanded ? null : f.class)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <p className="text-sm font-semibold text-slate-900">{f.entry.name}</p>
                        <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase ${severityBadge(f.entry.severity)}`}>{f.entry.severity}</span>
                      </div>
                      <p className="text-[10px] text-slate-500">{f.entry.clause}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${chipStyle(f.status)}`}>{f.status}</span>
                      <span className="text-slate-400 text-[10px]">{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-black/5 px-3.5 pb-4 space-y-3 pt-3">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Detection confidence</span>
                          <span>{Math.round(f.confidence * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/80">
                          <div className={`h-1.5 rounded-full ${f.status === "Pass" ? "bg-emerald-500" : f.status === "Warning" ? "bg-yellow-400" : "bg-red-500"}`} style={{ width: `${Math.round(f.confidence * 100)}%` }} />
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Standard requirement</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{f.entry.description}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Finding</p>
                        <p className="text-xs text-slate-700 leading-relaxed">{f.status === "Pass" ? f.entry.passNote : f.entry.failNote}</p>
                      </div>
                      {f.status !== "Pass" && (
                        <div className="rounded-xl bg-white border border-slate-200 p-3">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Recommended action</p>
                          <p className="text-xs text-slate-700 leading-relaxed">{f.entry.action}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Assessed against the <span className="font-semibold text-slate-600">Disability Standards for Accessible Public Transport (DSAPT) 2002</span>. Results are AI-generated and should be verified by a qualified accessibility auditor before remediation work is undertaken.
          </p>
        </section>

        {/* Actions */}
        <section className="space-y-2 pb-6">
          <button onClick={() => router.push("/m-ptv")} className="w-full rounded-2xl bg-emerald-700 py-3.5 text-sm font-semibold text-white shadow-sm transition active:opacity-80">
            Submit to PTV
          </button>
          <button onClick={() => router.push("/m-scan")} className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 transition active:bg-slate-50">
            Scan another stop
          </button>
        </section>
      </div>

      <nav className="sticky bottom-0 grid grid-cols-4 border-t border-slate-200 bg-white py-3 text-center text-[11px]">
        {NAV.map((n) => (
          <div key={n.label} onClick={() => router.push(n.route)} className={`cursor-pointer font-medium ${n.route === "/m-report" ? "text-emerald-700" : "text-slate-400"}`}>
            {n.label}
          </div>
        ))}
      </nav>
    </main>
  );
}