#!/usr/bin/env python3
"""Direct Python startup script for OCR service"""
import os
import sys

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    domain = os.getenv("DOMAIN", "bookai.asenaytech.com")
    
    print(f"Starting OCR service...")
    print(f"DOMAIN: {domain}")
    print(f"PORT: {port}")
    print(f"Working directory: {os.getcwd()}")
    
    # Verify app module exists
    if not os.path.exists("app/main.py"):
        print("ERROR: app/main.py not found!")
        sys.exit(1)
    
    # Import and run uvicorn
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        log_level="info"
    )

