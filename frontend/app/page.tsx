"use client";
import { useState, useRef } from "react";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const getSeverityColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800 border-green-200";
    if (confidence >= 0.5) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
            ♿
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">DSAPT Accessibility Scanner</h1>
            <p className="text-xs text-gray-500">Powered by Computer Vision · La Trobe University</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
        {/* Hero */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Automated Accessibility Audit
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Upload an image of a public transport venue to automatically detect 
            accessibility features and barriers mapped to DSAPT standards.
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {image && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">📎 {image.name}</p>
              <button
                onClick={handleScan}
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Scanning..." : "Run Accessibility Scan"}
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Scan Results</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {results.total_detections} features detected
              </span>
            </div>

            {results.detections?.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No accessibility features detected.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {results.detections?.map((d: any, i: number) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-4 rounded-xl border ${getSeverityColor(d.confidence)}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">♿</span>
                      <div>
                        <p className="font-semibold capitalize">{d.class.replace(/_/g, " ")}</p>
                        <p className="text-xs opacity-70">Bounding box detected</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{(d.confidence * 100).toFixed(1)}%</p>
                      <p className="text-xs opacity-70">confidence</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{results.total_detections}</p>
                <p className="text-xs text-gray-500">Total Detections</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {results.detections?.filter((d: any) => d.confidence >= 0.8).length}
                </p>
                <p className="text-xs text-gray-500">High Confidence</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {results.detections?.filter((d: any) => d.confidence < 0.8).length}
                </p>
                <p className="text-xs text-gray-500">Needs Review</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400">
        DSAPT Accessibility Scanner · La Trobe University · Proof of Concept
      </footer>
    </div>
  );
}