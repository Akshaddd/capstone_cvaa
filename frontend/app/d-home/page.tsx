export default function MapPage() {
  const stops = [
    ["Flinders St / Elizabeth St", "Accessible", "Stop 1 · Routes 70, 75 · 120m away"],
    ["Flinders St / Swanston St", "Partial", "Stop 2 · Routes 70, 75, 86 · 180m"],
    ["Collins St / Spencer St", "Issues", "Stop 4 · Routes 11, 12, 48 · 240m"],
    ["Bourke St Mall / Elizabeth", "Accessible", "Stop 6 · Routes 86, 96 · 300m"],
    ["Spencer St / Collins St", "Partial", "Stop 8 · Routes 48, 109 · 380m"],
    ["William St / Bourke St", "Accessible", "Stop 9 · Routes 55, 57 · 450m"],
  ];

  const getChipStyle = (status: string) => {
    if (status === "Accessible") return "bg-emerald-100 text-emerald-700";
    if (status === "Partial") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <main className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside className="flex w-72 flex-col border-r border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 font-bold text-white">
            M
          </div>
          <div>
            <div className="font-semibold">MyAccess</div>
            <div className="text-xs text-slate-500">Melbourne network</div>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          <p className="px-3 text-xs font-semibold uppercase text-slate-400">
            Navigate
          </p>
          <div className="rounded-xl bg-emerald-50 px-3 py-3 font-medium text-emerald-700">
            Accessibility map
          </div>
          <div className="rounded-xl px-3 py-3 text-slate-600">Scan stop</div>

          <p className="px-3 pt-5 text-xs font-semibold uppercase text-slate-400">
            My data
          </p>
          <div className="rounded-xl px-3 py-3 text-slate-600">My reports</div>
          <div className="rounded-xl px-3 py-3 text-slate-600">History</div>

          <p className="px-3 pt-5 text-xs font-semibold uppercase text-slate-400">
            Account
          </p>
          <div className="rounded-xl px-3 py-3 text-slate-600">Settings</div>
        </nav>

        <div className="mt-auto flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-300 text-sm font-bold">
            JD
          </div>
          <div>
            <div className="text-sm font-semibold">J. Doe</div>
            <div className="text-xs text-slate-500">Public user</div>
          </div>
          <div className="ml-auto h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </div>
      </aside>

      <section className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">Accessibility map</h1>
            <p className="text-sm text-slate-500">Melbourne tram network</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              className="w-52 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-emerald-700"
              placeholder="Search stops..."
            />
            <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium">
              Filter
            </button>
          </div>
        </header>

        <div className="grid flex-1 grid-cols-[360px_1fr] overflow-hidden">
          <aside className="border-r border-slate-200 bg-white p-5">
            <div>
              <h2 className="font-bold">Nearby stops</h2>
              <p className="text-sm text-slate-500">6 stops within 500m</p>
            </div>

            <input
              className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700"
              placeholder="Search stops, routes..."
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {["All", "Accessible", "Partial", "Issues"].map((item) => (
                <button
                  key={item}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    item === "All"
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {stops.map(([name, status, detail], index) => (
                <div
                  key={name}
                  className={`rounded-2xl border p-4 ${
                    index === 0
                      ? "border-emerald-700 bg-emerald-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-semibold">{name}</span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${getChipStyle(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{detail}</p>
                </div>
              ))}
            </div>

            <button className="mt-5 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white">
              Start scan at Flinders St
            </button>
          </aside>

          <section className="relative bg-[#d6e8dc]">
            <svg
              className="h-full w-full"
              viewBox="0 0 900 600"
              preserveAspectRatio="xMidYMid slice"
            >
              <rect width="900" height="600" fill="#d6e8dc" />
              <path
                d="M0 480 Q100 462 200 474 Q320 488 440 466 Q560 444 680 454 Q780 462 900 456 L900 600 L0 600Z"
                fill="#b2cfe8"
              />
              <ellipse cx="680" cy="140" rx="90" ry="55" fill="#b8d8b8" />
              <ellipse cx="130" cy="250" rx="55" ry="38" fill="#b8d8b8" />

              {[150, 300, 450].map((y) => (
                <line key={y} x1="0" y1={y} x2="900" y2={y} stroke="#c0d8c8" />
              ))}
              {[225, 450, 675].map((x) => (
                <line key={x} x1={x} y1="0" x2={x} y2="600" stroke="#c0d8c8" />
              ))}

              <line x1="450" y1="0" x2="450" y2="600" stroke="#b0c8b8" strokeWidth="2.5" />
              <line x1="0" y1="310" x2="900" y2="310" stroke="#b0c8b8" strokeWidth="2.5" />
              <line x1="0" y1="280" x2="900" y2="280" stroke="#bcd0c4" strokeWidth="1.8" />
              <line x1="0" y1="250" x2="900" y2="250" stroke="#bcd0c4" strokeWidth="1.8" />

              <polyline points="20,270 450,270 595,175 840,138" fill="none" stroke="#2980B9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity=".85" />
              <polyline points="20,318 450,318 660,318 880,318" fill="none" stroke="#8E44AD" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity=".85" />
              <polyline points="300,40 370,175 450,270 450,318 456,498" fill="none" stroke="#27AE60" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity=".85" />
              <polyline points="55,408 450,318 690,368 870,382" fill="none" stroke="#E67E22" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity=".85" />

              <text x="325" y="288" textAnchor="middle" fill="#3a6050" fontSize="13" fontWeight="600">
                CBD
              </text>
              <text x="100" y="230" fill="#7a9a88" fontSize="11">WEST MELBOURNE</text>
              <text x="465" y="175" fill="#7a9a88" fontSize="11">CARLTON</text>
              <text x="690" y="230" fill="#7a9a88" fontSize="11">FITZROY</text>
              <text x="465" y="400" fill="#7a9a88" fontSize="11">SOUTH MELBOURNE</text>
              <text x="692" y="400" fill="#7a9a88" fontSize="11">RICHMOND</text>

              <circle cx="450" cy="290" r="18" fill="#0D7A5F" />
              <circle cx="450" cy="290" r="7" fill="#fff" />
              <circle cx="450" cy="290" r="26" fill="none" stroke="#0D7A5F" strokeWidth="2.5" opacity=".3" />

              <circle cx="595" cy="175" r="13" fill="#0D7A5F" />
              <circle cx="595" cy="175" r="5" fill="#fff" />
              <circle cx="370" cy="175" r="12" fill="#0D7A5F" />
              <circle cx="370" cy="175" r="4.5" fill="#fff" />

              <circle cx="755" cy="318" r="13" fill="#E8CF27" />
              <circle cx="755" cy="318" r="5" fill="#3a3000" />
              <circle cx="300" cy="40" r="11" fill="#E8CF27" />
              <circle cx="300" cy="40" r="4.5" fill="#3a3000" />

              <circle cx="100" cy="400" r="14" fill="#D94040" />
              <line x1="96" y1="396" x2="104" y2="404" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <line x1="104" y1="396" x2="96" y2="404" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>

            <div className="absolute right-5 top-5 overflow-hidden rounded-xl bg-white shadow-lg">
              <button className="block h-10 w-10 border-b border-slate-200 text-xl font-bold">+</button>
              <button className="block h-10 w-10 text-xl font-bold">−</button>
            </div>

            <div className="absolute bottom-5 right-5 w-64 rounded-2xl bg-white p-4 shadow-xl">
              <h3 className="font-bold">Accessibility status</h3>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-700" />
                  <span className="flex-1">Fully accessible</span>
                  <strong>118</strong>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="flex-1">Partial access</span>
                  <strong>23</strong>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="flex-1">Has issues</span>
                  <strong>7</strong>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}