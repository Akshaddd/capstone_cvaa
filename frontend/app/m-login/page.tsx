"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8fafc",
      padding: "20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 360,
        background: "white",
        borderRadius: 24,
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}>

        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 32px 24px", textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "#047857",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(4,120,87,0.3)",
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="8" width="18" height="12" rx="2.5" fill="white"/>
              <rect x="5" y="11" width="4" height="3" rx="0.8" fill="#047857"/>
              <rect x="11" y="11" width="4" height="3" rx="0.8" fill="#047857"/>
              <circle cx="7" cy="21" r="1.8" fill="white"/>
              <circle cx="15" cy="21" r="1.8" fill="white"/>
              <line x1="2" y1="21" x2="22" y2="21" stroke="white" strokeWidth="1.2" opacity=".5"/>
              <circle cx="23" cy="7" r="4" fill="white"/>
              <circle cx="23" cy="7" r="2" fill="#047857"/>
            </svg>
          </div>
          <h1 style={{ margin: "16px 0 4px", fontSize: 24, fontWeight: 700, color: "#0f172a" }}>MyAccess</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Melbourne accessibility network</p>
        </div>

        {/* Inputs + link button */}
        <div style={{ padding: "0 32px 40px", display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Email
            </label>
            <input
              type="text"
              placeholder="you@example.com"
              autoCapitalize="none"
              autoCorrect="off"
              style={{
                border: "1px solid #e2e8f0", borderRadius: 12,
                background: "#f8fafc", padding: "13px 16px",
                fontSize: 16, color: "#0f172a", outline: "none",
                width: "100%", boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              style={{
                border: "1px solid #e2e8f0", borderRadius: 12,
                background: "#f8fafc", padding: "13px 16px",
                fontSize: 16, color: "#0f172a", outline: "none",
                width: "100%", boxSizing: "border-box",
              }}
            />
          </div>

          <a
            href="/m-home"
            style={{
              display: "block",
              width: "100%",
              boxSizing: "border-box",
              padding: "15px 0",
              marginTop: 4,
              borderRadius: 12,
              background: "#047857",
              color: "white",
              fontWeight: 700,
              fontSize: 16,
              textAlign: "center",
              textDecoration: "none",
              WebkitTapHighlightColor: "rgba(0,0,0,0.1)",
            }}
          >
            Sign in
          </a>

          <p style={{ margin: 0, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
            Don&apos;t have an account?{" "}
            <a href="/m-register" style={{ color: "#047857", fontWeight: 600, textDecoration: "none" }}>
              Register
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}