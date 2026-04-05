from app.models.report_models import ReportRequest, ReportResponse, DetectionOutput


def build_report(request: ReportRequest) -> ReportResponse:
    detected_features = [
        DetectionOutput(
            feature=d.class_name,
            confidence_percentage=round(d.confidence * 100, 2)
        )
        for d in request.detections
    ]

    recommendations = []

    if request.missing_features:
        for feature in request.missing_features:
            recommendations.append(
                f"Consider adding {feature} to improve accessibility."
            )
    else:
        recommendations.append("No major accessibility gaps detected.")

    summary = (
        f"This report summarises accessibility features for the {request.transport_type}. "
        f"{len(detected_features)} feature(s) were detected."
    )

    return ReportResponse(
        title=f"{request.transport_type.title()} Accessibility Report",
        summary=summary,
        detected_features=detected_features,
        missing_features=request.missing_features,
        recommendations=recommendations
    )