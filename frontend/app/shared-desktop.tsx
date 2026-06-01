"use client";

import { useState, useEffect } from "react";

export function useTheme() {
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

export function ThemeToggle() {
  const { dark, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800" />;

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center"
    >
      {dark ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export type NavItem = { label: string; href: string };

type SidebarProps = {
  nav: { section: string; items: NavItem[] }[];
  active: string;
  user: { initials: string; name: string; role: string };
};

function initialsFromName(name: string, fallback: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || fallback;
}

function sessionUserFromStorage(fallback: SidebarProps["user"]) {
  if (typeof window === "undefined") return fallback;

  const role = window.localStorage.getItem("myaccess_user_role");
  const name = window.localStorage.getItem("myaccess_user_name") || "";

  if (role === "operator") {
    const displayName = name || "Operator User";
    return {
      initials: initialsFromName(displayName, "OP"),
      name: displayName,
      role: "Network operator",
    };
  }

  if (role === "compliance") {
    const displayName = name || "Compliance Officer";
    return {
      initials: initialsFromName(displayName, "CO"),
      name: displayName,
      role: "Accessibility compliance",
    };
  }

  if (role === "council") {
    const displayName = name || "Council Reviewer";
    return {
      initials: initialsFromName(displayName, "CR"),
      name: displayName,
      role: "Council reviewer",
    };
  }

  return fallback;
}

export function Sidebar({ nav, active, user }: SidebarProps) {
  const { toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dark, setDarkState] = useState(false);
  const [sessionUser, setSessionUser] = useState(user);
  useEffect(() => {
    const refreshSession = () => {
      setSessionUser(sessionUserFromStorage(user));
    };

    setMounted(true);
    setDarkState(document.documentElement.classList.contains("dark"));
    refreshSession();

    window.addEventListener("storage", refreshSession);
    window.addEventListener("focus", refreshSession);

    return () => {
      window.removeEventListener("storage", refreshSession);
      window.removeEventListener("focus", refreshSession);
    };
  }, [user]);

  function handleToggle() {
    toggle();
    setDarkState((d) => !d);
  }

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          M
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-900 dark:text-white">MyAccess</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Melbourne network</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
        {nav.map((section) => (
          <div key={section.section}>
            <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {section.section}
            </p>
            {section.items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active === item.href
                    ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {sessionUser.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{sessionUser.name}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{sessionUser.role}</p>
          </div>
          {mounted && (
            <button onClick={handleToggle} aria-label="Toggle theme"
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 flex items-center justify-center flex-shrink-0">
              {dark ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          )}
        </div>
        <a
          href="/d-landing"
          onClick={() => {
            window.localStorage.removeItem("myaccess_user_role");
            window.localStorage.removeItem("myaccess_user_email");
            window.localStorage.removeItem("myaccess_user_name");
          }}
          className="text-xs text-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
        >
          Sign out
        </a>
      </div>
    </aside>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: "mostly_accessible" | "partial_access" | "review_required" }) {
  const map = {
    mostly_accessible: { label: "Accessible", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
    partial_access:    { label: "Partial",    cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"   },
    review_required:   { label: "Review",     cls: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"               },
  };
  const { label, cls } = map[status];
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>;
}

export const USER_NAV = [
  {
    section: "Operator tools",
    items: [
      { label: "Dashboard",          href: "/d-home"    },
      { label: "Network map",        href: "/d-map"     },
      { label: "Capture evidence",   href: "/d-scan"    },
    ],
  },
  {
    section: "Audit evidence",
    items: [
      { label: "Assessment history", href: "/d-reports" },
      { label: "Saved stops",        href: "/d-saved"   },
    ],
  },
];

export const COUNCIL_NAV = [
  {
    section: "Reports",
    items: [
      { label: "Public reports", href: "/d-council"           },
      { label: "Area index",     href: "/d-council/area"      },
    ],
  },
  {
    section: "Community",
    items: [
      { label: "Community",      href: "/d-council/community" },
      { label: "Insights",       href: "/d-council/insights"  },
    ],
  },
  {
    section: "Network",
    items: [
      { label: "Map",            href: "/d-map"               },
    ],
  },
];

export const PTV_NAV = [
  {
    section: "Compliance review",
    items: [
      { label: "Dashboard",         href: "/d-ptv"              },
      { label: "Submitted reports", href: "/d-ptv/stops"        },
    ],
  },
  {
    section: "Actions",
    items: [
      { label: "Routes",            href: "/d-ptv/routes"       },
      { label: "Remediation queue", href: "/d-ptv/maintenance"  },
    ],
  },
  {
    section: "Network evidence",
    items: [
      { label: "Map",               href: "/d-map"              },
      { label: "Review evidence",   href: "/d-scan"             },
    ],
  },
];