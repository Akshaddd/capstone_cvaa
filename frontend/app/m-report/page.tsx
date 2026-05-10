"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const chip = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "pass" || s === "compliant") return "bg-emerald-100 text-emerald-700";
  if (s === "warning" || s === "partial") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};
const box = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "pass" || s === "compliant") return "border-emerald-200 bg-emerald-50";
  if (s === "warning" || s === "partial") return "border-yellow-200 bg-yellow-50";
  return "border-red-200 bg-red-50";
};
function labelToName(label: string) {
  const map: Record<string, string> = { tactile: "Tactile ground surface", ramp: "Kerb ramp", wheelchair: "Wheelchair access", tram: "Tram platform", sign: "Accessible signage", gap: "Platform gap clearance", path: "Path of travel" };
  return map[label.toLowerCase()] ?? label;
}
function deriveStatus(c: number) { return c >= 0.75 ? "Pass" : c >= 0.45 ? "Warning" : "Failed"; }

interface Detection { label: string; confidence: number; dsapt_status?: string; note?: string; }
interface ScanResult { detections?: Detection[]; score?: number; summary?: string; passed?: number; warnings?: number; failed?: number; }

export default function MobileReportPage() {
  const router = useRouter();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try { const raw = sessionStorage.getItem("scanResult"); if (raw) setResult(JSON.parse(raw)); } catch {}
    setLoading(false);
  }, []);

  if (loading) return <main className="mx-auto flex min-h-screen max-w-sm items-center justify-center bg-white"><p className="text-sm text-slate-500">Loading report…</p></main>;

  const detections: Detection[] = result?.detections?.length ? result.detections : [
    { label: "tactile", confidence: 0.91, dsapt_status: "Pass", note: "Compliant indicators at boarding zone" },
    { label: "path", confidence: 0.83, dsapt_status: "Pass", note: "1,200mm clearance confirmed" },
    { label: "sign", confidence: 0.52, dsapt_status: "Warning", note: "Sign partially obstructed — review needed" },
    { label: "gap", confidence: 0.31, dsapt_status: "Failed", note: "Gap 82mm exceeds DSAPT threshold" },
  ];

  const findings = detections.map((d) => ({ name: labelToName(d.label), status: d.dsapt_status ?? deriveStatus(d.confidence), note: d.note ?? `Confidence: ${Math.round(d.confidence * 100)}%`, confidence: d.confidence }));
  const passed = result?.passed ?? findings.filter((f) => f.status === "Pass").length;
  const warnings = result?.warnings ?? findings.filter((f) => f.status === "Warning").length;
  const failed = result?.failed ?? findings.filter((f) => f.status === "Failed").length;
  const score = result?.score ?? Math.round((passed / Math.max(findings.length, 1)) * 100);
  const overallStatus = failed > 0 ? "Non-compliant" : warnings > 0 ? "Partial" : "Compliant";
  const overallChip = failed > 0 ? "bg-red-100 text-red-700" : warnings > 0 ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700";
  const reportId = `RPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const summaryText = result?.summary ?? (failed > 0 ? `This stop has ${failed} critical failure${failed > 1 ? "s" : ""} requiring immediate attention before it can be considered DSAPT compliant.${warnings > 0 ? ` There ${warnings === 1 ? "is" : "are"} also ${warnings} item${warnings > 1 ? "s" : ""} flagged for review.` : ""}` : warnings > 0 ? `This stop is partially compliant. ${warnings} item${warnings > 1 ? "s" : ""} require${warnings === 1 ? "s" : ""} review but no critical failures were detected.` : "This stop is fully compliant with DSAPT standards. All accessibility features are present and functioning correctly.");

  return (
    <main className="mx-auto min-h-screen max-w-sm bg-white text-slate-900">
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1">
        <span className="text-sm font-semibold text-emerald-700">9:41</span>
        <div className="flex gap-2"><div className="h-3 w-5 rounded bg-emerald-700" /><div className="h-3 w-6 rounded border border-emerald-700" /></div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div><h1 className="text-sm font-bold text-slate-900">{reportId}</h1><p className="text-xs text-slate-500">Flinders St / Elizabeth St</p></div>
        <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700">Share</button>
      </header>

      <div className="space-y-4 p-4">
        {/* Hero */}
        <section className="rounded-2xl bg-slate-50 p-4">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-emerald-700 text-xl font-bold text-emerald-700">{score}</div>
            <div>
              <h2 className="font-semibold text-slate-900">Flinders St / Elizabeth St</h2>
              <p className="text-xs text-slate-500">Routes 70, 75 · CBD · Melbourne</p>
              <p className="mt-1 text-xs text-slate-400">Scanned today at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl bg-white p-3"><p className="text-lg font-bold text-emerald-700">{passed}</p><p className="text-slate-500">Passed</p></div>
            <div className="rounded-xl bg-white p-3"><p className="text-lg font-bold text-yellow-600">{warnings}</p><p className="text-slate-500">Warnings</p></div>
            <div className="rounded-xl bg-white p-3"><p className="text-lg font-bold text-red-600">{failed}</p><p className="text-slate-500">Failed</p></div>
          </div>
        </section>

        {/* Findings */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Technical findings</h3>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${overallChip}`}>{overallStatus}</span>
          </div>
          <div className="space-y-2.5">
            {findings.map((f) => (
              <div key={f.name} className={`rounded-2xl border p-3.5 ${box(f.status)}`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{f.name}</p>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${chip(f.status)}`}>{f.status}</span>
                </div>
                <p className="text-xs text-slate-600">{f.note}</p>
                <div className="mt-2.5 h-1.5 w-full rounded-full bg-white/80">
                  <div className={`h-1.5 rounded-full ${f.status === "Pass" ? "bg-emerald-500" : f.status === "Warning" ? "bg-yellow-400" : "bg-red-500"}`} style={{ width: `${Math.round(f.confidence * 100)}%` }} />
                </div>
                <p className="mt-1 text-right text-[10px] text-slate-400">{Math.round(f.confidence * 100)}% confidence</p>
              </div>
            ))}
          </div>
        </section>

        {/* Summary */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Summary</h3>
          <p className="text-xs leading-relaxed text-slate-600">{summaryText}</p>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-[10px] text-slate-400">Assessed against DSAPT 2002. AI-generated — verify with a qualified auditor.</p>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-3 pb-6">
          <button onClick={() => router.push("/m-ptv")} className="w-full rounded-2xl bg-emerald-700 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-200 active:opacity-80">Submit to PTV</button>
          <button onClick={() => router.push("/m-home")} className="w-full rounded-2xl border border-slate-200 py-4 text-sm font-semibold text-slate-700 active:bg-slate-50">Save as Draft</button>
        </section>
      </div>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 grid grid-cols-4 border-t border-slate-200 bg-white py-3 text-center text-[11px]">
        <div onClick={() => router.push("/m-home")} className="cursor-pointer text-slate-500 active:text-emerald-700">Home</div>
        <div onClick={() => router.push("/m-scan")} className="cursor-pointer text-slate-500 active:text-emerald-700">Scan</div>
        <div className="font-semibold text-emerald-700">Reports</div>
        <div onClick={() => router.push("/map")} className="cursor-pointer text-slate-500 active:text-emerald-700">Map</div>
      </nav>
    </main>
  );
}