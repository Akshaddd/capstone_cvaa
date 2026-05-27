"use client";

import { useState } from "react";
import { ThemeToggle, BottomNav } from "../shared";

const NAV = [
  { label: "Dashboard", href: "/m-ptv"     },
  { label: "Map",       href: "/m-map"     },
  { label: "Scan",      href: "/m-scan"    },
  { label: "Sign out",  href: "/m-landing" },
];

type Tab = "Dashboard" | "Stop reports" | "Routes" | "Maintenance";
const TABS: Tab[] = ["Dashboard", "Stop reports", "Routes", "Maintenance"];

const STATS = [
  { val: "148", label: "Total stops", color: "text-slate-900 dark:text-white"          },
  { val: "91%", label: "Compliance",  color: "text-emerald-700 dark:text-emerald-400"  },
  { val: "23",  label: "Pending",     color: "text-yellow-600 dark:text-yellow-400"    },
  { val: "7",   label: "Critical",    color: "text-red-600 dark:text-red-400"          },
];

interface StopReport {
  id: string; stopNumber: string; title: string;
  location: string; ago: string; status: "Critical" | "Active" | "Scheduled" | "Resolved";
}

const STOP_REPORTS: StopReport[] = [
  { id: "SR-001", stopNumber: "Stop #14",  title: "Platform gap 82mm — exceeds DSAPT limit", location: "Swanston St / Bourke St",      ago: "2h ago",      status: "Critical"  },
  { id: "SR-002", stopNumber: "Stop #27",  title: "Tactile surface wear — 60% degraded",      location: "Collins St / Spencer St",     ago: "Yesterday",   status: "Active"    },
  { id: "SR-003", stopNumber: "Stop #3",   title: "Signage obstruction — tree branch",         location: "Flinders St / Elizabeth St",  ago: "3 days ago",  status: "Scheduled" },
  { id: "SR-004", stopNumber: "Stop #89",  title: "Kerb ramp damage — surface cracked",        location: "Chapel St / Toorak Rd",       ago: "4 days ago",  status: "Resolved"  },
  { id: "SR-005", stopNumber: "Stop #52",  title: "Missing boarding ramp",                     location: "St Kilda Rd / Domain Rd",     ago: "5 days ago",  status: "Critical"  },
  { id: "SR-006", stopNumber: "Stop #71",  title: "Shelter damage — wind damage",              location: "Brunswick St / Alexandra Pde",ago: "1 week ago",  status: "Active"    },
  { id: "SR-007", stopNumber: "Stop #104", title: "Gap filler worn — needs replacement",       location: "Nicholson St / Gertrude St",  ago: "1 week ago",  status: "Scheduled" },
  { id: "SR-008", stopNumber: "Stop #33",  title: "Tactile strip fully replaced",              location: "Elizabeth St / La Trobe St",  ago: "2 weeks ago", status: "Resolved"  },
];

const ROUTES = [
  { name: "Route 70",  pct: 96, stops: 34, issues: 1 },
  { name: "Route 86",  pct: 88, stops: 28, issues: 3 },
  { name: "Route 48",  pct: 79, stops: 22, issues: 5 },
  { name: "Route 12",  pct: 58, stops: 19, issues: 8 },
  { name: "Route 96",  pct: 94, stops: 31, issues: 2 },
  { name: "Route 109", pct: 83, stops: 26, issues: 4 },
];

const MAINTENANCE = [
  { title: "Tactile replacement — Stop #27", due: "Tomorrow",   priority: "High",     assignee: "Team A" },
  { title: "Gap filler — Stop #14",          due: "In 2 days",  priority: "Critical", assignee: "Team B" },
  { title: "Signage — Stop #3",              due: "This week",  priority: "Medium",   assignee: "Team C" },
  { title: "Shelter repair — Stop #71",      due: "Next week",  priority: "Low",      assignee: "Team A" },
  { title: "Ramp install — Stop #52",        due: "Next week",  priority: "High",     assignee: "Team B" },
];

const TREND = [62, 71, 68, 78, 82, 88, 91];
const TREND_LABELS = ["Nov","Dec","Jan","Feb","Mar","Apr","May"];

function statusChip(s: string) {
  if (s === "Critical")  return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
  if (s === "Active")    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
  if (s === "Scheduled") return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
  if (s === "Resolved")  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
  return "bg-slate-100 text-slate-500";
}

function priorityChip(p: string) {
  if (p === "Critical") return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
  if (p === "High")     return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
  if (p === "Medium")   return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
  return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
}

function StopReportDetail({ report, onClose }: { report: StopReport; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950">
      <header className="flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-5 py-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Stop Report</h2>
        <button onClick={onClose} className="text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">← Back</button>
      </header>
      <div className="flex flex-col gap-3 p-4 overflow-y-auto pb-10">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{report.stopNumber} · {report.id}</p>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{report.title}</h3>
            </div>
            <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${statusChip(report.status)}`}>{report.status}</span>
          </div>
          {[
            { label: "Location", val: report.location },
            { label: "Reported", val: report.ago      },
          ].map((row) => (
            <div key={row.label} className="flex gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <span className="text-xs text-slate-400 dark:text-slate-500 w-20 flex-shrink-0">{row.label}</span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{row.val}</span>
            </div>
          ))}
        </div>
        <button className="w-full bg-emerald-700 text-white font-bold text-sm py-4 rounded-2xl">Mark as resolved</button>
        <button className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm py-4 rounded-2xl">Schedule maintenance</button>
        <button className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm py-4 rounded-2xl">Escalate to council</button>
      </div>
    </div>
  );
}

function DashboardTab({ onSelect }: { onSelect: (r: StopReport) => void }) {
  const critical = STOP_REPORTS.filter((r) => r.status === "Critical");
  const active   = STOP_REPORTS.filter((r) => r.status === "Active");
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Compliance trend</p>
        <div className="flex items-end gap-2 h-20">
          {TREND.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full rounded-t-md ${v >= 85 ? "bg-emerald-500" : v >= 70 ? "bg-yellow-400" : "bg-red-500"}`} style={{ height: `${(v / 100) * 64}px` }} />
              <span className="text-[9px] text-slate-400 dark:text-slate-500">{TREND_LABELS[i]}</span>
            </div>
          ))}
        </div>
      </div>
      {critical.length > 0 && (
        <>
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mt-1">Critical — action required</p>
          {critical.map((r) => (
            <button key={r.id} onClick={() => onSelect(r)} className="w-full text-left bg-red-50 dark:bg-red-950 rounded-2xl border border-red-200 dark:border-red-800 p-4">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">{r.stopNumber}</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{r.title}</p>
                </div>
                <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${statusChip(r.status)}`}>{r.status}</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">{r.location} · {r.ago}</p>
            </button>
          ))}
        </>
      )}
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">Active reports</p>
      {active.map((r) => (
        <button key={r.id} onClick={() => onSelect(r)} className="w-full text-left bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{r.stopNumber}</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{r.title}</p>
            </div>
            <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${statusChip(r.status)}`}>{r.status}</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">{r.location} · {r.ago}</p>
        </button>
      ))}
    </div>
  );
}

function StopReportsTab({ onSelect }: { onSelect: (r: StopReport) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">All stop reports — newest first</p>
      {STOP_REPORTS.map((r) => (
        <button key={r.id} onClick={() => onSelect(r)} className="w-full text-left bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{r.stopNumber} · {r.id}</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{r.title}</p>
            </div>
            <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${statusChip(r.status)}`}>{r.status}</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">{r.location} · {r.ago}</p>
        </button>
      ))}
    </div>
  );
}

function RoutesTab() {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Compliance by route</p>
        <div className="flex flex-col gap-4">
          {ROUTES.map((r) => (
            <div key={r.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{r.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 dark:text-slate-500">{r.issues} issue{r.issues !== 1 ? "s" : ""}</span>
                  <span className={`text-sm font-bold ${r.pct >= 85 ? "text-emerald-600 dark:text-emerald-400" : r.pct >= 70 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>{r.pct}%</span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-2 rounded-full ${r.pct >= 85 ? "bg-emerald-500" : r.pct >= 70 ? "bg-yellow-400" : "bg-red-500"}`} style={{ width: `${r.pct}%` }} />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{r.stops} stops</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MaintenanceTab() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">Scheduled maintenance</p>
      {MAINTENANCE.map((m, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white flex-1">{m.title}</p>
            <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${priorityChip(m.priority)}`}>{m.priority}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <span>Due: <span className="font-semibold text-slate-600 dark:text-slate-300">{m.due}</span></span>
            <span>Assigned: <span className="font-semibold text-slate-600 dark:text-slate-300">{m.assignee}</span></span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PtvPage() {
  const [activeTab,      setActiveTab]      = useState<Tab>("Dashboard");
  const [selectedReport, setSelectedReport] = useState<StopReport | null>(null);

  if (selectedReport) {
    return <StopReportDetail report={selectedReport} onClose={() => setSelectedReport(null)} />;
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-5 pt-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{activeTab}</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">PTV · Melbourne network</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white">PK</div>
          </div>
        </div>
        <div className="flex gap-5 overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-2.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-emerald-700 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400"
                  : "border-transparent text-slate-400 dark:text-slate-500"
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </header>
      <main className="flex flex-col gap-0 p-4 pb-24">
        {activeTab === "Dashboard"    && <DashboardTab onSelect={setSelectedReport} />}
        {activeTab === "Stop reports" && <StopReportsTab onSelect={setSelectedReport} />}
        {activeTab === "Routes"       && <RoutesTab />}
        {activeTab === "Maintenance"  && <MaintenanceTab />}
      </main>
      <BottomNav items={NAV} active="/m-ptv" />
    </div>
  );
}