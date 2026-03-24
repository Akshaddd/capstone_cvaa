from ultralytics import YOLO
import os

# Paths
DATASET_CONFIG = "datasets/data.yaml"
MODEL_OUTPUT = "models/best.pt"

def train_model():
    """
    Train YOLOv8n on the DSAPT accessibility features dataset.
    Run this script from the backend/ directory.
    """
    print("🚀 Starting YOLO training...")
    print(f"Dataset config: {DATASET_CONFIG}")
    
    # Check dataset config exists
    if not os.path.exists(DATASET_CONFIG):
        print("❌ data.yaml not found! Check datasets/ folder.")
        return

    # Load base YOLOv8 nano model
    model = YOLO("yolo11n.pt")

    # Train
    results = model.train(
        data=DATASET_CONFIG,
        epochs=50,
        imgsz=640,
        batch=16,
        name="dsapt_accessibility",
        project="models",
        exist_ok=True
    )

    print("✅ Training complete!")
    print(f"Best model saved to: models/dsapt_accessibility/weights/best.pt")

if __name__ == "__main__":
    train_model()