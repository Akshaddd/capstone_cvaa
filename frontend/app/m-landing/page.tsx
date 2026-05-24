"use client";

import Link from "next/link";
import { ThemeProvider, ThemeToggle } from "../shared";

function LandingContent() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">

      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 pt-5 pb-4 dark:border-slate-800 dark:bg-slate-950">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">MyAccess</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Melbourne accessibility network</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/m-login" className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white">
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex flex-col gap-4 p-4 pb-10">

        <div className="rounded-2xl bg-emerald-700 p-6 text-white">
          <p className="text-sm font-semibold opacity-80">Accessibility audit tool</p>
          <h2 className="mt-2 text-2xl font-bold leading-tight">DSAPT compliance auditing for Melbourne public transport</h2>
          <p className="mt-2 text-sm opacity-75">Scan a stop, get a structured compliance report.</p>
          <div className="mt-5 flex gap-3">
            <Link href="/m-login" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-700">
              Get started
            </Link>
            <Link href="/m-map" className="rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white">
              View map
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">How it works</h3>
          <div className="flex flex-col gap-4">
            {[
              { step: "1", title: "Find a stop",   desc: "Search or tap any stop on the live accessibility map" },
              { step: "2", title: "Scan it",        desc: "Take photos with your phone — our AI does the rest" },
              { step: "3", title: "Get a report",   desc: "Instant DSAPT compliance report with clause-level findings" },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">{s.step}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { title: "1,000+ stops", sub: "Melbourne network mapped"   },
            { title: "5 AI models",  sub: "Multi-model YOLO pipeline"  },
            { title: "DSAPT aligned",sub: "Clause-level compliance"    },
            { title: "Free to use",  sub: "For everyone, always"       },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{f.title}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{f.sub}</p>
            </div>
          ))}
        </div>

        <Link href="/m-login" className="block w-full rounded-2xl bg-emerald-700 py-4 text-center text-base font-bold text-white shadow-sm">
          Sign in to start scanning
        </Link>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600">
          Or{" "}
          <Link href="/m-map" className="font-semibold text-emerald-700 dark:text-emerald-500">
            browse the map without signing in
          </Link>
        </p>

      </main>
    </div>
  );
}

export default function LandingPage() {
  return (
    <ThemeProvider>
      <LandingContent />
    </ThemeProvider>
  );
}