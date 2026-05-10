import cv2
import numpy as np
import torch
from PIL import Image
from transformers import pipeline
from dataclasses import dataclass
from typing import Optional

DSAPT_THRESHOLDS = {
    "platform_gap_max": 0.05,
    "ramp_gradient_max": 1 / 8,
    "step_height_max": 0.19,
    "clear_path_min": 1.0,
}

REFERENCE_OBJECTS = {
    "tram_door": 2.00,
    "standard_kerb": 0.15,
    "wheelchair_ramp": 0.30,
    "bus_door": 1.90,
}

DSAPT_LABELS = {"ramp", "platform_edge", "tactile_paving", "tram", "bus", "step", "handrail"}

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_ID = "depth-anything/Depth-Anything-V2-Small-hf"

@dataclass
class DepthResult:
    depth_map: np.ndarray
    depth_coloured: np.ndarray
    annotated_image: np.ndarray
    metric_scale: Optional[float]
    measurements: dict
    flags: list

def load_depth_model():
    print(f"Loading {MODEL_ID} on {DEVICE}...")
    depth_pipe = pipeline(task="depth-estimation", model=MODEL_ID, device=0 if DEVICE == "cuda" else -1)
    print("Model loaded.")
    return depth_pipe

def estimate_depth(depth_pipe, image):
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb)
    result = depth_pipe(pil_img)
    depth = np.array(result["depth"], dtype=np.float32)
    depth = (depth - depth.min()) / (depth.max() - depth.min() + 1e-8)
    return depth

def colourise_depth(depth_map):
    depth_uint8 = (depth_map * 255).astype(np.uint8)
    return cv2.applyColorMap(depth_uint8, cv2.COLORMAP_INFERNO)

def anchor_to_metric(depth_map, bbox, known_height_m, image_height_px):
    x1, y1, x2, y2 = bbox
    obj_depth_mean = depth_map[y1:y2, x1:x2].mean()
    obj_height_px = y2 - y1
    if obj_depth_mean < 1e-6:
        return None
    return known_height_m / (obj_height_px / image_height_px / obj_depth_mean)

def draw_measurement(image, pt1, pt2, label, color=(0, 255, 0)):
    """Draw a measurement line between two points with a label at the midpoint."""
    cv2.line(image, pt1, pt2, color, 2, cv2.LINE_AA)
    cv2.circle(image, pt1, 5, color, -1)
    cv2.circle(image, pt2, 5, color, -1)

    mid_x = (pt1[0] + pt2[0]) // 2
    mid_y = (pt1[1] + pt2[1]) // 2

    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.6
    thickness = 2
    padding = 5
    text_w, text_h = cv2.getTextSize(label, font, font_scale, thickness)[0]

    h, w = image.shape[:2]
    bx1 = max(0, mid_x - text_w // 2 - padding)
    by1 = max(0, mid_y - text_h - padding * 2)
    bx2 = min(w, mid_x + text_w // 2 + padding)
    by2 = min(h, mid_y + padding)

    cv2.rectangle(image, (bx1, by1), (bx2, by2), (0, 0, 0), -1)
    cv2.putText(image, label, (bx1 + padding, by2 - padding), font, font_scale, color, thickness)

def annotate_dsapt_measurements(image, depth_map, detections, metric_scale):
    """
    Draw DSAPT-relevant measurements only on the original image.
    - Ramp: line across the full length of the ramp bbox
    - Platform gap: line from platform_edge to bus/tram door
    - Tactile paving: line across its width
    - Step: line across its height
    """
    annotated = image.copy()
    h, w = annotated.shape[:2]

    by_label = {}
    for det in detections:
        label = det["label"]
        if label in DSAPT_LABELS:
            by_label.setdefault(label, []).append(det)

    def depth_at_bbox(bbox):
        x1, y1, x2, y2 = bbox
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w - 1, x2), min(h - 1, y2)
        return float(depth_map[y1:y2, x1:x2].mean())

    def fmt(depth_val):
        if metric_scale:
            return f"{depth_val * metric_scale:.2f}m (est)"
        return f"{depth_val:.2f} (rel)"

    measurements = {}
    flags = []

    # ── Ramp: measure length top to bottom of bbox ────────────────────────────
    for det in by_label.get("ramp", []):
        x1, y1, x2, y2 = det["bbox"]
        cx = int((x1 + x2) / 2)
        pt1 = (cx, int(y1))
        pt2 = (cx, int(y2))
        depth_val = depth_at_bbox(det["bbox"])
        label = f"ramp length: {fmt(depth_val)}"
        draw_measurement(annotated, pt1, pt2, label, color=(0, 255, 0))
        measurements["ramp_depth"] = depth_val
        if metric_scale:
            est = depth_val * metric_scale
            flags.append(f"Ramp detected at ~{est:.2f}m from camera")

    # ── Platform gap: line from platform_edge right edge to bus/tram left edge ─
    platform_dets = by_label.get("platform_edge", [])
    vehicle_dets = by_label.get("tram", by_label.get("bus", []))
    if platform_dets and vehicle_dets:
        pe = platform_dets[0]["bbox"]
        veh = vehicle_dets[0]["bbox"]
        pt1 = (int(pe[2]), int((pe[1] + pe[3]) / 2))
        pt2 = (int(veh[0]), int((veh[1] + veh[3]) / 2))
        gap_depth = abs(depth_at_bbox(pe) - depth_at_bbox(veh))
        label = f"platform gap: {fmt(gap_depth)}"
        draw_measurement(annotated, pt1, pt2, label, color=(0, 165, 255))
        measurements["platform_gap_depth"] = gap_depth
        if metric_scale:
            gap_m = gap_depth * metric_scale
            compliant = gap_m <= DSAPT_THRESHOLDS["platform_gap_max"]
            flags.append(f"{'PASS' if compliant else 'FAIL'}: Platform gap ~{gap_m:.3f}m (limit 50mm)")

    # ── Tactile paving: line across width ────────────────────────────────────
    for det in by_label.get("tactile_paving", []):
        x1, y1, x2, y2 = det["bbox"]
        cy = int((y1 + y2) / 2)
        pt1 = (int(x1), cy)
        pt2 = (int(x2), cy)
        depth_val = depth_at_bbox(det["bbox"])
        label = f"tactile paving: {fmt(depth_val)}"
        draw_measurement(annotated, pt1, pt2, label, color=(255, 200, 0))
        measurements["tactile_paving_depth"] = depth_val

    # ── Step: line across height ──────────────────────────────────────────────
    for det in by_label.get("step", []):
        x1, y1, x2, y2 = det["bbox"]
        cx = int((x1 + x2) / 2)
        pt1 = (cx, int(y1))
        pt2 = (cx, int(y2))
        depth_val = depth_at_bbox(det["bbox"])
        label = f"step height: {fmt(depth_val)}"
        draw_measurement(annotated, pt1, pt2, label, color=(0, 0, 255))
        measurements["step_depth"] = depth_val
        if metric_scale:
            est = depth_val * metric_scale
            compliant = est <= DSAPT_THRESHOLDS["step_height_max"]
            flags.append(f"{'PASS' if compliant else 'FAIL'}: Step height ~{est:.3f}m (limit 190mm)")

    return annotated, measurements, flags

def process_frame(depth_pipe, frame, yolo_detections=None, reference_bbox=None, reference_object="tram_door"):
    depth_map = estimate_depth(depth_pipe, frame)
    depth_coloured = colourise_depth(depth_map)

    metric_scale = None
    if reference_bbox:
        known_h = REFERENCE_OBJECTS.get(reference_object, 2.0)
        metric_scale = anchor_to_metric(depth_map, reference_bbox, known_h, frame.shape[0])

    measurements = {}
    flags = []
    annotated_image = frame.copy()

    if yolo_detections:
        annotated_image, measurements, flags = annotate_dsapt_measurements(
            frame, depth_map, yolo_detections, metric_scale
        )

    # Side-by-side: annotated original on left, clean heatmap on right
    heatmap_resized = cv2.resize(depth_coloured, (frame.shape[1], frame.shape[0]))
    combined = np.hstack([annotated_image, heatmap_resized])

    return DepthResult(
        depth_map=depth_map,
        depth_coloured=depth_coloured,
        annotated_image=combined,
        metric_scale=metric_scale,
        measurements=measurements,
        flags=flags,
    )
