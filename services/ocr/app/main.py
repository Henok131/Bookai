from fastapi import FastAPI

app = FastAPI()

DOMAIN = "bookai.asenaytech.com"

@app.get("/health")
async def health():
    return {"ok": True, "service": "ocr", "domain": DOMAIN}
