

"use client";

import { useEffect, useState } from "react";

type ScanHistoryItem = {
  id: string;
  date: string;
  filename: string;
  title: string;
  summary: string;
  detectedCount: number;
  missingCount: number;
  boxedImageUrl?: string;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("scanHistory") || "[]");
    setHistory(savedHistory);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("scanHistory");
    setHistory([]);
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Scan History</h1>
            <p className="mt-1 text-sm text-slate-500">
              Previous accessibility scans saved on this device.
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
            >
              Clear history
            </button>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {history.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-slate-500 shadow-sm">
              No scans saved yet.
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {item.title || "Accessibility scan"}
                    </h2>
                    <p className="text-sm text-slate-500">{item.filename}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(item.date).toLocaleString()}
                    </p>
                  </div>

                  {item.boxedImageUrl && (
                    <img
                      src={item.boxedImageUrl}
                      alt="Scan result"
                      className="h-28 w-full rounded-xl object-cover sm:w-40"
                    />
                  )}
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {item.summary}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                    {item.detectedCount} detected
                  </span>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">
                    {item.missingCount} missing
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}