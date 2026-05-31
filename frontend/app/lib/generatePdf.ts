const CLASS_NAMES: Record<string, string> = {
  tactile: "Tactile Ground Surface",
  ramp: "Kerb Ramp",
  wheelchair: "Wheelchair Access",
  stop_sign: "Accessible Signage",
  gap: "Platform Gap Clearance",
  tram: "Tram Platform",
  bus: "Vehicle Access",
  person: "Path of Travel",
};

const CLASS_CLAUSES: Record<string, string> = {
  tactile: "DSAPT 11.2", ramp: "DSAPT 12.3", wheelchair: "DSAPT 13.1",
  stop_sign: "DSAPT 17.2", gap: "DSAPT 15.4", tram: "DSAPT 15.1",
  bus: "DSAPT 13.3", person: "DSAPT 12.1",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateReport(scan: any) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  const stop = scan.stop ?? scan.selectedStop ?? {};
  const stopName = stop.name ?? scan.stopName ?? "Unknown Stop";
  const stopMode = stop.mode ?? scan.stopMode ?? "transport";
  const date = scan.timestamp ?? scan.scannedAt
    ? new Date(scan.timestamp ?? scan.scannedAt).toLocaleString()
    : new Date().toLocaleString();
  const score: number = scan.score ?? 50;
  const compliant = score >= 80;

  const rawDets: any[] = scan.detections ?? [];
  const detections = rawDets.map((d) => {
    const cls = d.class ?? "";
    const conf = d.confidence ?? 1;
    const status = d.status ?? (conf >= 0.65 ? "Pass" : conf >= 0.35 ? "Warning" : "Failed");
    return {
      name: d.name ?? CLASS_NAMES[cls] ?? cls.replace(/_/g, " "),
      clause: d.clause ?? CLASS_CLAUSES[cls] ?? "DSAPT General",
      severity: d.severity ?? "minor",
      status,
      action: d.action ?? d.recommendation ?? "",
      confidence: Math.round(conf * 100),
    };
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("MyAccess — DSAPT Compliance Report", 20, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Stop: ${stopName} · ${stopMode} stop`, 20, 34);
  doc.text(`Date: ${date}`, 20, 41);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`Score: ${score}/100 — ${compliant ? "Compliant" : "Non-compliant"}`, 20, 55);

  const passed   = detections.filter((d) => d.status === "Pass").length;
  const warnings = detections.filter((d) => d.status === "Warning").length;
  const failed   = detections.filter((d) => d.status === "Failed").length;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${passed} passed · ${warnings} warnings · ${failed} failed`, 20, 63);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("DSAPT Findings", 20, 76);

  let y = 86;
  detections.forEach((d, i) => {
    if (y > 255) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${i + 1}. ${d.name} — ${d.status} (${d.confidence}%)`, 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${d.clause} · Severity: ${d.severity}`, 20, y);
    y += 6;
    if (d.action) {
      const lines = doc.splitTextToSize(`Action: ${d.action}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 5;
    }
    y += 6;
  });

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    "AI-generated — verify with a qualified auditor before remediation.",
    20,
    doc.internal.pageSize.height - 10
  );

  doc.save(`myaccess-${stopName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}