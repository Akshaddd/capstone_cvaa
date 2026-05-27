"use client";

import { ThemeToggle } from "../shared";

const HOW_IT_WORKS = [
  { step: "1", title: "Find a stop",  desc: "Search or tap any stop on the live accessibility map" },
  { step: "2", title: "Scan it",      desc: "Take photos with your phone — our AI does the rest" },
  { step: "3", title: "Get a report", desc: "Instant DSAPT compliance report with clause-level findings" },
];

const STATS = [
  { title: "1,000+ stops", sub: "Melbourne network mapped"  },
  { title: "5 AI models",  sub: "Multi-model YOLO pipeline" },
  { title: "DSAPT aligned",sub: "Clause-level compliance"   },
  { title: "Free to use",  sub: "For everyone, always"      },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">

      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-5 py-4">
        <div>
          <h1 className="text-xl font-bold">MyAccess</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Melbourne accessibility network</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="/m-login"
            className="bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl"
          >
            Sign in
          </a>
        </div>
      </header>

      <main className="flex flex-col gap-4 p-4 pb-10">

        {/* Hero */}
        <div className="bg-emerald-700 rounded-2xl p-6 text-white">
          <p className="text-xs font-semibold opacity-80 uppercase tracking-wider mb-2">
            Accessibility audit tool
          </p>
          <h2 className="text-2xl font-bold leading-snug mb-2">
            DSAPT compliance auditing for Melbourne public transport
          </h2>
          <p className="text-sm opacity-75 mb-5">
            Scan a stop, get a structured compliance report.
          </p>
          <div className="flex gap-3">
            <a
              href="/m-login"
              className="bg-white text-emerald-700 font-bold text-sm px-5 py-3 rounded-xl"
            >
              Get started
            </a>
            <a
              href="/m-map"
              className="border border-white/40 text-white font-semibold text-sm px-5 py-3 rounded-xl"
            >
              View map
            </a>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="text-base font-bold mb-4">How it works</h3>
          <div className="flex flex-col gap-4">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {STATS.map((f) => (
            <div
              key={f.title}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4"
            >
              <p className="text-sm font-bold">{f.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{f.sub}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href="/m-login"
          className="block w-full bg-emerald-700 text-white font-bold text-base text-center py-4 rounded-2xl"
        >
          Sign in to start scanning
        </a>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          Or{" "}
          <a href="/m-map" className="text-emerald-700 dark:text-emerald-400 font-semibold">
            browse the map without signing in
          </a>
        </p>

      </main>
    </div>
  );
}