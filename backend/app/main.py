from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import inference

app = FastAPI(
    title="Accessibility Audit API",
    description="Backend for accessibility audit tool (PoC)",
    version="0.1.0"
)

# Allow frontend (Next.js) to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check (VERY IMPORTANT)
@app.get("/")
def root():
    return {"message": "Accessibility Audit API is running"}

# Test endpoint (useful for frontend testing)
@app.get("/test")
def test():
    return {"status": "ok"}

app.include_router(inference.router)