from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.routers import inference, report
from app.routers.inference import load_model

app = FastAPI(
    title="Accessibility Audit API",
    description="Backend for accessibility audit tool (PoC)",
    version="0.1.0"
)

# Ensure outputs directory exists and serve it
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
os.makedirs(OUTPUTS_DIR, exist_ok=True)
app.mount("/outputs", StaticFiles(directory=OUTPUTS_DIR), name="outputs")

# Allow frontend (Next.js) to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Accessibility Audit API is running"}

@app.get("/test")
def test():
    return {"status": "ok"}

app.include_router(inference.router)
app.include_router(report.router)

@app.on_event("startup")
def startup_event():
    load_model()