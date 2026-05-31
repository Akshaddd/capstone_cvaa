"use client";

import { Sidebar, PageHeader, COUNCIL_NAV } from "../../shared-desktop";

const REVIEWS = [
  { name: "Sarah M.", suburb: "Fitzroy",   rating: 5, text: "Great improvement at Smith St stop — ramp finally installed.", ago: "2 days ago"  },
  { name: "James K.", suburb: "CBD",       rating: 3, text: "Flinders St lift still broken. Council needs to act faster.",  ago: "4 days ago"  },
  { name: "Anh T.",   suburb: "Footscray", rating: 4, text: "Tactile strips replaced on Barkly St. Much better now.",       ago: "1 week ago"  },
  { name: "David R.", suburb: "Richmond",  rating: 2, text: "Bridge Rd stop still has no ramp. Reported 3 times.",          ago: "1 week ago"  },
  { name: "Priya N.", suburb: "Carlton",   rating: 5, text: "Lygon St stops are now fully accessible. Thank you!",          ago: "2 weeks ago" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24"
          fill={i <= rating ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

export default function CouncilCommunityPage() {
  const avg = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar nav={COUNCIL_NAV} active="/d-council/community" user={{ initials: "SR", name: "S. Roberts", role: "City of Melbourne" }} />

      <div className="flex flex-1 flex-col min-w-0">
        <PageHeader title="Community" subtitle="Public satisfaction and feedback" />

        <main className="flex-1 p-6 grid grid-cols-3 gap-6 items-start">

          <div className="col-span-2 flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Recent reviews</p>
            {REVIEWS.map((r) => (
              <div key={r.name} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{r.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{r.suburb} · {r.ago}</p>
                  </div>
                  <Stars rating={r.rating} />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Overall satisfaction</p>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-slate-900 dark:text-white">{avg}</p>
                  <Stars rating={Math.round(Number(avg))} />
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{REVIEWS.length} reviews</p>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  {[5,4,3,2,1].map((star) => {
                    const count = REVIEWS.filter((r) => r.rating === star).length;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 dark:text-slate-500 w-3">{star}</span>
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-1.5 bg-yellow-400 rounded-full" style={{ width: `${(count / REVIEWS.length) * 100}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500 w-3">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}