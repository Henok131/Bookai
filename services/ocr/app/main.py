import os
from fastapi import FastAPI

app = FastAPI(title="BookAI OCR Service")

DOMAIN = os.getenv("DOMAIN", "bookai.asenaytech.com")

@app.get("/")
async def root():
    return {"service": "ocr", "status": "running", "domain": DOMAIN}

@app.get("/health")
async def health():
    return {"ok": True, "service": "ocr", "domain": DOMAIN}
