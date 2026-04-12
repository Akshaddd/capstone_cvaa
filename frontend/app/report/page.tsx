"use client";

import { useMemo, useState } from "react";

type DetectedFeature = {
  feature: string;
  confidence_percentage: number;
};

type ReportResponse = {
  title: string;
  summary: string;
  detected_features: DetectedFeature[];
  missing_features: string[];
};

export default function ReportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const fileLabel = useMemo(() => {
    if (!file) return "No image selected";
    return file.name;
  }, [file]);

  const handleUpload = async () => {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError("");
    setReport(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const res = await fetch(`${API_URL}/report/from-image`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Something went wrong.");
        return;
      }

      setReport(data);
    } catch {
      setError("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <header
        style={{
          borderBottom: "1px solid #e2e8f0",
          background: "#ffffff",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.1,
                color: "#4f46e5",
                textTransform: "uppercase",
              }}
            >
              CV Accessibility Platform
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>
              Accessibility Report Generator
            </div>
          </div>

          <div
            style={{
              fontSize: 13,
              color: "#166534",
              background: "#ecfdf5",
              border: "1px solid #bbf7d0",
              borderRadius: 999,
              padding: "8px 12px",
              fontWeight: 600,
            }}
          >
            Upload image → Detect → Generate report
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 56px" }}>
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 24,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              color: "#0f172a",
              borderRadius: 24,
              padding: 20,
              border: "1px solid #e2e8f0",
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#ecfdf5",
                border: "1px solid #bbf7d0",
                borderRadius: 999,
                padding: "8px 12px",
                fontSize: 13,
                fontWeight: 700,
                color: "#166534",
              }}
            >
              AI-powered accessibility analysis
            </div>

            <h1 style={{ fontSize: 30, lineHeight: 1.1, margin: "8px 0 6px", fontWeight: 800 }}>
              Accessibility insights from transport images
            </h1>

            <p
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: "#64748b",
                maxWidth: 520,
                margin: 0,
              }}
            >
              Upload an image to analyse accessibility features.
            </p>

          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 24,
              padding: 28,
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#4f46e5",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Image input
            </div>
            <h2 style={{ margin: "10px 0 8px", fontSize: 28, fontWeight: 800 }}>Upload an image</h2>
            <p style={{ margin: 0, color: "#64748b", lineHeight: 1.65 }}>
              Choose a transport image to generate a structured accessibility report.
            </p>

            <label
              htmlFor="report-file-input"
              style={{
                display: "block",
                marginTop: 22,
                border: "1.5px dashed #cbd5e1",
                borderRadius: 18,
                padding: 18,
                background: "#f8fafc",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Select file</div>
              <div style={{ fontSize: 14, color: "#64748b" }}>{fileLabel}</div>
              <input
                id="report-file-input"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const selected = e.target.files?.[0] || null;
                  setFile(selected);
                  setReport(null);
                  setError("");
                  if (preview) {
                    URL.revokeObjectURL(preview);
                  }
                  if (selected) {
                    setPreview(URL.createObjectURL(selected));
                  } else {
                    setPreview(null);
                  }
                }}
              />
            </label>

            {preview && (
              <div
                style={{
                  marginTop: 18,
                  borderRadius: 18,
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                }}
              >
                <img
                  src={preview}
                  alt="Selected upload preview"
                  style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
                />
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={loading}
              style={{
                marginTop: 20,
                width: "100%",
                padding: "14px 18px",
                background: loading ? "#bbf7d0" : "#16a34a",
                color: "white",
                border: "none",
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "none",
              }}
            >
              {loading ? "Generating report..." : "Generate accessibility report"}
            </button>

            {error && (
              <div
                style={{
                  marginTop: 16,
                  borderRadius: 14,
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  padding: "12px 14px",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}
          </div>
        </section>

        {report && (
          <section style={{ marginTop: 28, display: "grid", gap: 20 }}>
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 24,
                padding: 28,
                boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  alignItems: "start",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#4f46e5",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Generated report
                  </div>
                  <h2 style={{ margin: "8px 0 10px", fontSize: 30, fontWeight: 800 }}>{report.title}</h2>
                  <p style={{ margin: 0, color: "#475569", lineHeight: 1.75, maxWidth: 780 }}>{report.summary}</p>
                </div>
                <div
                  style={{
                    borderRadius: 16,
                    background: "#ecfdf5",
                    color: "#166534",
                    padding: "12px 14px",
                    minWidth: 170,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    Features detected
                  </div>
                  <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6 }}>{report.detected_features.length}</div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                alignItems: "stretch",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 24,
                  padding: 24,
                  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <h3 style={{ margin: 0, fontSize: 21, fontWeight: 800 }}>Detected features</h3>
                <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 14 }}>
                  Confidence levels returned by the model.
                </p>

                <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
                  {report.detected_features.length > 0 ? (
                    report.detected_features.map((item, index, arr) => {
                      const totalCount = arr.filter((feature) => feature.feature === item.feature).length;
                      const currentCount = arr
                        .slice(0, index + 1)
                        .filter((feature) => feature.feature === item.feature).length;

                      const displayLabel = totalCount > 1 ? `${item.feature} ${currentCount}` : item.feature;

                      return (
                        <div
                          key={`${item.feature}-${index}`}
                          style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 16,
                            padding: 16,
                            background: "#fcfdff",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 12,
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <div style={{ fontSize: 15, fontWeight: 700 }}>{displayLabel}</div>
                            <div
                              style={{
                                borderRadius: 999,
                                background: "#ecfdf5",
                                color: "#166534",
                                fontSize: 13,
                                fontWeight: 800,
                                padding: "6px 10px",
                                whiteSpace: "nowrap",
                                border: "1px solid #bbf7d0",
                              }}
                            >
                              {item.confidence_percentage}% confidence
                            </div>
                          </div>
                          <div
                            style={{
                              height: 10,
                              background: "#e2e8f0",
                              borderRadius: 999,
                              marginTop: 12,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.max(0, Math.min(item.confidence_percentage, 100))}%`,
                                height: "100%",
                                background: "#16a34a",
                                borderRadius: 999,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div
                      style={{
                        border: "1px dashed #cbd5e1",
                        borderRadius: 16,
                        padding: 18,
                        color: "#64748b",
                        background: "#f8fafc",
                      }}
                    >
                      No detected features were returned for this image.
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 24,
                  padding: 24,
                  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
                }}
              >
                <h3 style={{ margin: 0, fontSize: 21, fontWeight: 800 }}>Missing features</h3>
                <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                  {report.missing_features.length > 0 ? (
                    report.missing_features.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        style={{
                          borderRadius: 14,
                          background: "#fff7ed",
                          border: "1px solid #fed7aa",
                          color: "#9a3412",
                          padding: "12px 14px",
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        {item}
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        borderRadius: 14,
                        background: "#ecfdf5",
                        border: "1px solid #bbf7d0",
                        color: "#166534",
                        padding: "12px 14px",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      No missing features identified.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}