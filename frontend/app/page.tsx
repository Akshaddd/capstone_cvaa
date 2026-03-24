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
  total_detections: number;
  accessibility_features: number;
  severity_summary: { high: number; medium: number; low: number; info: number };
  accessibility_report: AccessibilityFeature[];
  raw_detections: any[];
}

const SEVERITY_STYLES: Record<string, string> = {
  high: "bg-red-50 border-red-200 text-red-800",
  medium: "bg-yellow-50 border-yellow-200 text-yellow-800",
  low: "bg-green-50 border-green-200 text-green-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

const SEVERITY_BADGE: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
  info: "bg-blue-100 text-blue-700",
};

const SEVERITY_ICONS: Record<string, string> = {
  high: "🚨",
  medium: "⚠️",
  low: "✅",
  info: "ℹ️",
};

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
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

  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", image);
      const res = await fetch("http://127.0.0.1:8000/inference/scan", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError("Failed to connect to backend. Make sure the API is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl">♿</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">DSAPT Accessibility Scanner</h1>
            <p className="text-xs text-gray-500">Powered by Computer Vision · La Trobe University</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
        {/* Hero */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Automated Accessibility Audit</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Upload an image of a public transport venue to automatically detect accessibility
            features and barriers mapped to DSAPT standards.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Image</h3>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-blue-200 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <span className="text-5xl">📸</span>
                <p className="text-base font-medium">Click to upload an image</p>
                <p className="text-sm">Supports JPG, PNG, WEBP</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {image && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">📎 {image.name}</p>
              <button
                onClick={handleScan}
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Scanning..." : "Run Accessibility Scan"}
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">⚠️ {error}</div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

            {/* Severity Summary */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: "Critical", key: "high", color: "red", icon: "🚨" },
                { label: "Warnings", key: "medium", color: "yellow", icon: "⚠️" },
                { label: "Compliant", key: "low", color: "green", icon: "✅" },
                { label: "Info", key: "info", color: "blue", icon: "ℹ️" },
              ].map(({ label, key, color, icon }) => (
                <div key={key} className={`rounded-xl p-4 text-center bg-${color}-50 border border-${color}-100`}>
                  <p className="text-2xl mb-1">{icon}</p>
                  <p className={`text-2xl font-bold text-${color}-600`}>
                    {results.severity_summary[key as keyof typeof results.severity_summary]}
                  </p>
                  <p className={`text-xs text-${color}-500 font-medium`}>{label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab("report")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "report" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                ♿ Accessibility Report ({results.accessibility_features})
              </button>
              <button
                onClick={() => setActiveTab("raw")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "raw" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                🔍 All Detections ({results.total_detections})
              </button>
            </div>

            {/* Accessibility Report Tab */}
            {activeTab === "report" && (
              <div className="flex flex-col gap-3">
                {results.accessibility_report.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No accessibility features mapped.</p>
                ) : (
                  results.accessibility_report.map((d, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${SEVERITY_STYLES[d.severity]}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{SEVERITY_ICONS[d.severity]}</span>
                        <div>
                          <p className="font-semibold">{d.feature}</p>
                          <p className="text-xs opacity-70">DSAPT {d.dsapt_reference} · Detected: {d.class}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${SEVERITY_BADGE[d.severity]}`}>
                          {d.severity}
                        </span>
                        <p className="font-bold text-lg">{(d.confidence * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Raw Detections Tab */}
            {activeTab === "raw" && (
              <div className="flex flex-col gap-2">
                {results.raw_detections.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">{d.class}</span>
                      <span className="text-xs text-gray-400">via {d.model}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-700">{(d.confidence * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        DSAPT Accessibility Scanner · La Trobe University · Proof of Concept
      </footer>
    </div>
  );
}