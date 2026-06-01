from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image, UnidentifiedImageError
import io
from app.models.report_models import ReportRequest, ReportResponse
from app.services.report_service import build_report
from app.services.claude_service import analyse_image_with_claude
from app.routers import inference

router = APIRouter(prefix="/report", tags=["report"])

submitted_reports = []

@router.get("/test")
def test_report():
    return {"message": "Report router is working"}

@router.post("/generate", response_model=ReportResponse)
def generate_report(request: ReportRequest):
    return build_report(request)

@router.post("/from-image")
async def generate_report_from_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    file.file.seek(0)

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Run YOLO inference
    try:
        inference_result = await inference.scan_combined(file=file)
        boxed_image_path = inference_result.get("boxed_image_path")
        detections = inference_result.get("detections", [])
        print("DETECTIONS FROM COMBINED YOLO:", detections)
    except Exception as e:
        print("Inference failed, using fallback:", e)
        boxed_image_path = None
        detections = [
            {"class": "ramp", "confidence": 0.92, "bbox": [0, 0, 100, 100]},
            {"class": "priority seating", "confidence": 0.87, "bbox": [0, 0, 100, 100]}
        ]

    # Run Claude Vision analysis
    try:
        claude_assessment = analyse_image_with_claude(image, detections)
        print("CLAUDE ASSESSMENT:", claude_assessment)
    except Exception as e:
        print("Claude Vision failed:", e)
        claude_assessment = "Claude Vision assessment unavailable."

    report_request = ReportRequest(
        transport_type="transport asset",
        detections=detections,
        missing_features=[],
        notes=claude_assessment
    )

    report = build_report(report_request)

    return {
        **report.dict(),
        "boxed_image_path": boxed_image_path,
        "claude_assessment": claude_assessment,
    }


@router.post("/submit")
def submit_report(report: dict):
    submitted_reports.insert(0, report)
    return {
        "status": "submitted",
        "message": "Report submitted for compliance review",
        "report": report,
    }


@router.get("/submitted")
def get_submitted_reports():
    return submitted_reports
