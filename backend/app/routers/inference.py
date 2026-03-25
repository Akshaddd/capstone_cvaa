from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io
import os

router = APIRouter(prefix="/inference", tags=["inference"])

CUSTOM_MODEL = os.path.join(os.path.dirname(__file__), "../../models/best.pt")
FALLBACK_MODEL = os.path.join(os.path.dirname(__file__), "../../models/yolo11n.pt")

DSAPT_MAPPING = {
    "person": {"feature": "Pedestrian presence", "dsapt": "Part 7", "severity": "info"},
    "wheelchair": {"feature": "Wheelchair user detected", "dsapt": "Part 6", "severity": "high"},
    "bus": {"feature": "Bus/vehicle access point", "dsapt": "Part 10", "severity": "info"},
    "train": {"feature": "Train/platform access", "dsapt": "Part 11", "severity": "info"},
    "bench": {"feature": "Seating available", "dsapt": "Part 8", "severity": "low"},
    "stairs": {"feature": "Stairs detected — check step-free alternative", "dsapt": "Part 6", "severity": "high"},
    "ramp": {"feature": "Ramp detected", "dsapt": "Part 6", "severity": "low"},
    "handrail": {"feature": "Handrail detected", "dsapt": "Part 6", "severity": "low"},
    "door": {"feature": "Door/entry point", "dsapt": "Part 6", "severity": "medium"},
    "traffic light": {"feature": "Pedestrian signal", "dsapt": "Part 7", "severity": "medium"},
    "stop sign": {"feature": "Road signage", "dsapt": "Part 9", "severity": "info"},
    "chair": {"feature": "Seating area", "dsapt": "Part 8", "severity": "low"},
}

models = []

def load_models():
    global models
    from ultralytics import YOLO
    if os.path.exists(CUSTOM_MODEL):
        try:
            models.append({"name": "custom", "model": YOLO(CUSTOM_MODEL)})
            print("✅ Custom model loaded!")
        except Exception as e:
            print(f"⚠️ Custom model failed: {e}")
    if os.path.exists(FALLBACK_MODEL):
        try:
            models.append({"name": "yolo11n", "model": YOLO(FALLBACK_MODEL)})
            print("✅ YOLOv11 fallback model loaded!")
        except Exception as e:
            print(f"⚠️ YOLOv11 failed: {e}")
    if not models:
        print("⚠️ No models loaded!")

load_models()

def map_to_dsapt(class_name: str, confidence: float):
    key = class_name.lower().replace("_", " ")
    if key in DSAPT_MAPPING:
        mapping = DSAPT_MAPPING[key]
        return {
            "class": class_name,
            "feature": mapping["feature"],
            "dsapt_reference": mapping["dsapt"],
            "severity": mapping["severity"],
            "confidence": confidence
        }
    return None

@router.post("/scan")
async def scan_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    if not models:
        raise HTTPException(status_code=503, detail="No models loaded")

    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    all_detections = []
    raw_detections = []

    for m in models:
        results = m["model"](image, verbose=False)
        for result in results:
            for box in result.boxes:
                class_name = result.names[int(box.cls)]
                confidence = round(float(box.conf), 3)
                raw_detections.append({
                    "class": class_name,
                    "confidence": confidence,
                    "bbox": box.xyxy[0].tolist(),
                    "model": m["name"]
                })
                mapped = map_to_dsapt(class_name, confidence)
                if mapped:
                    all_detections.append(mapped)

    # Deduplicate — keep highest confidence per class
    seen: dict = {}
    for d in all_detections:
        key = d["class"]
        if key not in seen or d["confidence"] > seen[key]["confidence"]:
            seen[key] = d
    deduped = list(seen.values())

    # Sort by severity
    severity_order = {"high": 0, "medium": 1, "low": 2, "info": 3}
    deduped.sort(key=lambda x: severity_order.get(x["severity"], 4))

    # Count by severity
    severity_counts = {"high": 0, "medium": 0, "low": 0, "info": 0}
    for d in deduped:
        severity_counts[d["severity"]] += 1

    # Generate summary
    total = len(deduped)
    high = severity_counts["high"]
    medium = severity_counts["medium"]

    if total == 0:
        summary = "No accessibility features were detected. Try uploading a clearer image of a transport venue."
    elif high > 0:
        summary = f"⚠️ {high} critical accessibility barrier{'s' if high > 1 else ''} detected. Immediate review recommended."
    elif medium > 0:
        summary = f"This venue shows {total} accessibility feature{'s' if total > 1 else ''} with {medium} warning{'s' if medium > 1 else ''} requiring attention."
    else:
        summary = f"This venue appears accessible — {total} feature{'s' if total > 1 else ''} detected with no critical barriers."

    return {
        "status": "success",
        "filename": file.filename,
        "image_size": list(image.size),
        "summary": summary,
        "total_detections": len(raw_detections),
        "accessibility_features": len(deduped),
        "severity_summary": severity_counts,
        "accessibility_report": deduped,
        "raw_detections": raw_detections
    }