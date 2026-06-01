"use client";

import { useState } from "react";


function getRouteForEmail(email: string) {
  const value = email.trim();

  if (value.endsWith("@council.com")) return "/d-council";
  if (value.endsWith("@compliance.com")) return "/d-ptv";
  if (value.endsWith("@operator.com")) return "/d-home";

  const exactRoutes: Record<string, string> = {
    "operator@myaccess.com": "/d-home",
    "compliance@myaccess.com": "/d-ptv",
    "ptv@myaccess.com": "/d-ptv",
    "council@myaccess.com": "/d-council",
  };

  return exactRoutes[value] ?? null;
}

export default function DesktopLoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");

  function handleSignIn() {
    const emailValue = email.trim();

    if (!emailValue || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    const route = getRouteForEmail(emailValue);

    if (!route) {
      setError("Use a valid role email ending with @operator.com, @compliance.com, or @council.com.");
      return;
    }

    const role = emailValue.endsWith("@council.com") || emailValue === "council@myaccess.com"
      ? "council"
      : emailValue.endsWith("@compliance.com") || emailValue === "compliance@myaccess.com" || emailValue === "ptv@myaccess.com"
        ? "compliance"
        : "operator";

    window.localStorage.setItem("myaccess_user_role", role);
    window.localStorage.setItem("myaccess_user_email", emailValue);
    window.location.href = route;
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSignIn();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">

      <header className="px-8 py-5">
        <a href="/d-landing" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-emerald-700 rounded-xl flex items-center justify-center text-white font-bold text-sm">M</div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">MyAccess</span>
        </a>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm px-8 py-10">

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Welcome back</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500">Sign in as an operator, compliance officer, or council reviewer</p>
          </div>

          <div className="flex flex-col gap-4">

            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              onKeyDown={handleKey}
              placeholder="Email"
              autoCapitalize="none"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-base text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-900 transition-colors placeholder:text-slate-400"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={handleKey}
              placeholder="Password"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-base text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-900 transition-colors placeholder:text-slate-400"
            />

            <div className="flex justify-end">
              <a href="#" className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                Forgot password?
              </a>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              onClick={handleSignIn}
              className="w-full bg-emerald-700 text-white font-semibold text-base py-3.5 rounded-full hover:bg-emerald-800 transition-colors mt-1"
            >
              Sign in
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-sm text-slate-400 dark:text-slate-500">or</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            <a
              href="/d-register"
              className="w-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-base py-3.5 rounded-full text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Create account
            </a>

          </div>
        </div>
      </div>

      <footer className="px-8 py-6">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-400 dark:text-slate-500 justify-center">
          <span>MyAccess &copy; {new Date().getFullYear()}</span>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="/d-landing" className="hover:underline">About</a>
        </div>
      </footer>

    </div>
  );
}