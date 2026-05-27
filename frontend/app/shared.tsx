"use client";

import { useEffect, useState } from "react";

// ── Theme hook ────────────────────────────────────────────────────────────────

export function useTheme() {
  // Initialize directly from the DOM — the blocking script in layout.tsx
  // already set the correct class before paint, so this is always accurate
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  return { dark, toggle };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// ── ThemeToggle ───────────────────────────────────────────────────────────────

export function ThemeToggle() {
  const { dark, toggle } = useTheme();

  // Avoid hydration mismatch — render a placeholder until client mounts
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800" />
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center flex-shrink-0"
    >
      {dark ? (
        // Sun icon — click to go light
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
        // Moon icon — click to go dark
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

// ── BottomNav ─────────────────────────────────────────────────────────────────

export type NavItem = { label: string; href: string };

export function BottomNav({ items, active }: { items: NavItem[]; active: string }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex-1 py-3 text-center text-xs font-semibold ${
              item.href === active
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────

type Status = "mostly_accessible" | "partial_access" | "review_required";

const STATUS_MAP: Record<Status, { label: string; className: string }> = {
  mostly_accessible: {
    label: "Accessible",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  },
  partial_access: {
    label: "Partial",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  },
  review_required: {
    label: "Review",
    className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = STATUS_MAP[status] ?? STATUS_MAP.review_required;
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${className}`}>
      {label}
    </span>
  );
}