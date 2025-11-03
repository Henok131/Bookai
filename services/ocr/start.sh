#!/bin/sh
set -e

PORT=${PORT:-8000}
DOMAIN=${DOMAIN:-bookai.asenaytech.com}

echo "Starting OCR service..."
echo "DOMAIN: $DOMAIN"
echo "PORT: $PORT"
echo "Working directory: $(pwd)"
echo "Python path: $PYTHONPATH"

# Verify app module exists
if [ ! -f "app/main.py" ]; then
    echo "ERROR: app/main.py not found!"
    ls -la
    exit 1
fi

# Wait a moment for any dependencies
sleep 2

# Start uvicorn with logging
echo "Starting uvicorn on port $PORT..."
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --log-level info

