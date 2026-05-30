"use client";

import { ThemeToggle } from "../shared-desktop";

const HOW_IT_WORKS = [
  { step: "1", title: "Find a stop",  desc: "Browse the interactive map or search by stop name or route number" },
  { step: "2", title: "Scan it",      desc: "Take photos with your phone or upload from your computer"          },
  { step: "3", title: "Get a report", desc: "Instant plain-English report showing who can use the stop"         },
];

const STATS = [
  { val: "1,355",        label: "Stops mapped"          },
  { val: "Smart scanning",label: "AI-powered analysis"  },
  { val: "Plain English", label: "Reports anyone can read"},
  { val: "Free",          label: "For everyone, always" },
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

      <section className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-2 gap-16 items-center">
        <div>
          <span className="inline-block bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Melbourne public transport
          </span>
          <h1 className="text-5xl font-bold leading-tight text-slate-900 dark:text-white mb-6">
            Making every stop accessible for everyone
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Scan a tram or bus stop, get an instant report on who can use it, and submit issues directly to PTV and council.
          </p>
          <div className="flex gap-4">
            <a href="/d-register" className="bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-800">
              Create free account
            </a>
            <a href="/d-map" className="border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-6 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
              Browse the map
            </a>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{s.val}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">How it works</h2>
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

      <section id="about" className="max-w-7xl mx-auto px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Built for Melbourne</h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8">
          MyAccess helps everyday riders, PTV operators, and local councils work together to improve accessibility across the Melbourne tram and bus network.
        </p>
        <a href="/d-register" className="inline-block bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-emerald-800">
          Get started for free
        </a>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between text-sm text-slate-400 dark:text-slate-500">
          <span>MyAccess · Melbourne accessibility network</span>
          <div className="flex gap-6">
            <a href="/d-login" className="hover:text-slate-600 dark:hover:text-slate-300">Sign in</a>
            <a href="/d-register" className="hover:text-slate-600 dark:hover:text-slate-300">Register</a>
            <a href="/d-map" className="hover:text-slate-600 dark:hover:text-slate-300">Map</a>
          </div>
        </div>
      </footer>
    </div>
  );
}