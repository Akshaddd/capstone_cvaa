export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white font-bold">
            M
          </div>
          <span className="text-xl font-semibold">MyAccess</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
          <a href="#">About</a>
          <a href="#">How it works</a>
          <a href="#">Contact</a>
          <a
            href="#"
            className="rounded-xl bg-emerald-700 px-4 py-2 text-white font-medium"
          >
            Sign up free
          </a>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        <div>
          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            Melbourne public transport
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
            Make every stop accessible for everyone
          </h1>

          <p className="mt-5 max-w-xl text-lg text-slate-600">
            Scan, report, and track accessibility features at tram stops across
            Melbourne. Built for riders, PTV staff, and local councils.
          </p>

          <div className="mt-8 space-y-4 text-slate-700">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-700"></div>
              <span>Scan stops and get instant accessibility scores</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-700"></div>
              <span>View the accessibility map for your route</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-700"></div>
              <span>Submit reports directly to PTV and council</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-700"></div>
              <span>Real-time data for operators and administrators</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl md:p-10">
          <h2 className="text-3xl font-bold">Welcome back</h2>
          <p className="mt-2 text-slate-500">
            Sign in to your MyAccess account
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
              />
              <p className="mt-2 text-right text-sm text-emerald-700">
                Forgot password?
              </p>
            </div>

            <button className="w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white">
              Continue
            </button>
          </div>

          <div className="my-6 h-px bg-slate-200"></div>

          <p className="text-center text-sm text-slate-500">
            No account?{" "}
            <a href="#" className="font-medium text-emerald-700">
              Create one for free
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}