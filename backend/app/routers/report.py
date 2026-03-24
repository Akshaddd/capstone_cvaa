from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import io

router = APIRouter(prefix="/report", tags=["report"])

class Detection(BaseModel):
    class_name: str
    feature: str
    dsapt_reference: str
    severity: str
    confidence: float

class ReportRequest(BaseModel):
    filename: str
    total_detections: int
    accessibility_features: int
    severity_summary: dict
    accessibility_report: List[dict]
    raw_detections: Optional[List[dict]] = []

def generate_markdown(data: ReportRequest) -> str:
    """Generate a structured Markdown accessibility report."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Severity emoji mapping
    icons = {"high": "🚨", "medium": "⚠️", "low": "✅", "info": "ℹ️"}
    
    md = f"""# DSAPT Accessibility Audit Report

**Generated:** {now}  
**Image:** {data.filename}  
**Total Detections:** {data.total_detections}  
**Accessibility Features Identified:** {data.accessibility_features}

---

## Executive Summary

| Severity | Count |
|----------|-------|
| 🚨 Critical | {data.severity_summary.get('high', 0)} |
| ⚠️ Warning | {data.severity_summary.get('medium', 0)} |
| ✅ Compliant | {data.severity_summary.get('low', 0)} |
| ℹ️ Info | {data.severity_summary.get('info', 0)} |

---

## Accessibility Features Detected

"""
    # Group by severity
    for severity in ["high", "medium", "low", "info"]:
        features = [f for f in data.accessibility_report if f.get("severity") == severity]
        if not features:
            continue
        
        labels = {"high": "Critical Issues", "medium": "Warnings", 
                  "low": "Compliant Features", "info": "Informational"}
        md += f"### {icons[severity]} {labels[severity]}\n\n"
        
        for f in features:
            md += f"""#### {f.get('feature', 'Unknown')}
- **DSAPT Reference:** {f.get('dsapt_reference', 'N/A')}
- **Detected Class:** {f.get('class', 'N/A')}
- **Confidence:** {round(f.get('confidence', 0) * 100, 1)}%
- **Severity:** {severity.upper()}

"""

    md += """---

## Recommendations

"""
    high_features = [f for f in data.accessibility_report if f.get("severity") == "high"]
    if high_features:
        md += "### Priority Actions Required\n\n"
        for f in high_features:
            md += f"- **{f.get('feature')}** (DSAPT {f.get('dsapt_reference')}): Immediate review required.\n"
    else:
        md += "No critical accessibility barriers detected in this scan.\n"

    md += """

---

## Disclaimer

This report was generated automatically by the DSAPT Accessibility Scanner proof of concept.
Results should be verified by a qualified accessibility assessor before use in compliance reporting.

*La Trobe University · DSAPT Accessibility Scanner · Proof of Concept*
"""
    return md

@router.post("/generate")
async def generate_report(data: ReportRequest):
    """Generate and return a Markdown accessibility report."""
    markdown = generate_markdown(data)
    return {"report": markdown}

@router.post("/download")
async def download_report(data: ReportRequest):
    """Download the accessibility report as a Markdown file."""
    markdown = generate_markdown(data)
    buffer = io.BytesIO(markdown.encode("utf-8"))
    filename = f"accessibility_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    return StreamingResponse(
        buffer,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )