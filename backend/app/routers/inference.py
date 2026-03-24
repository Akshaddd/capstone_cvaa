from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io
import os

router = APIRouter(prefix="/inference", tags=["inference"])

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../models/best.pt")
FALLBACK_MODEL = os.path.join(os.path.dirname(__file__), "../../models/yolo11n.pt")
model = None

def load_model():
    """Load YOLO model on startup."""
    global model
    try:
        from ultralytics import YOLO
        path = MODEL_PATH if os.path.exists(MODEL_PATH) else FALLBACK_MODEL
        model = YOLO(path)
        print(f"✅ YOLO model loaded: {path}")
    except Exception as e:
        print(f"⚠️ Model not loaded: {e}")

# Load model when module is imported
load_model()

@router.post("/scan")
async def scan_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    if model is None:
        return {
            "status": "model_not_ready",
            "message": "Model failed to load",
            "filename": file.filename
        }
    
    results = model(image)
    detections = []
    for result in results:
        for box in result.boxes:
            detections.append({
                "class": result.names[int(box.cls)],
                "confidence": round(float(box.conf), 3),
                "bbox": box.xyxy[0].tolist()
            })

    return {
        "status": "success",
        "filename": file.filename,
        "total_detections": len(detections),
        "detections": detections
    }