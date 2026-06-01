"use client";

import { useState } from "react";
import { ThemeToggle } from "../shared-desktop";

export default function DesktopRegisterPage() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");

  function handleRegister() {
    if (!name.trim())         { setError("Please enter your name.");                  return; }
    if (!email.trim())        { setError("Please enter your email.");                 return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm)  { setError("Passwords do not match.");                 return; }
    window.location.href = "/d-home";
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      <header className="flex items-center justify-between px-8 py-5">
        <a href="/d-landing" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-700 rounded-xl flex items-center justify-center text-white font-bold text-sm">M</div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">MyAccess</span>
        </a>
        <ThemeToggle />
      </header>

      <div className="flex min-h-[calc(100vh-80px)]">

        <div className="hidden lg:flex flex-1 bg-emerald-700 flex-col justify-center p-16">
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Join the MyAccess community
          </h1>
          <p className="text-emerald-100 text-lg leading-relaxed mb-8">
            Help make Melbourne public transport accessible for everyone. Scan stops, submit reports, and track improvements in your area.
          </p>
          <div className="flex flex-col gap-3">
            {[
              "Free to use, always",
              "Scan stops with your phone",
              "Reports submitted directly to PTV and council",
              "Track accessibility improvements in your area",
            ].map((point) => (
              <div key={point} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <p className="text-emerald-100 text-sm">{point}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Create account</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">Join MyAccess for free</p>

            <div className="flex flex-col gap-4">
              {[
                { label: "Full name",         val: name,     set: setName,     type: "text",     placeholder: "Jane Smith"          },
                { label: "Email",             val: email,    set: setEmail,    type: "text",     placeholder: "you@example.com"     },
                { label: "Password",          val: password, set: setPassword, type: "password", placeholder: "Min. 8 characters"   },
                { label: "Confirm password",  val: confirm,  set: setConfirm,  type: "password", placeholder: "Repeat password"     },
              ].map(({ label, val, set, type, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={val}
                    onChange={(e) => { set(e.target.value); setError(""); }}
                    placeholder={placeholder}
                    autoCapitalize="none"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                  />
                </div>
              ))}

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                onClick={handleRegister}
                className="w-full bg-emerald-700 text-white font-semibold py-3 rounded-xl hover:bg-emerald-800 mt-1"
              >
                Create account
              </button>

              <p className="text-center text-sm text-slate-400 dark:text-slate-500">
                Already have an account?{" "}
                <a href="/d-login" className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}