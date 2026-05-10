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
      setError("Try user@, ptv@ or council@ @myaccess.com with any password");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-sm overflow-hidden rounded-[32px] bg-white shadow-2xl">
        {/* Status bar */}
        <div className="flex items-center justify-between bg-white px-6 py-3">
          <span className="text-sm font-semibold text-emerald-700">9:41</span>
          <div className="flex gap-2">
            <div className="h-3 w-5 rounded bg-emerald-700" />
            <div className="h-3 w-6 rounded border border-emerald-700" />
          </div>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center px-8 pt-10 pb-2 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-700 shadow-lg">
            <svg width="36" height="36" viewBox="0 0 34 34" fill="none">
              <rect x="5" y="9" width="20" height="14" rx="3" fill="white" />
              <rect x="8" y="12" width="5" height="4" rx="1" fill="#0D7A5F" />
              <rect x="15" y="12" width="5" height="4" rx="1" fill="#0D7A5F" />
              <circle cx="10" cy="24" r="2" fill="white" />
              <circle cx="20" cy="24" r="2" fill="white" />
              <line x1="4" y1="24" x2="26" y2="24" stroke="white" strokeWidth="1.5" opacity=".5" />
              <circle cx="27" cy="9" r="5" fill="white" />
              <circle cx="27" cy="9" r="2.5" fill="#0D7A5F" />
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">MyAccess</h1>
          <p className="mt-1 text-sm text-slate-500">Melbourne accessibility network</p>
        </div>

        {/* Form */}
        <div className="space-y-4 px-8 pb-10 pt-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
            <input
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
              type="email"
              placeholder="you@myaccess.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <input
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

          <button
            onClick={handleLogin}
            className="w-full rounded-2xl bg-emerald-700 py-3.5 font-semibold text-white shadow-md active:opacity-80 transition-opacity"
          >
            Continue
          </button>

          <p className="text-center text-sm text-slate-500">
            No account?{" "}
            <span className="font-medium text-emerald-700 cursor-pointer">Create one for free</span>
          </p>
        </div>
      </section>
    </main>
  );
}