from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io
import os

router = APIRouter(prefix="/inference", tags=["inference"])

# Model paths
CUSTOM_MODEL = os.path.join(os.path.dirname(__file__), "../../models/best.pt")
FALLBACK_MODEL = os.path.join(os.path.dirname(__file__), "../../models/yolo11n.pt")

# Accessibility-relevant classes from COCO dataset
ACCESSIBILITY_CLASSES = {
    "person", "wheelchair", "bicycle", "bus", "train",
    "car", "truck", "traffic light", "stop sign",
    "bench", "stairs", "elevator", "escalator", "ramp",
    "handrail", "door", "toilet", "chair"
}

# DSAPT mapping — maps detected classes to accessibility features
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
    """Load all available YOLO models on startup."""
    global models
    from ultralytics import YOLO
    
    # Load custom trained model if available
    if os.path.exists(CUSTOM_MODEL):
        try:
            models.append({"name": "custom", "model": YOLO(CUSTOM_MODEL)})
            print("✅ Custom model loaded!")
        except Exception as e:
            print(f"⚠️ Custom model failed: {e}")
    
    # Always load fallback YOLOv11
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
    """Map a detected class to a DSAPT accessibility feature."""
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

                # Map to DSAPT if relevant
                mapped = map_to_dsapt(class_name, confidence)
                if mapped:
                    all_detections.append(mapped)

    # Count by severity
    severity_counts = {"high": 0, "medium": 0, "low": 0, "info": 0}
    for d in all_detections:
        severity_counts[d["severity"]] += 1

    return {
        "status": "success",
        "filename": file.filename,
        "image_size": list(image.size),
        "total_detections": len(raw_detections),
        "accessibility_features": len(all_detections),
        "severity_summary": severity_counts,
        "accessibility_report": all_detections,
        "raw_detections": raw_detections
    }