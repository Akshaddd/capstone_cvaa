"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const USERS: Record<string, string> = {
  "user@myaccess.com": "/m-home",
  "ptv@myaccess.com": "/m-ptv",
  "council@myaccess.com": "/m-council",
};

export default function MobileLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin() {
    const dest = USERS[email.trim().toLowerCase()];
    if (dest && password.length > 0) {
      router.push(dest);
    } else {
      setError("Invalid credentials. Please try again.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <section className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-200">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <span className="text-sm font-semibold text-emerald-700">9:41</span>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-5 rounded-sm bg-emerald-700" />
            <div className="h-2.5 w-6 rounded-sm border border-slate-300" />
          </div>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center px-8 pt-10 pb-4 text-center">
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
          <h1 className="mt-4 text-2xl font-bold text-slate-900">MyAccess</h1>
          <p className="mt-1 text-sm text-slate-500">Melbourne accessibility network</p>
        </div>

        {/* Form */}
        <div className="space-y-4 px-8 pb-10 pt-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wide">Email</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              type="email"
              placeholder="you@myaccess.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wide">Password</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
          )}

          <button
            onClick={handleLogin}
            className="w-full rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white shadow-sm transition active:opacity-80"
          >
            Sign in
          </button>

          <p className="text-center text-xs text-slate-400">
            No account?{" "}
            <span className="font-semibold text-emerald-700 cursor-pointer">Register</span>
          </p>
        </div>
      </section>
    </main>
  );
}