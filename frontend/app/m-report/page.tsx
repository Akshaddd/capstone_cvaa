export default function UserReportMobilePage() {
  const findings = [
    ["Tactile ground surface", "Pass", "Compliant indicators at boarding zone"],
    ["Path of travel width", "Pass", "1,200mm clearance confirmed"],
    ["Accessible signage", "Warning", "Sign partially obstructed — review needed"],
    ["Platform gap clearance", "Failed", "Gap 82mm exceeds threshold"],
  ];

  const users = [
    ["Wheelchair users", "Not safe to board independently", "Gap exceeds threshold. Manual ramp assistance required.", "red"],
    ["Vision impairment", "Usable with caution", "Tactile indicators present. Sign partially blocked.", "yellow"],
    ["Mobility aids", "Accessible", "Compliant ramp and smooth surface.", "green"],
    ["Hearing impairment", "Visual info available", "Displays available. Audio optional.", "green"],
    ["Pram / stroller", "Boarding assistance needed", "Gap may require lifting or driver help.", "yellow"],
    ["Elderly passengers", "Generally accessible", "Smooth path, seating available.", "green"],
  ];

  const chip = (status: string) => {
    if (status === "Pass") return "bg-emerald-100 text-emerald-700";
    if (status === "Warning") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const box = (color: string) => {
    if (color === "green") return "border-emerald-200 bg-emerald-50";
    if (color === "yellow") return "border-yellow-200 bg-yellow-50";
    return "border-red-200 bg-red-50";
  };

  return (
    <main className="mx-auto min-h-screen max-w-sm bg-white text-slate-900 shadow-2xl">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-sm font-semibold text-emerald-700">9:41</span>
        <div className="flex gap-2">
          <div className="h-3 w-5 rounded bg-emerald-700"></div>
          <div className="h-3 w-6 rounded border border-emerald-700"></div>
        </div>
      </div>

      {/* Top Bar */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h1 className="text-sm font-semibold">RPT-2026-0341</h1>
          <p className="text-xs text-slate-500">Flinders St / Elizabeth St</p>
        </div>

        <button className="rounded-lg border px-3 py-2 text-xs">Share</button>
      </header>

      <div className="space-y-5 px-4 py-4">
        {/* Hero */}
        <section className="rounded-3xl bg-slate-50 p-4">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-700 text-xl font-bold text-emerald-700">
              72
            </div>

            <div>
              <h2 className="font-semibold">Flinders St / Elizabeth St</h2>
              <p className="text-xs text-slate-500">
                Routes 70, 75 · CBD · Melbourne
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Scanned today at 9:38 AM
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl bg-white p-3">
              <p className="text-lg font-bold text-emerald-700">4</p>
              <p className="text-slate-500">Passed</p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="text-lg font-bold text-yellow-600">2</p>
              <p className="text-slate-500">Warnings</p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="text-lg font-bold text-red-600">1</p>
              <p className="text-slate-500">Failed</p>
            </div>
          </div>
        </section>

        {/* Findings */}
        <section>
          <h3 className="mb-3 text-sm font-semibold">Technical findings</h3>

          <div className="space-y-3">
            {findings.map((item) => (
              <div
                key={item[0]}
                className="rounded-2xl border border-slate-200 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{item[0]}</p>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-semibold ${chip(
                      item[1]
                    )}`}
                  >
                    {item[1]}
                  </span>
                </div>

                <p className="text-xs text-slate-500">{item[2]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Accessibility */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Accessibility summary</h3>
            <span className="rounded-full bg-yellow-100 px-2 py-1 text-[10px] font-semibold text-yellow-700">
              Partial
            </span>
          </div>

          <div className="space-y-3">
            {users.map((item) => (
              <div
                key={item[0]}
                className={`rounded-2xl border p-3 ${box(item[3])}`}
              >
                <p className="text-sm font-medium">{item[0]}</p>
                <p className="mt-1 text-xs font-semibold">{item[1]}</p>
                <p className="mt-1 text-xs text-slate-600">{item[2]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-3 pb-6">
          <button className="w-full rounded-2xl bg-emerald-700 py-3 text-sm font-semibold text-white">
            Submit to PTV
          </button>

          <button className="w-full rounded-2xl bg-purple-700 py-3 text-sm font-semibold text-white">
            Submit to Council
          </button>

          <button className="w-full rounded-2xl border py-3 text-sm font-semibold">
            Save as Draft
          </button>
        </section>
      </div>

      {/* Bottom Nav */}
      <nav className="grid grid-cols-4 border-t bg-white py-3 text-center text-[11px]">
        <div className="text-slate-500">Map</div>
        <div className="text-slate-500">Scan</div>
        <div className="font-medium text-emerald-700">Reports</div>
        <div className="text-slate-500">Profile</div>
      </nav>
    </main>
  );
}