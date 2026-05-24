"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeProvider, ThemeToggle } from "../shared";

const ROLE_ROUTES: Record<string, string> = {
  "user@myaccess.com":    "/m-home",
  "ptv@myaccess.com":     "/m-ptv",
  "council@myaccess.com": "/m-council",
};

const QUICK_LOGINS = [
  { label: "User",    email: "user@myaccess.com"    },
  { label: "PTV",     email: "ptv@myaccess.com"     },
  { label: "Council", email: "council@myaccess.com" },
];

function LoginContent() {
  const [email, setEmail] = useState("user@myaccess.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);

  function handleSignIn() {
    const route = ROLE_ROUTES[email.trim().toLowerCase()];
    if (!route) {
      setError("Unknown email. Try user@myaccess.com, ptv@myaccess.com, or council@myaccess.com");
      return;
    }
    window.location.href = route;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-5 dark:bg-slate-950">

      <div className="absolute left-5 top-5">
        <Link href="/m-landing" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          ← Back
        </Link>
      </div>
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">

        {/* Logo */}
        <div className="flex flex-col items-center px-8 pt-12 pb-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-700 shadow-md">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="8" width="18" height="12" rx="2.5" fill="white" />
              <rect x="5" y="11" width="4" height="3" rx="0.8" fill="#047857" />
              <rect x="11" y="11" width="4" height="3" rx="0.8" fill="#047857" />
              <circle cx="7" cy="21" r="1.8" fill="white" />
              <circle cx="15" cy="21" r="1.8" fill="white" />
              <line x1="2" y1="21" x2="22" y2="21" stroke="white" strokeWidth="1.2" opacity=".5" />
              <circle cx="23" cy="7" r="4" fill="white" />
              <circle cx="23" cy="7" r="2" fill="#047857" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">MyAccess</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Melbourne accessibility network</p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4 px-8 pb-10">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            onClick={handleSignIn}
            className="block w-full rounded-xl bg-emerald-700 py-3.5 text-center text-sm font-bold text-white shadow-sm active:bg-emerald-800"
          >
            Sign in
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <p className="text-xs text-slate-400">quick sign in as</p>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {QUICK_LOGINS.map((q) => (
              <button
                key={q.label}
                onClick={() => { setEmail(q.email); setError(null); }}
                className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
                  email === q.email
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            No account?{" "}
            <Link href="/m-landing" className="font-semibold text-emerald-700 dark:text-emerald-500">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ThemeProvider>
      <LoginContent />
    </ThemeProvider>
  );
}
