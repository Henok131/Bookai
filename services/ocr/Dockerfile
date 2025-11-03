FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr wget ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY start.sh ./start.sh
COPY start.py ./start.py
RUN chmod +x ./start.sh ./start.py

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=60s CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1
CMD ["python", "start.py"]
