import cv2
import numpy as np
import torch
import time
from PIL import Image
from transformers import pipeline
from dataclasses import dataclass
from typing import Optional

DSAPT_THRESHOLDS = {
    "platform_gap_max": 0.05,
    "ramp_gradient_max": 1 / 8,
}

REFERENCE_OBJECTS = {
    "tram_door": 2.00,
    "standard_kerb": 0.15,
}

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_ID = "depth-anything/Depth-Anything-V2-Small-hf"

@dataclass
class DepthResult:
    depth_map: np.ndarray
    depth_coloured: np.ndarray
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

def process_frame(depth_pipe, frame, yolo_detections=None, reference_bbox=None, reference_object="tram_door"):
    depth_map = estimate_depth(depth_pipe, frame)
    depth_coloured = colourise_depth(depth_map)
    return DepthResult(depth_map=depth_map, depth_coloured=depth_coloured, metric_scale=None, measurements={}, flags=[])

def run_on_image(depth_pipe, image_path, output_path="depth_output.jpg"):
    frame = cv2.imread(image_path)
    if frame is None:
        raise FileNotFoundError(f"Image not found: {image_path}")
    t0 = time.time()
    result = process_frame(depth_pipe, frame)
    elapsed = time.time() - t0
    depth_resized = cv2.resize(result.depth_coloured, (frame.shape[1], frame.shape[0]))
    combined = np.hstack([frame, depth_resized])
    cv2.imwrite(output_path, combined)
    print(f"Processed in {elapsed:.2f}s -> {output_path}")
    return result

def run_live_feed(depth_pipe, camera_index=0, process_every_n=5):
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open camera: {camera_index}")
    frame_count = 0
    last_depth_coloured = None
    print("Live feed running. Press Q to quit.")
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame_count += 1
        if frame_count % process_every_n == 0:
            result = process_frame(depth_pipe, frame)
            last_depth_coloured = result.depth_coloured
        display = frame.copy()
        if last_depth_coloured is not None:
            depth_resized = cv2.resize(last_depth_coloured, (frame.shape[1], frame.shape[0]))
            display = cv2.addWeighted(frame, 0.6, depth_resized, 0.4, 0)
        cv2.imshow("DSAPT Depth Scanner", display)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", type=str)
    parser.add_argument("--live", action="store_true")
    parser.add_argument("--camera", default=0)
    parser.add_argument("--every-n", type=int, default=5)
    args = parser.parse_args()
    depth_pipe = load_depth_model()
    if args.image:
        run_on_image(depth_pipe, args.image)
    elif args.live:
        run_live_feed(depth_pipe, camera_index=args.camera, process_every_n=args.every_n)
    else:
        print("Use --image <path> or --live")
