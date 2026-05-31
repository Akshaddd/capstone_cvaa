from app.models.report_models import ReportRequest, ReportResponse, DetectionOutput


DSAPT_FEATURE_MAPPING = {
    "ramp": {
        "status": "pass",
        "dsapt_reference": "Accessible boarding and step-free access",
        "outcome": "Ramp detected",
        "recommendation": "Ramp access appears to be available. Ensure the ramp area remains clear and usable for wheelchair users.",
    },
    "wheelchair": {
        "status": "pass",
        "dsapt_reference": "Wheelchair access and mobility support",
        "outcome": "Wheelchair access indicator detected",
        "recommendation": "Wheelchair-related accessibility was detected. Confirm that surrounding paths, boarding areas and manoeuvring space are unobstructed.",
    },
    "tram": {
        "status": "info",
        "dsapt_reference": "Public transport vehicle context",
        "outcome": "Tram context detected",
        "recommendation": "Tram detected. Accessibility should be assessed through boarding access, platform interface, tactile indicators and passenger information features.",
    },
    "bus": {
        "status": "info",
        "dsapt_reference": "Public transport vehicle context",
        "outcome": "Bus context detected",
        "recommendation": "Bus detected. Accessibility should be assessed through ramp access, kerb height, boarding zone clearance and passenger information features.",
    },
    "tactile_paving": {
        "status": "pass",
        "dsapt_reference": "Tactile ground surface indicators",
        "outcome": "Tactile paving detected",
        "recommendation": "Tactile paving appears to be present. Confirm placement, contrast and continuity against the relevant accessibility requirements.",
    },
    "handrail": {
        "status": "pass",
        "dsapt_reference": "Handrails and support features",
        "outcome": "Handrail detected",
        "recommendation": "Handrail detected. Confirm height, continuity and placement are suitable for passenger support.",
    },
    "stairs": {
        "status": "warning",
        "dsapt_reference": "Accessible paths of travel",
        "outcome": "Stairs detected",
        "recommendation": "Stairs may create an accessibility barrier if no ramp, lift or step-free alternative is available nearby.",
    },
    "train": {
        "status": "out_of_scope",
        "dsapt_reference": "Out of current project scope",
        "outcome": "Train context detected",
        "recommendation": "Train environments are currently outside the selected Sprint 4 scope. The current prototype focuses on bus and tram contexts.",
    },
}

CORE_ACCESSIBILITY_FEATURES = ["ramp", "wheelchair", "tactile_paving", "handrail"]


def normalise_feature_name(feature: str) -> str:
    return feature.lower().strip().replace(" ", "_").replace("-", "_")


def build_dsapt_results(detected_features):
    detected_feature_names = {
        normalise_feature_name(item.feature) for item in detected_features
    }

    dsapt_results = []

    for item in detected_features:
        feature_key = normalise_feature_name(item.feature)
        mapping = DSAPT_FEATURE_MAPPING.get(feature_key)

        if mapping:
            dsapt_results.append(
                {
                    "feature": item.feature,
                    "confidence_percentage": item.confidence_percentage,
                    "status": mapping["status"],
                    "dsapt_reference": mapping["dsapt_reference"],
                    "outcome": mapping["outcome"],
                    "recommendation": mapping["recommendation"],
                }
            )
        else:
            dsapt_results.append(
                {
                    "feature": item.feature,
                    "confidence_percentage": item.confidence_percentage,
                    "status": "review",
                    "dsapt_reference": "Manual review required",
                    "outcome": "Feature detected but not yet mapped",
                    "recommendation": "This detected feature is not currently mapped to a DSAPT rule. Review manually before using in compliance reporting.",
                }
            )

    for core_feature in CORE_ACCESSIBILITY_FEATURES:
        if core_feature not in detected_feature_names:
            label = core_feature.replace("_", " ")
            dsapt_results.append(
                {
                    "feature": label,
                    "confidence_percentage": 0,
                    "status": "warning",
                    "dsapt_reference": DSAPT_FEATURE_MAPPING[core_feature]["dsapt_reference"],
                    "outcome": f"{label.title()} not detected",
                    "recommendation": f"No {label} was detected in the uploaded image. This does not confirm absence, but it should be reviewed during manual accessibility assessment.",
                }
            )

    return dsapt_results


def build_report(request: ReportRequest) -> ReportResponse:
    detected_features = [
        DetectionOutput(
            feature=d.class_name,
            confidence_percentage=round(d.confidence * 100, 2),
        )
        for d in request.detections
    ]

    dsapt_results = build_dsapt_results(detected_features)

    recommendations = []
    for result in dsapt_results:
        if result["status"] in ["warning", "review"]:
            recommendations.append(result["recommendation"])

    if not recommendations:
        recommendations.append("No major accessibility gaps detected based on the current mapped features.")

    passed_count = len([result for result in dsapt_results if result["status"] == "pass"])
    warning_count = len([result for result in dsapt_results if result["status"] == "warning"])
    review_count = len([result for result in dsapt_results if result["status"] == "review"])

    summary = (
        f"This report summarises accessibility features for the {request.transport_type}. "
        f"{len(detected_features)} feature(s) were detected by the computer vision model. "
        f"DSAPT-style review summary: {passed_count} pass, {warning_count} warning, {review_count} review."
    )

    if request.notes:
        summary += f"\n\nAdditional Assessment Notes:\n{request.notes}"

    return ReportResponse(
        title=f"{request.transport_type.title()} Accessibility Report",
        summary=summary,
        detected_features=detected_features,
        missing_features=request.missing_features,
        recommendations=recommendations,
        dsapt_results=dsapt_results,
    )
