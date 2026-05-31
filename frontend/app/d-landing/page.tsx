"use client";

import { ThemeToggle } from "../shared-desktop";

const HOW_IT_WORKS = [
  { step: "1", title: "Find a stop",  desc: "Browse the map or search by stop name or route number" },
  { step: "2", title: "Scan it",      desc: "Upload photos from your phone or computer"             },
  { step: "3", title: "Get a report", desc: "Instant plain-English report showing who can use the stop and what needs fixing" },
];

const STATS = [
  { val: "DSAPT",        label: "Compliance standard"      },
  { val: "AI-powered",   label: "Smart photo analysis"     },
  { val: "Plain English",label: "Reports anyone can read"  },
  { val: "Free",         label: "For everyone, always"     },
];

export default function DesktopLandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">

      <header className="sticky top-0 z-10 flex items-center justify-between max-w-7xl mx-auto px-8 py-5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-700 rounded-xl flex items-center justify-center text-white font-bold text-sm">M</div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">MyAccess</span>
        </div>
        <nav className="flex items-center gap-8">
          <a href="#how" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">How it works</a>
          <a href="#about" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">About</a>
          <ThemeToggle />
          <a href="/d-login" className="text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
            Sign in
          </a>
          <a href="/d-register" className="text-sm font-semibold bg-emerald-700 text-white px-4 py-2 rounded-xl hover:bg-emerald-800">
            Get started
          </a>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-8 py-24 grid grid-cols-2 gap-16 items-center">
        <div>
          <span className="inline-block bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Accessibility auditing tool
          </span>
          <h1 className="text-5xl font-bold leading-tight text-slate-900 dark:text-white mb-6">
            Audit public transport stops for accessibility
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Scan any stop, get an instant DSAPT compliance report, and submit issues directly to operators and councils.
          </p>
          <div className="flex gap-4">
            <a href="/d-register" className="bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-800">
              Start auditing for free
            </a>
            <a href="/d-map" className="border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-6 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
              Browse the map
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">{s.val}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 text-center">How it works</h2>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-12">Three steps to a full accessibility report</p>
          <div className="grid grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="max-w-7xl mx-auto px-8 py-24 flex justify-center">
        <div className="bg-emerald-700 rounded-3xl p-10 text-white text-center max-w-xl w-full">
          <p className="text-5xl font-extrabold mb-3">DSAPT</p>
          <p className="text-emerald-200 text-lg mb-6">Disability Standards for Accessible Public Transport</p>
          <p className="text-emerald-100 text-sm leading-relaxed">
            Every report is checked against the DSAPT 2002 framework — the Australian legal standard for accessible public transport infrastructure.
          </p>
          <a href="/d-register" className="inline-block mt-8 bg-white text-emerald-700 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50">
            Start your first audit
          </a>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between text-sm text-slate-400 dark:text-slate-500">
          <span>MyAccess &copy; {new Date().getFullYear()}</span>
          <div className="flex gap-6">
            <a href="/d-login"    className="hover:text-slate-600 dark:hover:text-slate-300">Sign in</a>
            <a href="/d-register" className="hover:text-slate-600 dark:hover:text-slate-300">Register</a>
            <a href="/d-map"      className="hover:text-slate-600 dark:hover:text-slate-300">Map</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
