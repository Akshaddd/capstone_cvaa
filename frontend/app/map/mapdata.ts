export type AccessibilityLocation = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  features: string[];
  status: "mostly_accessible" | "partial_access" | "review_required";
  notes: string;
};

export const locations: AccessibilityLocation[] = [
  {
    id: 1,
    name: "Bundoora RMIT Tram Stop",
    lat: -37.7206,
    lng: 145.0479,
    features: ["wheelchair", "ramp", "handrail"],
    status: "mostly_accessible",
    notes: "Ramp access available. Tactile paving needs verification."
  },
  {
    id: 2,
    name: "Reservoir Station",
    lat: -37.7162,
    lng: 145.0063,
    features: ["wheelchair", "elderly_friendly"],
    status: "partial_access",
    notes: "Step-free route available but some features require review."
  },
  {
    id: 3,
    name: "Preston Station",
    lat: -37.7387,
    lng: 145.0005,
    features: ["ramp", "handrail"],
    status: "review_required",
    notes: "Basic access elements detected. Full compliance unclear."
  }
];
