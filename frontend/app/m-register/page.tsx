"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");

  function handleRegister() {
    if (!name.trim())          { setError("Please enter your name.");             return; }
    if (!email.trim())         { setError("Please enter your email.");            return; }
    if (password.length < 8)   { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm)  { setError("Passwords do not match.");             return; }
    // In production this would hit the auth endpoint
    window.location.href = "/m-home";
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-5">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">

        {/* Logo */}
        <div className="flex flex-col items-center px-8 pt-12 pb-6 text-center">
          <div className="w-16 h-16 bg-emerald-700 rounded-2xl flex items-center justify-center shadow-md">
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
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Create account</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Join the MyAccess community</p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4 px-8 pb-10">

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="Jane Smith"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Min. 8 characters"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(""); }}
              placeholder="Repeat password"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-slate-900 dark:text-white outline-none focus:border-emerald-600"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            onClick={handleRegister}
            className="w-full bg-emerald-700 text-white font-bold text-base py-4 rounded-xl mt-1 active:bg-emerald-800"
          >
            Create account
          </button>

          <p className="text-center text-sm text-slate-400 dark:text-slate-500">
            Already have an account?{" "}
            <a href="/m-login" className="text-emerald-700 dark:text-emerald-400 font-semibold">
              Sign in
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}