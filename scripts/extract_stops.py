import csv
import json
from pathlib import Path

BOUNDING_BOX = {
    "min_lat": -37.78,
    "max_lat": -37.68,
    "min_lon": 144.97,
    "max_lon": 145.07,
}

def in_bounds(lat, lon):
    return (
        BOUNDING_BOX["min_lat"] <= lat <= BOUNDING_BOX["max_lat"]
        and BOUNDING_BOX["min_lon"] <= lon <= BOUNDING_BOX["max_lon"]
    )

def load_stops(file_path, mode):
    results = []

    with open(file_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                lat = float(row["stop_lat"])
                lon = float(row["stop_lon"])
            except (ValueError, KeyError):
                continue

            if in_bounds(lat, lon):
                wheelchair_value = row.get("wheelchair_boarding", "").strip()

                features = []
                if wheelchair_value == "1":
                    features.append("wheelchair")

                results.append({
                    "id": row["stop_id"],
                    "name": row["stop_name"],
                    "lat": lat,
                    "lng": lon,
                    "mode": mode,
                    "status": "review_required",
                    "features": features,
                    "notes": f"Official {mode} stop loaded from GTFS. Accessibility audit pending."
                })

    return results

tram_stops_file = Path("/Users/akshadshelar/Downloads/gtfs/3/google_transit/stops.txt")
bus_stops_file = Path("/Users/akshadshelar/Downloads/gtfs/4/google_transit/stops.txt")

tram_stops = load_stops(tram_stops_file, "tram")
bus_stops = load_stops(bus_stops_file, "bus")

combined = tram_stops + bus_stops

output_path = Path("/Users/akshadshelar/capstone_cvaa/frontend/app/map/real-stops.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(combined, f, indent=2)

print(f"Saved {len(combined)} stops to {output_path}")
