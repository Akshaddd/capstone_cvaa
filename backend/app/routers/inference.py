from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image, UnidentifiedImageError
import io
import os
import cv2
import numpy as np
from ultralytics import YOLO

router = APIRouter(prefix="/inference", tags=["inference"])

# Generic/base YOLO model
MODEL_PATH = "yolo26s.pt"
model = None

# Custom fine-tuned wheelchair model
WHEELCHAIR_MODEL_PATH = "models/wheelchair.pt"
wheelchair_model = None

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

def build_output_path(filename, prefix="boxed"):
    """Create a safe output path for saved visualisation images."""
    safe_filename = (filename or "uploaded_image").rsplit("/", 1)[-1].rsplit("\\", 1)[-1]
    safe_filename = safe_filename.replace(" ", "_")
    base_name = safe_filename.rsplit(".", 1)[0]
    output_filename = f"{prefix}_{base_name}.jpg"
    return output_filename, f"outputs/{output_filename}"

def load_model():
    """Load the base YOLO model and the custom wheelchair model."""
    global model, wheelchair_model

    try:
        model = YOLO(MODEL_PATH)
        print(f"Base model loaded from {MODEL_PATH}")
    except Exception as e:
        model = None
        print(f"Base model not loaded yet: {e}")

    try:
        if os.path.exists(WHEELCHAIR_MODEL_PATH):
            wheelchair_model = YOLO(WHEELCHAIR_MODEL_PATH)
            print(f"Wheelchair model loaded from {WHEELCHAIR_MODEL_PATH}")
        else:
            wheelchair_model = None
            print(f"Wheelchair model not found at {WHEELCHAIR_MODEL_PATH}")
    except Exception as e:
        wheelchair_model = None
        print(f"Wheelchair model not loaded yet: {e}")

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

        _, output_path = build_output_path(file.filename, prefix="boxed")
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

@router.post("/scan-wheelchair")
async def scan_wheelchair(file: UploadFile = File(...)):
    """
    Receive an image and return detection results from the fine-tuned wheelchair model.
    This endpoint is kept separate so the current generic scan flow is not affected.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Invalid image file")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not process image")

    width, height = image.size

    if wheelchair_model is None:
        raise HTTPException(status_code=500, detail="Wheelchair model not loaded")

    try:
        results = wheelchair_model.predict(image, conf=0.25)
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
            "total_detections": len(detections),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Wheelchair inference failed: {str(e)}")

@router.post("/scan-combined")
async def scan_combined(file: UploadFile = File(...)):
    """
    Run both the base YOLO model and the custom wheelchair model on the same image.
    This returns one merged detection response and one boxed output image.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Invalid image file")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not process image")

    width, height = image.size
    os.makedirs("outputs", exist_ok=True)

    detections = []
    models_used = []

    try:
        if model is not None:
            base_results = model(image)
            models_used.append("base_yolo")

            for result in base_results:
                for box in result.boxes:
                    class_id = int(box.cls[0])
                    confidence = round(float(box.conf[0]), 4)
                    bbox = [round(float(x), 2) for x in box.xyxy[0].tolist()]

                    detections.append({
                        "class": result.names[class_id],
                        "confidence": confidence,
                        "bbox": bbox,
                        "source_model": "base_yolo",
                    })

        if wheelchair_model is not None:
            wheelchair_results = wheelchair_model.predict(image, conf=0.25)
            models_used.append("wheelchair_yolo")

            for result in wheelchair_results:
                for box in result.boxes:
                    class_id = int(box.cls[0])
                    confidence = round(float(box.conf[0]), 4)
                    bbox = [round(float(x), 2) for x in box.xyxy[0].tolist()]

                    detections.append({
                        "class": result.names[class_id],
                        "confidence": confidence,
                        "bbox": bbox,
                        "source_model": "wheelchair_yolo",
                    })

        if not models_used:
            return {
                "status": "model_not_ready",
                "message": "No detection models are currently loaded",
                "filename": file.filename,
                "image_size": {
                    "width": width,
                    "height": height,
                },
                "detections": [],
                "total_detections": 0,
                "models_used": [],
            }

        boxed_image = draw_boxes(image, detections)
        _, output_path = build_output_path(file.filename, prefix="combined_boxed")
        cv2.imwrite(output_path, boxed_image)

        return {
            "status": "success",
            "filename": file.filename,
            "image_size": {
                "width": width,
                "height": height,
            },
            "detections": detections,
            "total_detections": len(detections),
            "models_used": models_used,
            "boxed_image_path": output_path,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Combined inference failed: {str(e)}")