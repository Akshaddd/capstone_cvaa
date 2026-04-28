export default function MHomePage() {
  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900">
      <div className="mx-auto max-w-sm rounded-3xl bg-white p-5 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Good morning</p>
            <h1 className="text-xl font-bold">MyAccess</h1>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 font-bold text-white">
            M
          </div>
        </div>

        <div className="rounded-2xl bg-emerald-700 p-5 text-white">
          <p className="text-sm opacity-90">Accessibility Score Nearby</p>
          <p className="mt-2 text-4xl font-bold">87%</p>
          <p className="mt-1 text-sm opacity-80">3 stops within 500m</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button className="rounded-2xl bg-slate-100 p-4 text-left">
            <p className="text-lg font-semibold">Scan</p>
            <p className="text-xs text-slate-500">Check a stop</p>
          </button>

          <button className="rounded-2xl bg-slate-100 p-4 text-left">
            <p className="text-lg font-semibold">Map</p>
            <p className="text-xs text-slate-500">Nearby routes</p>
          </button>

          <button className="rounded-2xl bg-slate-100 p-4 text-left">
            <p className="text-lg font-semibold">Report</p>
            <p className="text-xs text-slate-500">Submit issue</p>
          </button>

          <button className="rounded-2xl bg-slate-100 p-4 text-left">
            <p className="text-lg font-semibold">Saved</p>
            <p className="text-xs text-slate-500">Favourite stops</p>
          </button>
        </div>

        <div className="mt-5 rounded-2xl border p-4">
          <p className="text-sm font-semibold">Next Route</p>
          <p className="mt-1 text-slate-600">Tram 86 • 6 mins</p>
          <p className="text-xs text-slate-400">Accessible boarding available</p>
        </div>
      </div>
    </main>
  );
}