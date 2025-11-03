#!/bin/sh
set -e

echo "Starting OCR service..."
echo "DOMAIN: ${DOMAIN:-bookai.asenaytech.com}"
echo "PORT: ${PORT:-8000}"

# Wait a moment for any dependencies
sleep 2

# Start uvicorn with logging
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --log-level info

