from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image, UnidentifiedImageError
import io
import os
import cv2
import numpy as np

router = APIRouter(prefix="/inference", tags=["inference"])

# Placeholder — Nadil will provide the trained model path
MODEL_PATH = "yolo26s.pt"
model = None

def draw_boxes(image, detections):
    """Draw bounding boxes and labels onto the uploaded image."""
    img = np.array(image)
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    for det in detections:
        x1, y1, x2, y2 = map(int, det["bbox"])
        label = f"{det['class']} {det['confidence']:.2f}"

        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)

        text_y = y1 - 10 if y1 - 10 > 20 else y1 + 20
        cv2.putText(
            img,
            label,
            (x1, text_y),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (0, 255, 0),
            2,
        )

    return img

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
    os.makedirs("outputs", exist_ok=True)

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

        boxed_image = draw_boxes(image, detections)

        safe_filename = (file.filename or "uploaded_image").rsplit("/", 1)[-1].rsplit("\\", 1)[-1]
        output_filename = f"boxed_{safe_filename.rsplit('.', 1)[0]}.jpg"
        output_path = f"outputs/{output_filename}"

        cv2.imwrite(output_path, boxed_image)

        return {
            "status": "success",
            "filename": file.filename,
            "image_size": {
                "width": width,
                "height": height,
            },
            "detections": detections,
            "boxed_image_path": output_path,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")