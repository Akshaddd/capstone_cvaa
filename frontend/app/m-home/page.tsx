"use client";

import Link from "next/link";
import { ThemeProvider, ThemeToggle, BottomNav } from "../shared";
import rawLocations from "../map/real-stops.json";

type Stop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  mode: "tram" | "bus";
  status: "mostly_accessible" | "partial_access" | "review_required";
  features: string[];
  notes: string;
};

const ALL_STOPS = rawLocations as Stop[];

const NEARBY_STOPS = ALL_STOPS.filter(
  (s) => s.lat > -37.726 && s.lat < -37.700 && s.lng > 145.044 && s.lng < 145.062
).slice(0, 3);

const NAV = [
  { label: "Home",    href: "/m-home"    },
  { label: "Scan",    href: "/m-scan"    },
  { label: "Map",     href: "/m-map"     },
  { label: "Reports", href: "/m-reports" },
];

function statusChip(s: Stop["status"]) {
  if (s === "mostly_accessible") return { label: "Accessible", bg: "#d1fae5", text: "#047857" };
  if (s === "partial_access")    return { label: "Partial",    bg: "#fef9c3", text: "#a16207" };
  return                                { label: "Review",     bg: "#fee2e2", text: "#b91c1c" };
}

function stopHref(stop: Stop) {
  return `/m-scan?id=${encodeURIComponent(stop.id)}&name=${encodeURIComponent(stop.name)}&mode=${encodeURIComponent(stop.mode)}&status=${encodeURIComponent(stop.status)}`;
}

function HomeContent() {
  const accessibleCount = NEARBY_STOPS.filter((s) => s.status === "mostly_accessible").length;
  const score = NEARBY_STOPS.length > 0 ? Math.round((accessibleCount / NEARBY_STOPS.length) * 100) : 64;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 pt-5 pb-4 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Good morning</p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">MyAccess</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">M</div>
        </div>
      </header>

      <main className="flex flex-col gap-3 p-4 pb-24">

        {/* Score card */}
        <div className="rounded-2xl bg-emerald-700 p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-75">Accessibility Score Nearby</p>
          <p className="mt-2 text-5xl font-extrabold">{score}%</p>
          <p className="mt-1 text-sm opacity-70">{NEARBY_STOPS.length} stops near La Trobe</p>
        </div>

        {/* Map preview */}
        <Link
          href="/m-map"
          className="relative block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700"
          style={{ height: 160 }}
        >
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=145.044,-37.726,145.062,-37.700&layer=mapnik"
            className="h-full w-full"
            style={{ border: 0, pointerEvents: "none" }}
            title="Map preview"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
              View accessibility map
            </span>
          </div>
        </Link>

        {/* Scan CTA */}
        <Link
          href="/m-scan"
          className="flex items-center justify-between rounded-2xl bg-emerald-700 p-5 text-white shadow-sm"
        >
          <div>
            <p className="text-base font-bold">Scan a stop</p>
            <p className="mt-0.5 text-sm opacity-75">Check DSAPT compliance with photos</p>
          </div>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="opacity-80">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </Link>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Saved Stops",  sub: "Your favourites",   href: "/m-saved"   },
            { label: "Past Reports", sub: "Previous audits",   href: "/m-reports" },
          ].map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.label}</p>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{a.sub}</p>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Nearby stops
          </p>
          {NEARBY_STOPS.length > 0 ? NEARBY_STOPS.map((s) => {
            const chip = statusChip(s.status);
            return (
              <Link
                key={s.id}
                href={stopHref(s)}
                className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0 dark:border-slate-800"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{s.name}</p>
                  <p className="text-xs capitalize text-slate-400 dark:text-slate-500">{s.mode}</p>
                </div>
                <span style={{ background: chip.bg, color: chip.text }} className="ml-3 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold">
                  {chip.label}
                </span>
              </Link>
            );
          }) : (
            <p className="text-sm text-slate-400">No stops found nearby.</p>
          )}
        </div>

      </main>

      <BottomNav items={NAV} active="/m-home" />
    </div>
  );
}

export default function HomePage() {
  return (
    <ThemeProvider>
      <HomeContent />
    </ThemeProvider>
  );
}