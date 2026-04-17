from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image, UnidentifiedImageError
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
        print(f"Model loaded from {MODEL_PATH}")
    except Exception as e:
        model = None
        print(f"Model not loaded yet: {e}")

load_model()

@router.post("/scan")
async def scan_image(file: UploadFile = File(...)):
    """
    Receive an image and return YOLO detection results.
    Model will be plugged in once Nadil completes training.
    """
    # Validate file is an image
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Read and validate image
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Invalid image file")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not process image")

    width, height = image.size

    # If model not loaded yet, return placeholder
    if model is None:
        return {
            "status": "model_not_ready",
            "message": "Awaiting trained model from Nadil",
            "filename": file.filename,
            "image_size": {
                "width": width,
                "height": height,
            },
            "detections": [],
        }

    # Run inference (active once model is loaded)
    try:
        results = model(image)
        detections = []

        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0])
                confidence = round(float(box.conf[0]), 4)
                bbox = [round(float(x), 2) for x in box.xyxy[0].tolist()]

                detections.append({
                    "class": result.names[class_id],
                    "confidence": confidence,
                    "bbox": bbox,
                })

        return {
            "status": "success",
            "filename": file.filename,
            "image_size": {
                "width": width,
                "height": height,
            },
            "detections": detections,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")