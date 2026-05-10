export default function UserScanMobilePage() {
  const checklist: [string, string, boolean][] = [
    ["Tactile ground surface", "Photo of the boarding zone floor", true],
    ["Kerb ramp", "Full ramp including gradient", false],
    ["Accessible signage", "Stop sign and route info boards", false],
    ["Platform edge / gap", "Close-up of boarding gap", false],
    ["Path of travel", "Approach from footpath to stop", false],
  ];

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

      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h1 className="text-sm font-semibold">Scan stop</h1>
          <p className="text-xs text-slate-500">Upload photos to analyse</p>
        </div>

        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
          2/6 photos
        </span>
      </header>

      <div className="space-y-4 px-4 py-4">
        {/* Upload Box */}
        <section className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-4">
          <div className="mb-4 flex gap-2">
            <div className="relative flex h-12 w-16 items-center justify-center rounded-lg bg-emerald-700 text-[9px] text-white">
              stop-front.jpg
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">
                ×
              </span>
            </div>

            <div className="relative flex h-12 w-16 items-center justify-center rounded-lg bg-sky-500 text-[9px] text-white">
              tactile.jpg
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">
                ×
              </span>
            </div>

            <div className="flex h-12 w-16 items-center justify-center rounded-lg border border-dashed text-xl text-slate-400">
              +
            </div>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-xl text-emerald-700">
              ↑
            </div>

            <h2 className="text-sm font-semibold">Drop photos here</h2>
            <p className="mt-1 text-xs text-slate-500">
              Or tap Browse to add photos
            </p>

            <button className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">
              Browse files
            </button>

            <div className="mt-4 flex justify-center gap-2 text-[10px] text-slate-500">
              <span className="rounded bg-white px-2 py-1">JPG</span>
              <span className="rounded bg-white px-2 py-1">PNG</span>
              <span className="rounded bg-white px-2 py-1">HEIC</span>
              <span className="px-2 py-1">≤20MB</span>
            </div>
          </div>
        </section>

        {/* Selected Stop */}
        <section className="rounded-2xl bg-emerald-50 p-3">
          <p className="text-sm font-semibold">Flinders St / Elizabeth St</p>
          <p className="text-xs text-slate-500">
            Stop 1 · Routes 70, 75 · CBD
          </p>

          <span className="mt-2 inline-block rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-emerald-700">
            Selected stop
          </span>
        </section>

        {/* Checklist */}
        <section>
          <h3 className="mb-3 text-sm font-semibold">What to photograph</h3>

          <div className="space-y-3">
            {checklist.map((item) => (
              <div
                key={item[0]}
                className="flex gap-3 rounded-2xl border border-slate-200 p-3"
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md text-xs ${
                    item[2]
                      ? "bg-emerald-700 text-white"
                      : "border border-slate-300 bg-white"
                  }`}
                >
                  {item[2] ? "✓" : ""}
                </div>

                <div>
                  <p className="text-sm font-medium">{item[0]}</p>
                  <p className="text-xs text-slate-500">{item[1]}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Button */}
        <section className="space-y-2 pb-6">
          <button className="w-full rounded-2xl bg-emerald-700 py-3 text-sm font-semibold text-white">
            Analyse photos
          </button>

          <p className="text-center text-xs text-slate-500">
            AI checks all 5 accessibility criteria
          </p>
        </section>
      </div>

      {/* Bottom Nav */}
      <nav className="grid grid-cols-4 border-t bg-white py-3 text-center text-[11px]">
        <div className="text-slate-500">Map</div>
        <div className="font-medium text-emerald-700">Scan</div>
        <div className="text-slate-500">Reports</div>
        <div className="text-slate-500">Profile</div>
      </nav>
    </main>
  );
}