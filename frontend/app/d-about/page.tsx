"use client";

import { ThemeToggle } from "../shared-desktop";

const APP_LOGO_SRC = "/myaccess-logo.jpeg";

const TEAM = [
  { name: "Pasan Jayarathna",  id: "21963056", role: "Risk Manager · Backend Dev",          initials: "PJ", img: "/team/PJ.png" },
  { name: "Akshad Shelar",     id: "22021511", role: "Compliance · Backend Dev",             initials: "AK", img: "/team/akshad.jpg" },
  { name: "Pragna Guruprasad", id: "22282648", role: "Figma Designer · Frontend Dev",        initials: "PR", img: "/team/pragna.jpg" },
  { name: "Nadil Silva",       id: "21963139", role: "ML Engineer · Backend Dev",            initials: "NA", img: "/team/nadil.jpg" },
  { name: "Rui Hong Gan",      id: "22091871", role: "Security Engineer · Frontend Dev",     initials: "RU", img: "/team/rui.jpg" },
];

const TECH = [
  { label: "Object Detection", val: "YOLOv8 / YOLO26s" },
  { label: "Vision Narrative", val: "Claude Vision API" },
  { label: "Backend",          val: "FastAPI · Python 3.11" },
  { label: "Frontend",         val: "Next.js · TypeScript · Tailwind" },
  { label: "Infrastructure",   val: "Docker · GitHub · Node" },
  { label: "Standards",        val: "DSAPT (Australian)" },
];

const MILESTONES = [
  { dates: "16 Mar – 23 Mar 2026", label: "Sprint 1", desc: "Setup & Planning" },
  { dates: "23 Mar – 6 Apr 2026",  label: "Sprint 2", desc: "Tradeshow & Model Development" },
  { dates: "6 Apr – 20 Apr 2026",  label: "Sprint 3", desc: "Feature Refining & Authentication" },
  { dates: "20 Apr – 4 May 2026",  label: "Sprint 4", desc: "End-to-End System & Business Model" },
  { dates: "4 May – 18 May 2026",  label: "Sprint 5", desc: "Finalisation & Presentation" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">

      {/* Navbar */}
      <header className="sticky top-0 z-10 flex items-center justify-between max-w-7xl mx-auto px-8 py-5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <a href="/d-landing" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src={APP_LOGO_SRC}
              alt="MyAccess logo"
              className="h-full w-full object-contain p-1"
            />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">MyAccess</span>
        </a>
        <nav className="flex items-center gap-8">
          <a href="/d-landing#how" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">How it works</a>
          <a href="/d-about" className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">About</a>
          <ThemeToggle />
          <a href="/d-login" className="text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
            Sign in
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 py-20 text-center">
        <span className="inline-block bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          La Trobe University · Capstone Project · Team RSNA
        </span>
        <div className="mb-6 flex justify-center">
          <img
            src={APP_LOGO_SRC}
            alt="MyAccess accessibility logo"
            className="h-24 w-24 rounded-3xl object-contain bg-white p-2 border border-slate-200 dark:border-slate-700 shadow-sm"
          />
        </div>
        <h1 className="text-5xl font-bold leading-tight text-slate-900 dark:text-white mb-6">
          Redefining Accessibility
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
          A computer vision system that automatically audits accessibility compliance across public transport infrastructure — detecting features, mapping them to DSAPT standards, and generating structured compliance reports.
        </p>
      </section>

      {/* Problem */}
      <section className="bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 py-16">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">The Problem</h2>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            Amended Transport Standards will require operators and providers of public transport to report on accessibility features and barriers across their networks. Manual audits cost <span className="font-semibold text-slate-700 dark:text-slate-300">$5k–$15k per venue</span> and take 1–3 days. Operators are reluctant to comply due to the cost and the exposure of shortcomings.
          </p>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Victoria alone has 1,800+ tram stops, 220 train stations, and thousands of bus stops — all with DSAPT obligations and a 2025 compliance deadline creating urgent demand.
          </p>
        </div>
      </section>

      {/* Solution */}
      <section className="max-w-4xl mx-auto px-8 py-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Solution</h2>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
          MyAccess lets operators photograph a bus station, tram stop, or train platform and automatically generate a DSAPT-aligned accessibility report in under 60 seconds — at a fraction of the cost of manual inspection.
        </p>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          The system uses a dual-model approach: <span className="font-semibold text-slate-700 dark:text-slate-300">YOLO26s</span> for real-time object detection of physical features (tactile paving, ramps, stairs, handrails, platform edges, step gaps), and <span className="font-semibold text-slate-700 dark:text-slate-300">Claude Vision</span> for contextual narrative analysis. Detections are mapped to DSAPT clauses, severity-rated, and compiled into a structured report. Sprint 2 delivered a live end-to-end pipeline with 90%+ detection accuracy.
        </p>
        <div className="inline-block bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-6 py-4 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
          Built in collaboration with DITRDCA · Targeting AEA grant funding (TRL 3 → 5) · IP held by La Trobe University
        </div>
      </section>

      {/* Tech Stack */}
      <section className="bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 py-16">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Technology</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TECH.map((t) => (
              <div key={t.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">{t.label}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="max-w-4xl mx-auto px-8 py-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Project Timeline</h2>
        <div className="space-y-3">
          {MILESTONES.map((m) => (
            <div key={m.label} className="flex items-center gap-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {m.label.split(" ")[1]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{m.label} — {m.desc}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{m.dates}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 py-16">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">The Team</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">Team RSNA · La Trobe University</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TEAM.map((m) => (
              <div key={m.name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center text-center">
                {m.img ? (
                  <img src={m.img} alt={m.name} className="w-14 h-14 rounded-full object-cover mb-4" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-emerald-700 text-white font-bold text-lg flex items-center justify-center mb-4">
                    {m.initials}
                  </div>
                )}
                <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{m.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-1">{m.role}</p>
                <p className="text-xs text-slate-300 dark:text-slate-600">{m.id}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between text-sm text-slate-400 dark:text-slate-500">
          <span>MyAccess &copy; {new Date().getFullYear()} · Team RSNA · La Trobe University</span>
          <div className="flex gap-6">
            <a href="/d-login" className="hover:text-slate-600 dark:hover:text-slate-300">Sign in</a>
            <a href="/d-map"   className="hover:text-slate-600 dark:hover:text-slate-300">Map</a>
          </div>
        </div>
      </footer>
    </div>
  );
}