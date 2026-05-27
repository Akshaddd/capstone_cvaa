"use client";

import { useState } from "react";
import { ThemeToggle, BottomNav } from "../shared";

const NAV = [
  { label: "Reports", href: "/m-council"          },
  { label: "Map",     href: "/m-map"              },
  { label: "Scan",    href: "/m-scan"             },
  { label: "Sign out",href: "/m-landing"          },
];

// ── Data ──────────────────────────────────────────────────────────────────────

const STATS = [
  { val: "342", label: "Public reports", color: "text-slate-900 dark:text-white"    },
  { val: "78%", label: "Resolved",       color: "text-emerald-700 dark:text-emerald-400" },
  { val: "41",  label: "Under review",   color: "text-yellow-600 dark:text-yellow-400"  },
  { val: "12",  label: "Escalated",      color: "text-red-600 dark:text-red-400"         },
];

interface Report {
  id: string;
  title: string;
  location: string;
  suburb: string;
  ago: string;
  status: "Active" | "Review" | "Escalated" | string;
  note?: string;
}

const REPORTS: Report[] = [
  { id: "RPT-001", title: "Broken kerb ramp",                 location: "Chapel St / Commercial Rd",  suburb: "Stonnington", ago: "1 day ago",   status: "Active"    },
  { id: "RPT-002", title: "Missing tactile strip",             location: "Bourke St Mall / Swanston",  suburb: "CBD",         ago: "3 days ago",  status: "Review"    },
  { id: "RPT-003", title: "No accessible path to stop",        location: "Smith St / Johnston St",     suburb: "Fitzroy",     ago: "4 days ago",  status: "Review"    },
  { id: "RPT-004", title: "Broken lift — Flinders St Station", location: "Flinders St / Swanston St",  suburb: "CBD",         ago: "5 days ago",  status: "Escalated", note: "Council action required" },
  { id: "RPT-005", title: "Petition: Brunswick St stop",       location: "Brunswick St",               suburb: "Fitzroy",     ago: "6 days ago",  status: "28/50",     note: "Community support"       },
  { id: "RPT-006", title: "Damaged boarding ramp",             location: "Swanston St / La Trobe St",  suburb: "CBD",         ago: "1 week ago",  status: "Review"    },
  { id: "RPT-007", title: "Signage obstruction",               location: "Elizabeth St / Collins St",  suburb: "CBD",         ago: "1 week ago",  status: "Active"    },
  { id: "RPT-008", title: "Broken shelter — stop 47",          location: "St Kilda Rd / Toorak Rd",    suburb: "Melbourne",   ago: "2 weeks ago", status: "Escalated" },
];

const AREAS: { name: string; score: number; reports: number; trend: "up" | "down" | "flat" }[] = [
  { name: "CBD",        score: 88, reports: 12, trend: "up"   },
  { name: "Carlton",    score: 82, reports: 8,  trend: "flat" },
  { name: "Fitzroy",    score: 71, reports: 15, trend: "down" },
  { name: "Richmond",   score: 68, reports: 11, trend: "down" },
  { name: "Footscray",  score: 48, reports: 22, trend: "up"   },
  { name: "Northcote",  score: 61, reports: 9,  trend: "flat" },
  { name: "Collingwood",score: 74, reports: 7,  trend: "up"   },
];

const COMMUNITY_REVIEWS = [
  { name: "Sarah M.",  suburb: "Fitzroy",    rating: 5, text: "Great improvement at Smith St stop — ramp finally installed.", ago: "2 days ago"  },
  { name: "James K.",  suburb: "CBD",        rating: 3, text: "Flinders St lift still broken. Council needs to act faster.",   ago: "4 days ago"  },
  { name: "Anh T.",    suburb: "Footscray",  rating: 4, text: "Tactile strips replaced on Barkly St. Much better now.",         ago: "1 week ago"  },
  { name: "David R.",  suburb: "Richmond",   rating: 2, text: "Bridge Rd stop still has no ramp. Reported 3 times.",            ago: "1 week ago"  },
  { name: "Priya N.",  suburb: "Carlton",    rating: 5, text: "Lygon St stops are now fully accessible. Thank you!",            ago: "2 weeks ago" },
];

const INSIGHTS = [
  { title: "Most reported issue",   value: "Missing tactile strips",  sub: "38% of all reports",          color: "text-red-600 dark:text-red-400"         },
  { title: "Fastest resolved",      value: "Signage issues",          sub: "Avg 2.1 days",                color: "text-emerald-700 dark:text-emerald-400" },
  { title: "Slowest to resolve",    value: "Lift / elevator faults",  sub: "Avg 18.4 days",               color: "text-yellow-600 dark:text-yellow-400"   },
  { title: "Highest complaint area",value: "Footscray",               sub: "22 active reports",           color: "text-red-600 dark:text-red-400"         },
  { title: "Most improved area",    value: "CBD",                     sub: "+14% this quarter",           color: "text-emerald-700 dark:text-emerald-400" },
  { title: "Community satisfaction",value: "3.8 / 5",                 sub: "Based on 124 reviews",        color: "text-slate-900 dark:text-white"         },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function statusChip(s: string) {
  if (s === "Active")    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
  if (s === "Review")    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
  if (s === "Escalated") return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
  return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= rating ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function BarChart({ areas }: { areas: typeof AREAS }) {
  return (
    <div className="flex flex-col gap-3">
      {areas.map((a) => (
        <div key={a.name}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{a.name}</span>
              <span className={`text-xs ${a.trend === "up" ? "text-emerald-600" : a.trend === "down" ? "text-red-500" : "text-slate-400"}`}>
                {a.trend === "up" ? "↑" : a.trend === "down" ? "↓" : "→"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 dark:text-slate-500">{a.reports} reports</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white w-10 text-right">{a.score}%</span>
            </div>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${
                a.score >= 80 ? "bg-emerald-500" : a.score >= 60 ? "bg-yellow-400" : "bg-red-500"
              }`}
              style={{ width: `${a.score}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

type Tab = "Reports" | "Area index" | "Community" | "Insights";

function ReportsTab({ onSelect }: { onSelect: (r: Report) => void }) {
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
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">
        Active reports — newest first
      </p>
      {REPORTS.map((r) => (
        <button
          key={r.id}
          onClick={() => onSelect(r)}
          className="w-full text-left bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4"
        >
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.title}</p>
            <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${statusChip(r.status)}`}>
              {r.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {r.location} · {r.suburb} · {r.ago}
          </p>
          {r.note && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">{r.note}</p>
          )}
        </button>
      ))}
    </div>
  );
}

function AreaIndexTab() {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
          Accessibility score by suburb
        </p>
        <BarChart areas={AREAS} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mb-1">Best area</p>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">CBD</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">88% accessible</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl p-4">
          <p className="text-xs text-red-700 dark:text-red-400 font-semibold mb-1">Needs most work</p>
          <p className="text-lg font-bold text-red-700 dark:text-red-400">Footscray</p>
          <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">48% accessible</p>
        </div>
      </div>

      {/* Detailed area rows */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-4 pt-4 pb-3">
          Detailed breakdown
        </p>
        {AREAS.map((a, i) => (
          <div
            key={a.name}
            className={`flex items-center justify-between px-4 py-3 ${
              i < AREAS.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{a.reports} active reports</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${
                a.score >= 80 ? "text-emerald-600 dark:text-emerald-400" :
                a.score >= 60 ? "text-yellow-600 dark:text-yellow-400" :
                "text-red-600 dark:text-red-400"
              }`}>{a.score}%</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                a.score >= 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" :
                a.score >= 60 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              }`}>
                {a.score >= 80 ? "Good" : a.score >= 60 ? "Fair" : "Poor"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunityTab() {
  const avgRating = (COMMUNITY_REVIEWS.reduce((s, r) => s + r.rating, 0) / COMMUNITY_REVIEWS.length).toFixed(1);

  return (
    <div className="flex flex-col gap-3">
      {/* Overall rating */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
          Community satisfaction
        </p>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{avgRating}</p>
            <Stars rating={Math.round(Number(avgRating))} />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{COMMUNITY_REVIEWS.length} reviews</p>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            {[5,4,3,2,1].map((star) => {
              const count = COMMUNITY_REVIEWS.filter((r) => r.rating === star).length;
              const pct   = Math.round((count / COMMUNITY_REVIEWS.length) * 100);
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500 w-3">{star}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-1.5 bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">
        Recent reviews
      </p>
      {COMMUNITY_REVIEWS.map((r) => (
        <div key={r.name} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{r.suburb} · {r.ago}</p>
            </div>
            <Stars rating={r.rating} />
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{r.text}</p>
        </div>
      ))}
    </div>
  );
}

function InsightsTab() {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3">
        {INSIGHTS.map((ins) => (
          <div key={ins.title} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{ins.title}</p>
            <p className={`text-xl font-bold ${ins.color}`}>{ins.value}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{ins.sub}</p>
          </div>
        ))}
      </div>

      {/* Trend chart — simple visual */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
          Reports resolved per month
        </p>
        <div className="flex items-end gap-2 h-24">
          {[28,34,22,41,38,52,48].map((v, i) => {
            const labels = ["Nov","Dec","Jan","Feb","Mar","Apr","May"];
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-emerald-500 rounded-t-md"
                  style={{ height: `${(v / 52) * 80}px` }}
                />
                <span className="text-[9px] text-slate-400 dark:text-slate-500">{labels[i]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Report detail modal ───────────────────────────────────────────────────────

function ReportDetail({ report, onClose }: { report: Report; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950">
      <header className="flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-5 py-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Report Detail</h2>
        <button
          onClick={onClose}
          className="text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
        >
          ← Back
        </button>
      </header>

      <div className="flex flex-col gap-3 p-4 overflow-y-auto pb-10">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{report.title}</h3>
            <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${statusChip(report.status)}`}>
              {report.status}
            </span>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex gap-2">
              <span className="text-slate-400 dark:text-slate-500 w-20 flex-shrink-0">Location</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{report.location}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400 dark:text-slate-500 w-20 flex-shrink-0">Suburb</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{report.suburb}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400 dark:text-slate-500 w-20 flex-shrink-0">Reported</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{report.ago}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400 dark:text-slate-500 w-20 flex-shrink-0">Report ID</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{report.id}</span>
            </div>
            {report.note && (
              <div className="flex gap-2">
                <span className="text-slate-400 dark:text-slate-500 w-20 flex-shrink-0">Note</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{report.note}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <button className="w-full bg-emerald-700 text-white font-bold text-sm py-4 rounded-2xl">
          Mark as resolved
        </button>
        <button className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm py-4 rounded-2xl">
          Escalate to council
        </button>
        <button className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm py-4 rounded-2xl">
          Assign to team
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CouncilPage() {
  const [activeTab,    setActiveTab]    = useState<Tab>("Reports");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const TABS: Tab[] = ["Reports", "Area index", "Community", "Insights"];

  if (selectedReport) {
    return <ReportDetail report={selectedReport} onClose={() => setSelectedReport(null)} />;
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-5 pt-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Public Reports</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">City of Melbourne</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white">
              SR
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-5 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-2.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-emerald-700 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400"
                  : "border-transparent text-slate-400 dark:text-slate-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="flex flex-col gap-0 p-4 pb-24">
        {activeTab === "Reports"    && <ReportsTab onSelect={setSelectedReport} />}
        {activeTab === "Area index" && <AreaIndexTab />}
        {activeTab === "Community"  && <CommunityTab />}
        {activeTab === "Insights"   && <InsightsTab />}
      </main>

      <BottomNav items={NAV} active="/m-council" />
    </div>
  );
}