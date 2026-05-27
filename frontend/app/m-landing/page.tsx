"use client";

import { ThemeToggle } from "../shared";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", color: "var(--text)", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      <header style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: "16px 20px 12px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text)" }}>MyAccess</h1>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text3)" }}>Melbourne accessibility network</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <ThemeToggle />
          <a href="/m-login" style={{ background: "var(--green)", color: "white", fontWeight: 600, fontSize: 14, borderRadius: 12, padding: "10px 18px", textDecoration: "none" }}>
            Sign in
          </a>
        </div>
      </header>

      <main style={{ display: "flex", flexDirection: "column", gap: 16, padding: "16px 16px 40px" }}>

        <div style={{ background: "var(--green)", borderRadius: 20, padding: "28px 24px", color: "white" }}>
          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, opacity: 0.8 }}>Accessibility audit tool</p>
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>DSAPT compliance auditing for Melbourne public transport</h2>
          <p style={{ margin: "0 0 20px", fontSize: 14, opacity: 0.75 }}>Scan a stop, get a structured compliance report.</p>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="/m-login" style={{ background: "white", color: "#047857", fontWeight: 700, fontSize: 14, borderRadius: 12, padding: "12px 20px", textDecoration: "none" }}>Get started</a>
            <a href="/m-map" style={{ border: "1px solid rgba(255,255,255,0.5)", color: "white", fontWeight: 600, fontSize: 14, borderRadius: 12, padding: "12px 20px", textDecoration: "none" }}>View map</a>
          </div>
        </div>

        <div style={{ background: "var(--bg2)", borderRadius: 20, border: "1px solid var(--border)", padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "var(--text)" }}>How it works</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { step: "1", title: "Find a stop",  desc: "Search or tap any stop on the live accessibility map" },
              { step: "2", title: "Scan it",       desc: "Take photos with your phone — our AI does the rest" },
              { step: "3", title: "Get a report",  desc: "Instant DSAPT compliance report with clause-level findings" },
            ].map((s) => (
              <div key={s.step} style={{ display: "flex", gap: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--green)", color: "white", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.step}</div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{s.title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text3)" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { title: "1,000+ stops", sub: "Melbourne network mapped"  },
            { title: "Smart scanning", sub: "AI-powered photo analysis" },
            { title: "Plain English", sub: "Reports anyone can read"  },
            { title: "Free to use",  sub: "For everyone, always"      },
          ].map((f) => (
            <div key={f.title} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16, padding: 16 }}>
              <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{f.title}</p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text3)" }}>{f.sub}</p>
            </div>
          ))}
        </div>

        <a href="/m-login" style={{ display: "block", width: "100%", boxSizing: "border-box", background: "var(--green)", color: "white", fontWeight: 700, fontSize: 16, borderRadius: 16, padding: "16px 0", textAlign: "center", textDecoration: "none" }}>
          Sign in to start scanning
        </a>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text4)", margin: 0 }}>
          Or <a href="/m-map" style={{ color: "var(--green)", fontWeight: 600, textDecoration: "none" }}>browse the map without signing in</a>
        </p>

      </main>
    </div>
  );
}