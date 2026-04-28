export default function ReportPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 p-6 hidden lg:flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
              M
            </div>
            <div>
              <p className="font-semibold">MyAccess</p>
              <p className="text-xs text-slate-500">Melbourne network</p>
            </div>
          </div>

          <nav className="space-y-2 text-sm">
            <p className="text-xs uppercase text-slate-400 mb-2">Navigate</p>
            <div className="rounded-xl px-3 py-2 hover:bg-slate-100 cursor-pointer">
              Accessibility map
            </div>
            <div className="rounded-xl px-3 py-2 hover:bg-slate-100 cursor-pointer">
              Scan stop
            </div>

            <p className="text-xs uppercase text-slate-400 mt-6 mb-2">My data</p>
            <div className="rounded-xl px-3 py-2 bg-emerald-50 text-emerald-700 font-medium">
              My reports
            </div>
            <div className="rounded-xl px-3 py-2 hover:bg-slate-100 cursor-pointer">
              History
            </div>

            <p className="text-xs uppercase text-slate-400 mt-6 mb-2">Account</p>
            <div className="rounded-xl px-3 py-2 hover:bg-slate-100 cursor-pointer">
              Settings
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-3 border-t pt-4">
          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-semibold">
            JD
          </div>
          <div>
            <p className="text-sm font-medium">J. Doe</p>
            <p className="text-xs text-slate-500">Public user</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <section className="flex-1 p-6 space-y-6">
        {/* Topbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm text-slate-500">
            Reports / <span className="text-slate-900">RPT-2026-0341</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button className="rounded-xl border px-4 py-2 text-sm">
              Share
            </button>
            <button className="rounded-xl border px-4 py-2 text-sm">
              Download PDF
            </button>
            <button className="rounded-xl bg-emerald-700 text-white px-4 py-2 text-sm">
              Submit to PTV
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
            <div className="flex gap-5 items-center">
              <div className="h-20 w-20 rounded-full border-8 border-emerald-700 flex items-center justify-center text-xl font-bold text-emerald-700">
                72
              </div>

              <div>
                <h1 className="text-xl font-bold">
                  Flinders St / Elizabeth St — Stop 1
                </h1>
                <p className="text-sm text-slate-500">
                  Routes 70, 75 · CBD · Melbourne
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Scanned by J. Doe · Today 9:38 AM
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-700">4</p>
                <p className="text-xs text-slate-500">Passed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">2</p>
                <p className="text-xs text-slate-500">Warnings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">1</p>
                <p className="text-xs text-slate-500">Failed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid xl:grid-cols-3 gap-6">
          {/* Left */}
          <div className="xl:col-span-2 space-y-6">
            {/* Findings */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="font-semibold mb-4">Technical findings</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500 border-b">
                    <tr>
                      <th className="pb-2">Check</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Notes</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    <tr>
                      <td className="py-3">Tactile surface</td>
                      <td className="text-emerald-700 font-medium">Pass</td>
                      <td>Compliant indicators</td>
                    </tr>
                    <tr>
                      <td className="py-3">Signage visibility</td>
                      <td className="text-amber-600 font-medium">Warning</td>
                      <td>Partially obstructed</td>
                    </tr>
                    <tr>
                      <td className="py-3">Platform gap</td>
                      <td className="text-red-600 font-medium">Failed</td>
                      <td>82mm exceeds threshold</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Accessibility */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="font-semibold mb-4">Accessibility summary</h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-2xl border p-4">
                  <p className="font-medium">Wheelchair</p>
                  <p className="text-sm text-red-600 mt-1">Not safe</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Platform gap too wide
                  </p>
                </div>

                <div className="rounded-2xl border p-4">
                  <p className="font-medium">Vision</p>
                  <p className="text-sm text-amber-600 mt-1">With caution</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Sign partially blocked
                  </p>
                </div>

                <div className="rounded-2xl border p-4">
                  <p className="font-medium">Mobility aids</p>
                  <p className="text-sm text-emerald-700 mt-1">Accessible</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Ramp and path compliant
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Score */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="font-semibold mb-4">Accessibility score</h2>

              <div className="space-y-4 text-sm">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Overall</span>
                    <span>72%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className="h-2 w-[72%] rounded-full bg-emerald-700"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Physical access</span>
                    <span>85%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className="h-2 w-[85%] rounded-full bg-emerald-700"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="font-semibold mb-4">Recommended actions</h2>

              <ul className="space-y-3 text-sm text-slate-600">
                <li>• Urgent: Repair platform gap</li>
                <li>• Review signage obstruction</li>
                <li>• Clear overhead branch</li>
              </ul>
            </div>

            {/* Submit */}
            <div className="rounded-3xl bg-white p-6 shadow-sm space-y-3">
              <button className="w-full rounded-xl bg-emerald-700 py-3 text-white font-medium">
                Submit to PTV
              </button>

              <button className="w-full rounded-xl border py-3 font-medium">
                Save Draft
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}