export default function MobileLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="h-[760px] w-[390px] overflow-hidden rounded-[36px] border border-slate-300 bg-white shadow-2xl">
        {/* Status bar */}
        <div className="flex items-center justify-between bg-white px-6 py-3">
          <span className="text-sm font-semibold text-emerald-700">9:41</span>

          <div className="flex items-center gap-2">
            <svg width="16" height="11" viewBox="0 0 16 11" fill="#0D7A5F">
              <rect x="0" y="3" width="3" height="8" rx="1" />
              <rect x="4.5" y="2" width="3" height="9" rx="1" />
              <rect x="9" y="0" width="3" height="11" rx="1" />
              <rect x="13.5" y="1" width="2.5" height="10" rx="1" opacity=".3" />
            </svg>

            <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
              <rect
                x=".5"
                y=".5"
                width="21"
                height="11"
                rx="3.5"
                stroke="#0D7A5F"
                strokeOpacity=".35"
              />
              <rect x="2" y="2" width="16" height="8" rx="2" fill="#0D7A5F" />
              <path d="M23 4.5v3a1.5 1.5 0 000-3z" fill="#0D7A5F" opacity=".4" />
            </svg>
          </div>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center px-8 pt-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-700 shadow-lg">
            <svg width="30" height="30" viewBox="0 0 34 34" fill="none">
              <rect x="5" y="9" width="20" height="14" rx="3" fill="white" />
              <rect x="8" y="12" width="5" height="4" rx="1" fill="#0D7A5F" />
              <rect x="15" y="12" width="5" height="4" rx="1" fill="#0D7A5F" />
              <circle cx="10" cy="24" r="2" fill="white" />
              <circle cx="20" cy="24" r="2" fill="white" />
              <line
                x1="4"
                y1="24"
                x2="26"
                y2="24"
                stroke="white"
                strokeWidth="1.5"
                opacity=".5"
              />
              <circle cx="27" cy="9" r="5" fill="white" />
              <circle cx="27" cy="9" r="2.5" fill="#0D7A5F" />
            </svg>
          </div>

          <h1 className="mt-5 text-3xl font-bold text-slate-900">MyAccess</h1>
          <p className="mt-2 text-sm text-slate-500">
            Melbourne accessibility network
          </p>
        </div>

        {/* Form */}
        <div className="mt-16 space-y-5 px-8">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-700"
              type="email"
              placeholder="you@example.com"
              readOnly
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-700"
              type="password"
              placeholder="••••••••"
              readOnly
            />
            <p className="mt-2 text-right text-sm text-emerald-700">
              Forgot password?
            </p>
          </div>

          <button className="w-full rounded-2xl bg-emerald-700 py-3 font-semibold text-white shadow-md">
            Continue
          </button>

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