"use client";

import { useEffect, useState } from "react";
import { Sidebar, PageHeader, PTV_NAV } from "../../shared-desktop";

interface StopReport {
  id: string;
  stopNumber: string;
  title: string;
  location: string;
  ago: string;
  status: "Critical" | "Awaiting review" | "Action raised" | "Approved";
  summary?: string;
  score?: number;
  submittedBy?: string;
}

const STOPS: StopReport[] = [
  { id: "CR-001", stopNumber: "Stop #14",  title: "Platform gap 82mm — compliance review required", location: "Swanston St / Bourke St",      ago: "2h ago",      status: "Critical"        },
  { id: "CR-002", stopNumber: "Stop #27",  title: "Tactile surface wear — operator evidence submitted", location: "Collins St / Spencer St",     ago: "Yesterday",   status: "Awaiting review" },
  { id: "CR-003", stopNumber: "Stop #3",   title: "Signage obstruction — remediation action raised", location: "Flinders St / Elizabeth St",  ago: "3 days ago",  status: "Action raised"   },
  { id: "CR-004", stopNumber: "Stop #89",  title: "Kerb ramp damage — assessment approved", location: "Chapel St / Toorak Rd",       ago: "4 days ago",  status: "Approved"        },
  { id: "CR-005", stopNumber: "Stop #52",  title: "Missing boarding ramp — critical compliance issue", location: "St Kilda Rd / Domain Rd",     ago: "5 days ago",  status: "Critical"        },
  { id: "CR-006", stopNumber: "Stop #71",  title: "Shelter damage — evidence requires review", location: "Brunswick St / Alexandra Pde",ago: "1 week ago",  status: "Awaiting review" },
  { id: "CR-007", stopNumber: "Stop #104", title: "Gap filler worn — action assigned", location: "Nicholson St / Gertrude St",  ago: "1 week ago",  status: "Action raised"   },
  { id: "CR-008", stopNumber: "Stop #33",  title: "Tactile strip replacement — compliance record approved", location: "Elizabeth St / La Trobe St",  ago: "2 weeks ago", status: "Approved"        },
];

function statusChip(s: string) {
  if (s === "Critical")        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
  if (s === "Awaiting review") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
  if (s === "Action raised")   return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
}

function StopDetail({ report, onClose }: { report: StopReport; onClose: () => void }) {
  const [action, setAction] = useState<string | null>(null);
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-bold text-slate-900 dark:text-white">Submitted assessment review</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none">x</button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{report.stopNumber} · {report.id}</p>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{report.title}</h3>
            </div>
            <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${statusChip(report.status)}`}>{report.status}</span>
          </div>
          <div className="flex gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-sm text-slate-400 w-24">Location</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{report.location}</span>
          </div>
          <div className="flex gap-3 py-2">
            <span className="text-sm text-slate-400 w-24">Submitted</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{report.ago}</span>
          </div>
          {report.submittedBy && (
            <div className="flex gap-3 py-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-400 w-24">Submitted by</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{report.submittedBy}</span>
            </div>
          )}
          {typeof report.score === "number" && (
            <div className="flex gap-3 py-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-400 w-24">Score</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{report.score}%</span>
            </div>
          )}
          {report.summary && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">Assessment summary</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{report.summary}</p>
            </div>
          )}
          {action && (
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2.5">
              {action}
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setAction("Assessment approved for compliance record.")} className="flex-1 bg-emerald-700 text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-emerald-800">Approve</button>
            <button onClick={() => setAction("Remediation action created for the operator team.")} className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">Create action</button>
            <button onClick={() => setAction("Assessment escalated to council for external coordination.")} className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">Escalate</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PtvStopsPage() {
  const [selected, setSelected] = useState<StopReport | null>(null);
  const [backendReports, setBackendReports] = useState<StopReport[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/report/submitted")
      .then((res) => res.json())
      .then((data) => {
        const mapped: StopReport[] = data.map((r: any, index: number) => ({
          id: r.id ?? `CR-BE-${index + 1}`,
          stopNumber: r.stopNumber ?? r.stop?.id ?? "Submitted stop",
          title: r.title ?? "Accessibility assessment submitted for review",
          location: r.location ?? r.stop?.name ?? "Unknown location",
          ago: "Just now",
          status: r.status === "Critical" ? "Critical" : "Awaiting review",
          summary: r.summary,
          score: r.score,
          submittedBy: r.submittedBy,
        }));

        setBackendReports(mapped);
      })
      .catch((error) => {
        console.error("Failed to load submitted reports:", error);
        setBackendReports([]);
      });
  }, []);

  const reports = [...backendReports, ...STOPS];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar nav={PTV_NAV} active="/d-ptv/stops" user={{ initials: "CO", name: "Compliance Officer", role: "Accessibility compliance" }} />

      <div className="flex flex-1 flex-col min-w-0">
        <PageHeader title="Submitted reports" subtitle="Operator assessments awaiting compliance review" />

        <main className="flex-1 p-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Stop</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Issue</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Location</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Submitted</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={r.id} className={i < reports.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}>
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{r.stopNumber}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{r.title}</td>
                    <td className="px-5 py-3 text-slate-400 dark:text-slate-500">{r.location}</td>
                    <td className="px-5 py-3 text-slate-400 dark:text-slate-500">{r.ago}</td>
                    <td className="px-5 py-3"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusChip(r.status)}`}>{r.status}</span></td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setSelected(r)} className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {selected && <StopDetail report={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}