export default function CouncilDashboardPage() {
  const reports: [string, string, string, string, string, string][] = [
    ["#0341", "Broken kerb ramp", "Chapel St / Commercial Rd", "Stonnington", "1 day ago", "Active"],
    ["#0340", "Missing tactile strip", "Bourke St Mall / Swanston", "CBD", "3 days ago", "Review"],
    ["#0339", "No accessible path", "Smith St / Johnston St", "Fitzroy", "4 days ago", "Review"],
    ["#0338", "Broken lift", "Flinders St Station", "CBD", "5 days ago", "Escalated"],
    ["#0337", "New stop request", "Brunswick St / Gertrude", "Fitzroy", "6 days ago", "Submitted"],
    ["#0336", "Signage illegible", "St Kilda Rd / Domain", "St Kilda", "1 week ago", "Resolved"],
  ];

  const areas: [string, number][] = [
    ["CBD", 88],
    ["Carlton", 82],
    ["Fitzroy", 71],
    ["Richmond", 68],
    ["St Kilda", 65],
    ["Footscray", 48],
  ];

  const chip = (status: string) => {
    if (status === "Active" || status === "Resolved") return "bg-emerald-100 text-emerald-700";
    if (status === "Review") return "bg-yellow-100 text-yellow-700";
    if (status === "Escalated") return "bg-red-100 text-red-700";
    return "bg-purple-100 text-purple-700";
  };

  return (
    <main className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside className="hidden w-72 flex-col border-r bg-white p-6 lg:flex">
        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-700 font-bold text-white">
              M
            </div>
            <div>
              <p className="font-semibold">MyAccess</p>
              <p className="text-xs text-slate-500">City of Melbourne</p>
            </div>
          </div>

          <nav className="space-y-2 text-sm">
            <p className="text-xs uppercase text-slate-400">Overview</p>
            <div className="rounded-xl px-3 py-2 text-slate-600">Overview</div>
            <div className="rounded-xl bg-purple-50 px-3 py-2 font-medium text-purple-700">
              Public reports
            </div>

            <p className="pt-5 text-xs uppercase text-slate-400">Transparency</p>
            <div className="rounded-xl px-3 py-2 text-slate-600">Published data</div>
            <div className="rounded-xl px-3 py-2 text-slate-600">Transparency reports</div>

            <p className="pt-5 text-xs uppercase text-slate-400">Insights</p>
            <div className="rounded-xl px-3 py-2 text-slate-600">Area insights</div>
            <div className="rounded-xl px-3 py-2 text-slate-600">Suburb rankings</div>

            <p className="pt-5 text-xs uppercase text-slate-400">Community</p>
            <div className="rounded-xl px-3 py-2 text-slate-600">Community view</div>
            <div className="rounded-xl px-3 py-2 text-slate-600">Petitions</div>
          </nav>
        </div>

        <div className="mt-auto flex items-center gap-3 border-t pt-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-semibold">
            SR
          </div>
          <div>
            <p className="text-sm font-medium">Sarah Reid</p>
            <p className="text-xs text-slate-500">Council Officer</p>
          </div>
        </div>
      </aside>

      <section className="flex-1 space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Public Reports</h1>
            <p className="text-sm text-slate-500">Community-submitted accessibility issues</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="rounded-xl border px-4 py-2 text-sm">Download report</button>
            <button className="rounded-xl bg-purple-700 px-4 py-2 text-sm text-white">
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-purple-700">342</p>
            <p className="text-sm text-slate-500">Public reports</p>
            <p className="mt-1 text-xs text-slate-400">This quarter</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-emerald-700">78%</p>
            <p className="text-sm text-slate-500">Resolved rate</p>
            <p className="mt-1 text-xs text-emerald-600">▲ 5% vs last quarter</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-yellow-600">41</p>
            <p className="text-sm text-slate-500">Under review</p>
            <p className="mt-1 text-xs text-slate-400">Avg. 4.2 days</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-red-600">12</p>
            <p className="text-sm text-slate-500">Escalated</p>
            <p className="mt-1 text-xs text-red-500">Council action required</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Public reports</h2>
              <span className="text-sm text-purple-700">View all →</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-slate-500">
                  <tr>
                    <th className="pb-2">ID</th>
                    <th className="pb-2">Issue</th>
                    <th className="pb-2">Location</th>
                    <th className="pb-2">Suburb</th>
                    <th className="pb-2">Submitted</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {reports.map((item) => (
                    <tr key={item[0]}>
                      <td className="py-3 font-medium">{item[0]}</td>
                      <td>{item[1]}</td>
                      <td>{item[2]}</td>
                      <td>{item[3]}</td>
                      <td className="text-slate-500">{item[4]}</td>
                      <td>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${chip(item[5])}`}>
                          {item[5]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold">Area accessibility index</h2>

              <div className="space-y-4">
                {areas.map(([name, value]) => (
                  <div key={name}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{name}</span>
                      <span>{value}%</span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-200">
                      <div
                        className={`h-2 rounded-full ${
                          value >= 80 ? "bg-emerald-700" : value >= 60 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold">Community activity</h2>

              <div className="grid grid-cols-2 gap-3 text-center text-sm">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-purple-700">1,204</p>
                  <p className="text-slate-500">Scans this month</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-purple-700">89</p>
                  <p className="text-slate-500">Contributors</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-emerald-700">28</p>
                  <p className="text-slate-500">Petition sigs</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-yellow-700">14</p>
                  <p className="text-slate-500">Open petitions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Recent report activity</h2>

            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Escalation — Broken lift at Flinders St Station</p>
                <p className="text-slate-500">High-traffic location · Council escalation triggered · 5d ago</p>
              </div>

              <div>
                <p className="font-medium">New petition — Accessible stop at Brunswick St</p>
                <p className="text-slate-500">28 of 50 signatures · Open for community support · 6d ago</p>
              </div>

              <div>
                <p className="font-medium">Resolved — Signage at St Kilda Rd / Domain</p>
                <p className="text-slate-500">Community reported · Fixed by PTV contractor · 1w ago</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Report type breakdown</h2>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-purple-50 p-4">
                <p className="text-2xl font-bold text-purple-700">149</p>
                <p className="text-slate-500">Infrastructure</p>
              </div>
              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-2xl font-bold text-red-600">88</p>
                <p className="text-slate-500">Safety</p>
              </div>
              <div className="rounded-xl bg-yellow-50 p-4">
                <p className="text-2xl font-bold text-yellow-600">60</p>
                <p className="text-slate-500">Signage</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-600">45</p>
                <p className="text-slate-500">Other</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}