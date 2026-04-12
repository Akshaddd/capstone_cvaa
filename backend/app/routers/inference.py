from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io

router = APIRouter(prefix="/inference", tags=["inference"])

# Placeholder — Nadil will provide the trained model path
MODEL_PATH = "yolo26s.pt"
model = None

def load_model():
    """Load YOLO model — call this once model is trained."""
    global model
    try:
        from ultralytics import YOLO
        model = YOLO(MODEL_PATH)
    except Exception as e:
        print(f"Model not loaded yet: {e}")

load_model()

@router.post("/scan")
async def scan_image(file: UploadFile = File(...)):
    """
    Receive an image and return YOLO detection results.
    Model will be plugged in once Nadil completes training.
    """
    # Validate file is an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    # If model not loaded yet, return placeholder
    if model is None:
        return {
            "status": "model_not_ready",
            "message": "Awaiting trained model from Nadil",
            "filename": file.filename,
            "image_size": image.size
        }
    
    # Run inference (active once model is loaded)
    results = model(image)
    detections = []
    for result in results:
        for box in result.boxes:
            detections.append({
                "class": result.names[int(box.cls)],
                "confidence": float(box.conf),
                "bbox": box.xyxy[0].tolist()
            })

    return {
        "status": "success",
        "filename": file.filename,
        "detections": detections
    }