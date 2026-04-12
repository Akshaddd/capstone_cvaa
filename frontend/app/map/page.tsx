"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./mapview"), {
  ssr: false,
});

export default function MapPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
        Accessibility Map
      </h1>
      <p style={{ marginBottom: "10px" }}>
        Bundoora, Reservoir, Preston
      </p>

      <MapView />
    </div>
  );
}