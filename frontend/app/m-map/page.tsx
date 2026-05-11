"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import map to avoid SSR issues
const MobileMap = dynamic(() => import("./mobileMapInner"), { ssr: false });

export default function MobileMapPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const filters = [
    { key: "all", label: "All" },
    { key: "tram", label: "🚃 Tram" },
    { key: "bus", label: "🚌 Bus" },
    { key: "mostly_accessible", label: "✅ Accessible" },
    { key: "partial_access", label: "⚠️ Partial" },
    { key: "review_required", label: "🔴 Review" },
  ];

  return (
    <main className="mx-auto flex h-screen max-w-sm flex-col bg-white text-slate-900">
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1 shrink-0">
        <span className="text-sm font-semibold text-emerald-700">9:41</span>
        <div className="flex gap-2">
          <div className="h-3 w-5 rounded bg-emerald-700" />
          <div className="h-3 w-6 rounded border border-emerald-700" />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-2 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Accessibility Map</h1>
          <p className="text-xs text-slate-500">Melbourne tram & bus stops</p>
        </div>
        <button
          onClick={() => router.push("/m-home")}
          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
        >
          ← Back
        </button>
      </div>

      {/* Filters - horizontal scroll */}
      <div className="shrink-0 overflow-x-auto px-4 pb-3">
        <div className="flex gap-2" style={{ width: "max-content" }}>
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === f.key
                  ? "bg-emerald-700 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map - takes remaining space */}
      <div className="flex-1 overflow-hidden rounded-t-2xl border-t border-slate-200">
        <MobileMap filter={filter} />
      </div>
    </main>
  );
}