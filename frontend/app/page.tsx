"use client";
import { useState, useRef } from "react";

interface AccessibilityFeature {
  class: string;
  feature: string;
  dsapt_reference: string;
  severity: string;
  confidence: number;
}

interface ScanResult {
  status: string;
  filename: string;
  summary: string;
  total_detections: number;
  accessibility_features: number;
  severity_summary: { high: number; medium: number; low: number; info: number };
  accessibility_report: AccessibilityFeature[];
  raw_detections: any[];
}

const DSAPT_URLS: Record<string, string> = {
  "Part 6": "https://www.legislation.gov.au/Details/F2011L01302",
  "Part 7": "https://www.legislation.gov.au/Details/F2011L01302",
  "Part 8": "https://www.legislation.gov.au/Details/F2011L01302",
  "Part 9": "https://www.legislation.gov.au/Details/F2011L01302",
  "Part 10": "https://www.legislation.gov.au/Details/F2011L01302",
  "Part 11": "https://www.legislation.gov.au/Details/F2011L01302",
};

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"report" | "raw">("report");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResults(null);
    setError(null);
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", image);
      const res = await fetch("http://127.0.0.1:8000/inference/scan", { method: "POST", body: formData });
      const data = await res.json();
      setResults(data);
    } catch {
      setError("Unable to reach the backend. Please ensure the API server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!results) return;
    setDownloading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/report/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(results),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "accessibility_report.md";
      a.click();
    } catch {
      setError("Failed to download report.");
    } finally {
      setDownloading(false);
    }
  };

  const severityConfig = {
    high:   { label: "Critical",  color: "#FF3B30", bg: "#FFF1F0", border: "#FFCDD0" },
    medium: { label: "Warning",   color: "#FF9500", bg: "#FFF8F0", border: "#FFE0B2" },
    low:    { label: "Compliant", color: "#34C759", bg: "#F0FFF4", border: "#C6F0D0" },
    info:   { label: "Info",      color: "#007AFF", bg: "#F0F7FF", border: "#C5E0FF" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #F5F5F7; color: #1D1D1F;
          -webkit-font-smoothing: antialiased;
        }
        .glass-card {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 20px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.06);
        }
        .upload-zone {
          border: 1.5px dashed rgba(0,122,255,0.3);
          border-radius: 16px;
          transition: all 0.2s ease;
          cursor: pointer;
          background: rgba(0,122,255,0.02);
        }
        .upload-zone:hover { border-color: rgba(0,122,255,0.6); background: rgba(0,122,255,0.04); }
        .btn-primary {
          background: #007AFF; color: white; border: none;
          border-radius: 980px; padding: 12px 24px;
          font-size: 15px; font-weight: 500; cursor: pointer;
          transition: all 0.15s ease; font-family: inherit;
          white-space: nowrap;
        }
        .btn-primary:hover { background: #0071EB; }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-ghost {
          background: transparent; color: #86868B; border: none;
          border-radius: 980px; padding: 10px 18px;
          font-size: 14px; font-weight: 500; cursor: pointer;
          transition: all 0.15s ease; font-family: inherit;
        }
        .btn-ghost:hover { background: rgba(0,0,0,0.05); color: #1D1D1F; }
        .btn-download {
          background: #34C759; color: white; border: none;
          border-radius: 980px; padding: 10px 20px;
          font-size: 14px; font-weight: 500; cursor: pointer;
          transition: all 0.15s ease; font-family: inherit;
          white-space: nowrap;
        }
        .btn-download:hover { background: #2DB54D; }
        .btn-download:disabled { opacity: 0.4; cursor: not-allowed; }
        .tab-btn {
          padding: 8px 16px; border-radius: 980px; border: none;
          font-size: 14px; font-weight: 500; cursor: pointer;
          transition: all 0.15s ease; font-family: inherit;
          background: transparent; color: #86868B; white-space: nowrap;
        }
        .tab-btn.active { background: white; color: #1D1D1F; box-shadow: 0 1px 8px rgba(0,0,0,0.10); }
        .feature-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px; border-radius: 14px; margin-bottom: 8px;
          border: 1px solid transparent; transition: transform 0.15s ease;
          gap: 12px;
        }
        .feature-row:hover { transform: translateX(2px); }
        .raw-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-radius: 10px;
          background: #F5F5F7; margin-bottom: 6px;
        }
        .confidence-bar {
          height: 3px; border-radius: 2px; background: #E5E5EA;
          width: 60px; overflow: hidden; margin-top: 4px;
        }
        .confidence-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
        .dsapt-link {
          color: #007AFF; text-decoration: none; font-weight: 500;
          border-bottom: 1px solid rgba(0,122,255,0.3);
          transition: border-color 0.15s ease;
        }
        .dsapt-link:hover { border-color: #007AFF; }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block; margin-right: 8px; vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-in { animation: fadeUp 0.4s ease forwards; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .summary-banner {
          border-radius: 14px; padding: 16px 20px;
          font-size: 15px; line-height: 1.5; margin-bottom: 24px;
          font-weight: 400;
        }

        /* Mobile responsive */
        @media (max-width: 600px) {
          .hero-title { font-size: 32px !important; }
          .hero-subtitle { font-size: 15px !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .result-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .tab-bar { overflow-x: auto; }
          .feature-row { flex-direction: column !important; align-items: flex-start !important; }
          .feature-right { align-self: flex-end !important; }
          nav { padding: 0 20px !important; }
          main { padding: 40px 16px 60px !important; }
          .upload-actions { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)" }}>

        {/* Nav */}
        <nav style={{
          background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)",
          borderBottom: "0.5px solid rgba(0,0,0,0.1)",
          position: "sticky", top: 0, zIndex: 100,
          padding: "0 48px", display: "flex", alignItems: "center",
          justifyContent: "space-between", height: "52px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #007AFF, #5856D6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, color: "white"
            }}>♿</div>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>DSAPT Scanner</span>
          </div>
          <span style={{ fontSize: 12, color: "#86868B" }}>La Trobe University · Proof of Concept</span>
        </nav>

        <main style={{ maxWidth: 760, margin: "0 auto", padding: "60px 24px 80px" }}>

          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "#007AFF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
              Automated Accessibility Audit
            </p>
            <h1 className="hero-title" style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 52, fontWeight: 400, lineHeight: 1.1,
              letterSpacing: "-0.03em", color: "#1D1D1F", marginBottom: 16
            }}>
              Scan any transport venue<br />for accessibility compliance
            </h1>
            <p className="hero-subtitle" style={{ fontSize: 17, color: "#6E6E73", lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>
              Upload an image and our computer vision pipeline detects accessibility features mapped directly to DSAPT standards.
            </p>
          </div>

          {/* Upload Card */}
          <div className="glass-card" style={{ padding: 32, marginBottom: 20 }}>
            <div className="upload-zone" onClick={() => fileInputRef.current?.click()}
              style={{ padding: preview ? 16 : 48, textAlign: "center" }}>
              {preview ? (
                <img src={preview} alt="Preview" style={{
                  maxHeight: 280, margin: "0 auto", display: "block",
                  borderRadius: 12, objectFit: "contain"
                }} />
              ) : (
                <div>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
                  <p style={{ fontSize: 16, fontWeight: 500, color: "#1D1D1F", marginBottom: 4 }}>Drop an image here</p>
                  <p style={{ fontSize: 14, color: "#86868B" }}>or click to browse · JPG, PNG, WEBP</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
            </div>

            {image && (
              <div className="upload-actions" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, color: "#86868B" }}>📎 {image.name}</span>
                  <button className="btn-ghost" onClick={handleReset} style={{ fontSize: 13, padding: "6px 12px" }}>✕ Clear</button>
                </div>
                <button className="btn-primary" onClick={handleScan} disabled={loading}>
                  {loading ? <><span className="spinner" />Analysing…</> : "Run Accessibility Scan →"}
                </button>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="fade-in" style={{
              background: "#FFF1F0", border: "1px solid #FFCDD0",
              borderRadius: 14, padding: "14px 20px",
              color: "#FF3B30", fontSize: 14, marginBottom: 20
            }}>⚠️ {error}</div>
          )}

          {/* Results */}
          {results && (
            <div className="fade-in glass-card" style={{ padding: 32 }}>

              {/* Header */}
              <div className="result-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em" }}>Audit Report</h2>
                  <p style={{ fontSize: 13, color: "#86868B", marginTop: 2 }}>{results.filename}</p>
                </div>
                <button className="btn-download" onClick={handleDownload} disabled={downloading}>
                  {downloading ? "Generating…" : "↓ Download Report"}
                </button>
              </div>

              {/* AI Summary */}
              {results.summary && (
                <div className="summary-banner" style={{
                  background: results.severity_summary.high > 0 ? "#FFF8F0" : "#F0FFF4",
                  border: `1px solid ${results.severity_summary.high > 0 ? "#FFE0B2" : "#C6F0D0"}`,
                  color: results.severity_summary.high > 0 ? "#CC5500" : "#1A7A3A"
                }}>
                  {results.summary}
                </div>
              )}

              {/* Stats */}
              <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                {(["high", "medium", "low", "info"] as const).map((key) => {
                  const cfg = severityConfig[key];
                  return (
                    <div key={key} style={{
                      borderRadius: 14, padding: "16px 12px", textAlign: "center",
                      background: cfg.bg, border: `1px solid ${cfg.border}`
                    }}>
                      <div style={{ fontSize: 26, fontWeight: 600, color: cfg.color, letterSpacing: "-0.02em" }}>
                        {results.severity_summary[key]}
                      </div>
                      <div style={{ fontSize: 11, color: cfg.color, fontWeight: 500, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {cfg.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tabs */}
              <div className="tab-bar" style={{
                display: "flex", gap: 4, background: "#F5F5F7",
                borderRadius: 980, padding: 4, marginBottom: 20, width: "fit-content"
              }}>
                <button className={`tab-btn ${activeTab === "report" ? "active" : ""}`} onClick={() => setActiveTab("report")}>
                  ♿ Report <span style={{ opacity: 0.5 }}>({results.accessibility_features})</span>
                </button>
                <button className={`tab-btn ${activeTab === "raw" ? "active" : ""}`} onClick={() => setActiveTab("raw")}>
                  All Detections <span style={{ opacity: 0.5 }}>({results.total_detections})</span>
                </button>
              </div>

              {/* Report Tab */}
              {activeTab === "report" && (
                <div>
                  {results.accessibility_report.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#86868B", padding: "40px 0", fontSize: 15 }}>
                      No accessibility features detected.
                    </p>
                  ) : (
                    results.accessibility_report.map((d, i) => {
                      const cfg = severityConfig[d.severity as keyof typeof severityConfig];
                      return (
                        <div key={i} className="feature-row" style={{ background: cfg.bg, borderColor: cfg.border }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
                            <div style={{
                              width: 8, height: 8, borderRadius: "50%",
                              background: cfg.color, marginTop: 6, flexShrink: 0
                            }} />
                            <div>
                              <p style={{ fontSize: 15, fontWeight: 500, color: "#1D1D1F", marginBottom: 3 }}>
                                {d.feature}
                              </p>
                              <p style={{ fontSize: 12, color: "#86868B" }}>
                                <a
                                  className="dsapt-link"
                                  href={DSAPT_URLS[d.dsapt_reference] || "https://www.legislation.gov.au/Details/F2011L01302"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  DSAPT {d.dsapt_reference}
                                </a>
                                {" · "}{d.class}
                              </p>
                            </div>
                          </div>
                          <div className="feature-right" style={{ textAlign: "right", flexShrink: 0 }}>
                            <p style={{ fontSize: 15, fontWeight: 600, color: cfg.color }}>{(d.confidence * 100).toFixed(1)}%</p>
                            <div className="confidence-bar">
                              <div className="confidence-fill" style={{ width: `${d.confidence * 100}%`, background: cfg.color }} />
                            </div>
                            <p style={{ fontSize: 11, color: cfg.color, marginTop: 4, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              {cfg.label}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Raw Tab */}
              {activeTab === "raw" && (
                <div>
                  {results.raw_detections.map((d, i) => (
                    <div key={i} className="raw-row">
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, textTransform: "capitalize" }}>{d.class}</span>
                        <span style={{
                          fontSize: 11, color: "#86868B", background: "white",
                          padding: "2px 8px", borderRadius: 6, border: "1px solid #E5E5EA"
                        }}>via {d.model}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{(d.confidence * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        <footer style={{
          textAlign: "center", padding: 24,
          fontSize: 12, color: "#86868B",
          borderTop: "0.5px solid rgba(0,0,0,0.08)"
        }}>
          DSAPT Accessibility Scanner · La Trobe University · Proof of Concept
        </footer>
      </div>
    </>
  );
}