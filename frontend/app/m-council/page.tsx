export default function CouncilMobilePage() {
  const reports = [
    {
      title: "Broken kerb ramp",
      meta: "Chapel St / Commercial Rd · Stonnington · 1 day ago",
      status: "Active",
    },
    {
      title: "Missing tactile strip",
      meta: "Bourke St Mall / Swanston · CBD · 3 days ago",
      status: "Review",
    },
    {
      title: "No accessible path to stop",
      meta: "Smith St / Johnston St · Fitzroy · 4 days ago",
      status: "Review",
    },
    {
      title: "Broken lift — Flinders St Station",
      meta: "CBD · 5 days ago · Council action required",
      status: "Escalated",
    },
    {
      title: "New petition: Brunswick St stop",
      meta: "Fitzroy · 6 days ago · Open for community support",
      status: "28/50",
    },
  ];

  const areas: [string, number][] = [
    ["CBD", 88],
    ["Carlton", 82],
    ["Fitzroy", 71],
    ["Richmond", 68],
    ["Footscray", 48],
  ];

  const chip = (status: string) => {
    if (status === "Active") return "bg-emerald-100 text-emerald-700";
    if (status === "Review") return "bg-yellow-100 text-yellow-700";
    if (status === "Escalated") return "bg-red-100 text-red-700";
    return "bg-purple-100 text-purple-700";
  };

  return (
    <main className="mx-auto min-h-screen max-w-sm bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 px-4 pt-4 pb-3">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold">Public Reports</h1>
            <p className="text-xs text-slate-400">City of Melbourne</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800">
              🔔
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-700 text-xs font-bold">
              SR
            </div>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto text-sm">
          <span className="border-b-2 border-purple-500 pb-2 text-purple-300">
            Reports
          </span>
          <span className="pb-2 text-slate-500">Area index</span>
          <span className="pb-2 text-slate-500">Community</span>
          <span className="pb-2 text-slate-500">Insights</span>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 p-4">
        <div className="rounded-2xl bg-slate-900 p-4">
          <p className="text-2xl font-bold text-purple-400">342</p>
          <p className="text-xs text-slate-400">Public reports</p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-4">
          <p className="text-2xl font-bold text-emerald-400">78%</p>
          <p className="text-xs text-slate-400">Resolved</p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-4">
          <p className="text-2xl font-bold text-yellow-400">41</p>
          <p className="text-xs text-slate-400">Under review</p>
        </div>

        <div className="rounded-2xl bg-slate-900 p-4">
          <p className="text-2xl font-bold text-red-400">12</p>
          <p className="text-xs text-slate-400">Escalated</p>
        </div>
      </section>

      {/* Reports */}
      <section className="space-y-3 px-4">
        <h2 className="text-sm font-semibold text-slate-300">Active reports</h2>

        {reports.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{item.title}</p>
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-semibold ${chip(
                  item.status
                )}`}
              >
                {item.status}
              </span>
            </div>

            <p className="text-xs text-slate-400">{item.meta}</p>
          </div>
        ))}
      </section>

      {/* Area Index */}
      <section className="px-4 py-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-300">
          Area accessibility index
        </h2>

        <div className="space-y-4 rounded-2xl bg-slate-900 p-4">
          {areas.map(([name, value]) => (
            <div key={name}>
              <div className="mb-1 flex justify-between text-xs">
                <span>{name}</span>
                <span>{value}%</span>
              </div>

              <div className="h-2 rounded-full bg-slate-700">
                <div
                  className={`h-2 rounded-full ${
                    value >= 80
                      ? "bg-emerald-500"
                      : value >= 60
                      ? "bg-yellow-400"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Nav */}
      <nav className="sticky bottom-0 grid grid-cols-4 border-t border-slate-800 bg-slate-900 py-3 text-center text-[11px]">
        <div className="text-slate-500">Home</div>
        <div className="font-medium text-purple-300">Reports</div>
        <div className="text-slate-500">Insights</div>
        <div className="text-slate-500">Profile</div>
      </nav>
    </main>
  );
}