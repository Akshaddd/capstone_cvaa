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

DSAPT_LABELS = {"ramp", "platform_edge", "tactile_paving", "tram", "bus", "step", "handrail", "step_gap"}

# Anchor labels — objects with known real-world sizes used for metric scaling
ANCHOR_LABELS = {
    "tram": ("tram_door", 2.00),
    "bus": ("bus_door", 1.90),
    "ramp": ("wheelchair_ramp", 0.30),
}

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_ID = "depth-anything/Depth-Anything-V2-Large-hf"

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
    x1, y1, x2, y2 = [int(v) for v in bbox]
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(depth_map.shape[1] - 1, x2), min(depth_map.shape[0] - 1, y2)
    if y2 <= y1 or x2 <= x1:
        return None
    obj_depth_mean = depth_map[y1:y2, x1:x2].mean()
    obj_height_px = y2 - y1
    if obj_depth_mean < 1e-6 or obj_height_px < 5:
        return None
    return float(known_height_m / (obj_height_px / image_height_px / obj_depth_mean))

def compute_metric_scale(depth_map, detections, image_height_px):
    """
    Average metric scale across all detected anchor objects.
    More anchors = more stable scale estimate.
    """
    scales = []
    for det in detections:
        label = det["label"]
        if label in ANCHOR_LABELS:
            _, known_h = ANCHOR_LABELS[label]
            scale = anchor_to_metric(depth_map, det["bbox"], known_h, image_height_px)
            if scale is not None:
                scales.append(scale)
    if not scales:
        return None
    # Trim outliers if multiple anchors — use median for robustness
    return float(np.median(scales))

def draw_measurement(image, pt1, pt2, label, color=(0, 255, 0)):
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

    if by1 >= by2:
        by1 = max(0, mid_y - text_h - padding)
        by2 = mid_y + padding

    cv2.rectangle(image, (bx1, by1), (bx2, by2), (0, 0, 0), -1)
    cv2.putText(image, label, (bx1 + padding, by2 - padding), font, font_scale, color, thickness)

def fmt(depth_val, metric_scale):
    if metric_scale:
        return f"{depth_val * metric_scale:.2f}m (est)"
    return f"{depth_val:.2f} (rel)"

def depth_at_bbox(depth_map, bbox):
    h, w = depth_map.shape
    x1, y1, x2, y2 = [int(v) for v in bbox]
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w - 1, x2), min(h - 1, y2)
    if y2 <= y1 or x2 <= x1:
        return 0.0
    return float(depth_map[y1:y2, x1:x2].mean())

def annotate_dsapt_measurements(image, depth_map, detections, metric_scale):
    annotated = image.copy()
    h, w = annotated.shape[:2]

    by_label = {}
    for det in detections:
        label = det["label"]
        if label in DSAPT_LABELS:
            by_label.setdefault(label, []).append(det)

    measurements = {}
    flags = []

    # ── Ramp: vertical line across bbox height ────────────────────────────────
    for det in by_label.get("ramp", []):
        x1, y1, x2, y2 = det["bbox"]
        cx = int((x1 + x2) / 2)
        pt1 = (cx, int(y1))
        pt2 = (cx, int(y2))
        dval = depth_at_bbox(depth_map, det["bbox"])
        draw_measurement(annotated, pt1, pt2, f"ramp: {fmt(dval, metric_scale)}", color=(0, 255, 0))
        measurements["ramp_depth"] = dval
        if metric_scale:
            flags.append(f"Ramp detected at ~{dval * metric_scale:.2f}m from camera")

    # ── Platform gap: line from platform_edge to vehicle ─────────────────────
    platform_dets = by_label.get("platform_edge", [])
    vehicle_dets = by_label.get("tram", by_label.get("bus", []))
    if platform_dets and vehicle_dets:
        pe = platform_dets[0]["bbox"]
        veh = vehicle_dets[0]["bbox"]
        pt1 = (int(pe[2]), int((pe[1] + pe[3]) / 2))
        pt2 = (int(veh[0]), int((veh[1] + veh[3]) / 2))
        gap_depth = abs(depth_at_bbox(depth_map, pe) - depth_at_bbox(depth_map, veh))
        draw_measurement(annotated, pt1, pt2, f"platform gap: {fmt(gap_depth, metric_scale)}", color=(0, 165, 255))
        measurements["platform_gap_depth"] = gap_depth
        if metric_scale:
            gap_m = gap_depth * metric_scale
            compliant = gap_m <= DSAPT_THRESHOLDS["platform_gap_max"]
            flags.append(f"{'PASS' if compliant else 'FAIL'}: Platform gap ~{gap_m:.3f}m (limit 50mm)")

    # ── Tactile paving: horizontal line across width ──────────────────────────
    for det in by_label.get("tactile_paving", []):
        x1, y1, x2, y2 = det["bbox"]
        cy = int((y1 + y2) / 2)
        pt1 = (int(x1), cy)
        pt2 = (int(x2), cy)
        dval = depth_at_bbox(depth_map, det["bbox"])
        draw_measurement(annotated, pt1, pt2, f"tactile paving: {fmt(dval, metric_scale)}", color=(255, 200, 0))
        measurements["tactile_paving_depth"] = dval

    # ── Step: vertical line across bbox height ────────────────────────────────
    for det in by_label.get("step", []):
        x1, y1, x2, y2 = det["bbox"]
        cx = int((x1 + x2) / 2)
        pt1 = (cx, int(y1))
        pt2 = (cx, int(y2))
        dval = depth_at_bbox(depth_map, det["bbox"])
        draw_measurement(annotated, pt1, pt2, f"step height: {fmt(dval, metric_scale)}", color=(0, 0, 255))
        measurements["step_depth"] = dval
        if metric_scale:
            est = dval * metric_scale
            compliant = est <= DSAPT_THRESHOLDS["step_height_max"]
            flags.append(f"{'PASS' if compliant else 'FAIL'}: Step height ~{est:.3f}m (limit 190mm)")

    # ── Step gap: horizontal line across width ────────────────────────────────
    for det in by_label.get("step_gap", []):
        x1, y1, x2, y2 = det["bbox"]
        cy = int((y1 + y2) / 2)
        pt1 = (int(x1), cy)
        pt2 = (int(x2), cy)
        dval = depth_at_bbox(depth_map, det["bbox"])
        draw_measurement(annotated, pt1, pt2, f"step gap: {fmt(dval, metric_scale)}", color=(255, 0, 255))
        measurements["step_gap_depth"] = dval

    # ── Handrail: horizontal line across width ────────────────────────────────
    for det in by_label.get("handrail", []):
        x1, y1, x2, y2 = det["bbox"]
        cy = int((y1 + y2) / 2)
        pt1 = (int(x1), cy)
        pt2 = (int(x2), cy)
        dval = depth_at_bbox(depth_map, det["bbox"])
        draw_measurement(annotated, pt1, pt2, f"handrail: {fmt(dval, metric_scale)}", color=(255, 100, 0))
        measurements["handrail_depth"] = dval

    return annotated, measurements, flags

def process_frame(depth_pipe, frame, yolo_detections=None, reference_bbox=None, reference_object="tram_door"):
    depth_map = estimate_depth(depth_pipe, frame)
    depth_coloured = colourise_depth(depth_map)

    # Compute metric scale by averaging across all valid anchor detections
    metric_scale = None
    if yolo_detections:
        metric_scale = compute_metric_scale(depth_map, yolo_detections, frame.shape[0])

    # Fallback to single reference bbox if provided and no anchors found
    if metric_scale is None and reference_bbox is not None:
        known_h = REFERENCE_OBJECTS.get(reference_object, 2.0)
        metric_scale = anchor_to_metric(depth_map, reference_bbox, known_h, frame.shape[0])

    measurements = {}
    flags = []
    annotated_image = frame.copy()

    if yolo_detections:
        annotated_image, measurements, flags = annotate_dsapt_measurements(
            frame, depth_map, yolo_detections, metric_scale
        )

    # Side-by-side: annotated original left, clean heatmap right
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
