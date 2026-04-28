export default function PtvDashboardPage() {
  const maintenance = [
    ["#14", "Swanston St / Bourke St", "Platform gap — 82mm", "2h ago", "Critical"],
    ["#27", "Collins St / Spencer St", "Tactile surface wear", "Yesterday", "In progress"],
    ["#3", "Flinders St / Elizabeth St", "Signage obstruction", "3 days ago", "Scheduled"],
    ["#89", "Chapel St / Toorak Rd", "Kerb ramp damage", "4 days ago", "Resolved"],
    ["#52", "St Kilda Rd / Domain Rd", "Audio system fault", "5 days ago", "In progress"],
  ];

  const routes: [string, number][] = [
    ["Route 70", 96],
    ["Route 86", 88],
    ["Route 48", 79],
    ["Route 11", 71],
    ["Route 12", 58],
  ];

  const chip = (status: string) => {
    if (status === "Critical") return "bg-red-100 text-red-700";
    if (status === "Resolved") return "bg-emerald-100 text-emerald-700";
    if (status === "Scheduled") return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <main className="flex min-h-screen bg-slate-100 text-slate-900">
      {/* Sidebar */}
      <aside className="hidden w-72 border-r bg-white p-6 lg:flex lg:flex-col">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 font-bold text-white">
            M
          </div>
          <div>
            <p className="font-semibold">MyAccess</p>
            <p className="text-xs text-slate-500">PTV Operations</p>
          </div>
        </div>

        <nav className="space-y-2 text-sm">
          <p className="text-xs uppercase text-slate-400">Overview</p>
          <div className="rounded-xl bg-emerald-50 px-3 py-2 font-medium text-emerald-700">
            Dashboard
          </div>
          <div className="rounded-xl px-3 py-2 text-slate-600">Network map</div>

          <p className="pt-5 text-xs uppercase text-slate-400">Reports</p>
          <div className="rounded-xl px-3 py-2 text-slate-600">
            Maintenance
          </div>
          <div className="rounded-xl px-3 py-2 text-slate-600">
            Compliance
          </div>
          <div className="rounded-xl px-3 py-2 text-slate-600">
            Photo reports
          </div>

          <p className="pt-5 text-xs uppercase text-slate-400">Assets</p>
          <div className="rounded-xl px-3 py-2 text-slate-600">
            Stop inventory
          </div>
          <div className="rounded-xl px-3 py-2 text-slate-600">
            Asset status
          </div>
        </nav>

        <div className="mt-auto flex items-center gap-3 border-t pt-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-semibold">
            PK
          </div>
          <div>
            <p className="text-sm font-medium">Priya Kapoor</p>
            <p className="text-xs text-slate-500">Network Ops Manager</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <section className="flex-1 p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Network Dashboard</h1>
            <p className="text-sm text-slate-500">
              Melbourne tram — live overview
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="rounded-xl border px-4 py-2 text-sm">
              Export report
            </button>
            <button className="rounded-xl bg-emerald-700 px-4 py-2 text-sm text-white">
              New job
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-blue-700">148</p>
            <p className="text-sm text-slate-500">Total stops</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-emerald-700">91%</p>
            <p className="text-sm text-slate-500">Compliance rate</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-yellow-600">23</p>
            <p className="text-sm text-slate-500">Pending maintenance</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-red-600">7</p>
            <p className="text-sm text-slate-500">Critical flags</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {/* Table */}
          <div className="xl:col-span-2 rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Maintenance reports</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-slate-500">
                  <tr>
                    <th className="pb-2">Stop</th>
                    <th className="pb-2">Location</th>
                    <th className="pb-2">Issue</th>
                    <th className="pb-2">Reported</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {maintenance.map((item) => (
                    <tr key={item[0]}>
                      <td className="py-3 font-medium">{item[0]}</td>
                      <td>{item[1]}</td>
                      <td>{item[2]}</td>
                      <td className="text-slate-500">{item[3]}</td>
                      <td>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${chip(
                            item[4]
                          )}`}
                        >
                          {item[4]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right side */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold">Compliance by route</h2>

              <div className="space-y-4">
                {routes.map(([name, value]) => (
                  <div key={name}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{name}</span>
                      <span>{value}%</span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-200">
                      <div
                        className={`h-2 rounded-full ${
                          value >= 85
                            ? "bg-emerald-700"
                            : value >= 70
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold">Issue breakdown</h2>

              <div className="space-y-4 text-sm">
                <div>
                  <div className="mb-1 flex justify-between">
                    <span>Platform gaps</span>
                    <span>43%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className="h-2 w-[43%] rounded-full bg-red-400"></div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between">
                    <span>Tactile wear</span>
                    <span>28%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className="h-2 w-[28%] rounded-full bg-yellow-400"></div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between">
                    <span>Signage</span>
                    <span>18%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className="h-2 w-[18%] rounded-full bg-blue-400"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}