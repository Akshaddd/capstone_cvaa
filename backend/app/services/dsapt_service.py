DSAPT_RULES = {
    "tactile_paving": {
        "reference": "DSAPT tactile ground surface indicator requirements",
        "requirement": "Tactile ground surface indicators should support safe navigation at boarding points, platform edges and other public transport access areas.",
        "victoria_context": "Relevant to Victorian train stations, tram stops and bus stops.",
    },
    "ramp": {
        "reference": "DSAPT boarding and access path requirements",
        "requirement": "Accessible boarding and access infrastructure should support passengers using wheelchairs or mobility aids where level access is not available.",
        "victoria_context": "Relevant to Victorian accessible tram, train and bus infrastructure.",
    },
    "wheelchair": {
        "reference": "DSAPT accessible boarding and allocated space requirements",
        "requirement": "Public transport infrastructure should support access for passengers using wheelchairs and mobility aids.",
        "victoria_context": "Relevant to Victorian public transport accessibility requirements.",
    },
}


def check_dsapt_compliance(detected_features):
    detected_labels = {
        feature.feature.lower().replace(" ", "_")
        for feature in detected_features
    }

    checks = []

    for feature_name, rule in DSAPT_RULES.items():
        is_detected = feature_name in detected_labels

        checks.append({
            "feature": feature_name.replace("_", " ").title(),
            "status": "Detected" if is_detected else "Not detected",
            "result": "Potential accessibility indicator present" if is_detected else "Potential accessibility gap",
            "reference": rule["reference"],
            "requirement": rule["requirement"],
            "victoria_context": rule["victoria_context"],
        })

    return checks