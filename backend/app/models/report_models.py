from pydantic import BaseModel, Field
from typing import List, Optional


class Detection(BaseModel):
    class_name: str = Field(alias="class")
    confidence: float
    bbox: Optional[List[float]] = None

    model_config = {
        "populate_by_name": True
    }


class ReportRequest(BaseModel):
    transport_type: str
    detections: List[Detection]
    missing_features: Optional[List[str]] = []
    notes: Optional[str] = None


class DetectionOutput(BaseModel):
    feature: str
    confidence_percentage: float


class DSAPTCheck(BaseModel):
    feature: str
    status: str
    result: str
    reference: str
    requirement: str
    victoria_context: str


class ReportResponse(BaseModel):
    title: str
    summary: str
    detected_features: List[DetectionOutput]
    missing_features: List[str]
    recommendations: List[str]
    dsapt_checks: List[DSAPTCheck] = []