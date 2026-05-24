/**
 * shared.tsx — Shared components used across all mobile pages
 *
 * ThemeProvider  — wraps the app, reads/writes dark mode preference
 * BottomNav      — 4-item nav bar with active state
 * PageShell      — header + scrollable body + bottom nav
 * ThemeToggle    — sun/moon button for dark/light mode
 */

"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState } from "react";

// ─── Theme context ────────────────────────────────────────────────────────────

type Theme = "light" | "dark";

const ThemeCtx = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "light", toggle: () => {} });

export function useTheme() {
  return useContext(ThemeCtx);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Read saved preference or system preference
    const saved = localStorage.getItem("theme") as Theme | null;
    const sys = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initial = saved ?? sys;
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  function toggle() {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

// ─── Theme toggle button ─────────────────────────────────────────────────────

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
    >
      {theme === "dark" ? (
        // Sun icon
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        // Moon icon
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

// ─── Bottom nav ───────────────────────────────────────────────────────────────

export type NavItem = { label: string; href: string };

export function BottomNav({
  items,
  active,
}: {
  items: NavItem[];
  active: string;
}) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 grid border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      style={{
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {items.map((n) => (
        <Link
          key={n.label}
          href={n.href}
          className={`py-3 text-center text-[11px] font-semibold transition-colors ${
            n.href === active
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-slate-400 dark:text-slate-500"
          }`}
        >
          {n.label}
        </Link>
      ))}
    </nav>
  );
}