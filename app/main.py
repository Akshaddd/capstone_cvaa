from fastapi import FastAPI

app = FastAPI(title="DSAPT Accessibility Scanner API")

@app.get("/health")
def health_check():
    return {"status": "ok", "project": "DSAPT Accessibility Scanner"}