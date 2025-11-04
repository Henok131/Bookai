# BookAI Phase-1 Visibility Audit Report

**Date:** 2025-11-03  
**Repo:** https://github.com/Henok131/Bookai.git  
**Domain:** bookai.asenaytech.com

---

## 1. Repo Tree (Top 2 Levels)

```
BookAI/
├── apps/
│   ├── api/              # Node + Express TS
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── index.ts
│   └── web/              # React + Vite + Tailwind
│       ├── Dockerfile
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       └── src/
│           ├── App.tsx
│           ├── main.tsx
│           └── index.css
├── services/
│   └── ocr/              # Python FastAPI
│       ├── Dockerfile
│       ├── requirements.txt
│       ├── start.py
│       ├── start.sh
│       └── app/
│           ├── __init__.py
│           └── main.py
├── docker/
│   └── nginx/
│       └── default.conf
├── docker-compose.yml
├── package.json
├── README.md
├── DEPLOYMENT.md
├── DNS_SETUP.md
└── TROUBLESHOOTING.md
```

---

## 2. Endpoints Map

### API (Node + Express TS)
- **GET** `/health` → `{ ok: true, service: "api", domain: "..." }`
- **No other routes** (only health endpoint)

### OCR (Python FastAPI)
- **GET** `/` → `{ service: "ocr", status: "running", domain: "..." }`
- **GET** `/health` → `{ ok: true, service: "ocr", domain: "..." }`
- **HEAD** `/health` → (same as GET)
- **No OCR processing endpoints** (no `/parse`, `/extract`, etc.)

### Web (React + Vite)
- **Single page:** `/` (root only)
- **No routing** (no React Router, no `/status`, `/ocr-tester`, etc.)
- Displays service health checks on page load

---

## 3. Nginx Routing

**File:** `docker/nginx/default.conf`

```nginx
server {
  listen 80;
  server_name bookai.asenaytech.com;

  # Web (Vite preview)
  location / {
    proxy_pass http://web:5173/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # API
  location /api/ {
    proxy_pass http://api:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # OCR
  location /ocr/ {
    proxy_pass http://ocr:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

**Issues:**
- No `client_max_body_size` set (will fail on file uploads)
- No CORS headers explicitly configured
- No timeout configurations

---

## 4. Environment Matrix

### Root `.env.example` (if exists)
- `DOMAIN` (default: `bookai.asenaytech.com`)
- `POSTGRES_USER` (default: `bookai`)
- `POSTGRES_PASSWORD` (default: `bookai_password`)
- `POSTGRES_DB` (default: `bookai`)
- `VITE_API_BASE` (default: `https://bookai.asenaytech.com/api`)

### API Service
- `PORT` (default: `8080`)
- `DOMAIN` (from env, default: `bookai.asenaytech.com`)
- `DATABASE_URL` (constructed from POSTGRES_* vars)

### OCR Service
- `PORT` (default: `8000`)
- `DOMAIN` (from env, default: `bookai.asenaytech.com`)

### Web Service
- `VITE_API_BASE` (from env, default: `https://bookai.asenaytech.com/api`)

**Gap:** No `.env.example` file found in repo root

---

## 5. Health & Ports

| Service | Container Port | Host Port | Healthcheck | Interval | Timeout | Retries | Start Period |
|---------|---------------|-----------|-------------|----------|---------|---------|--------------|
| db | 5432 | - | `pg_isready` | 10s | 5s | 5 | 10s |
| api | 8080 | 8080 | `wget --spider /health` | 10s | 5s | 3 | 20s |
| ocr | 8000 | 8000 | `wget -qO- /health` | 20s | 10s | 5 | 60s |
| web | 5173 | 5173 | `wget --spider /` | 10s | 5s | 3 | 30s |
| nginx | 80 | 80 | none | - | - | - | - |

**All healthchecks configured and working.**

---

## 6. Data Layer

**Status:** ❌ **NO DATABASE SCHEMA FOUND**

- No Prisma schema (`schema.prisma`)
- No SQL migration files
- No ORM setup (no Prisma, Sequelize, TypeORM, etc.)
- No database client initialization in API
- Database container exists but no tables/schema defined

**Required for Phase-1:**
- `documents` table with columns:
  - `id` (UUID or serial)
  - `filename` (string)
  - `mime` (string)
  - `size` (integer)
  - `status` (string: 'pending', 'processing', 'completed', 'failed')
  - `result` (JSONB)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

---

## 7. Gaps for Phase-1

### Critical Missing Features:

1. **❌ OCR Processing Endpoints**
   - No `/ocr/parse` or `/ocr/extract` endpoint
   - No file upload handling in OCR service
   - No image/PDF processing code

2. **❌ API OCR Proxy Endpoint**
   - No `POST /api/ocr/extract` endpoint
   - No file upload handling in API
   - No integration with OCR service

3. **❌ Database Schema & ORM**
   - No database schema defined
   - No ORM (Prisma/Sequelize) installed
   - No database client setup in API
   - No `documents` table

4. **❌ Document Persistence**
   - No save to database after OCR
   - No document retrieval endpoint
   - No `GET /api/documents/:id`

5. **❌ Web UI Routes**
   - No `/status` page (dedicated status page)
   - No `/ocr-tester` page (upload UI)
   - No React Router setup
   - No navigation links

6. **❌ API Documentation**
   - No Swagger/OpenAPI setup
   - No `/api/docs` endpoint
   - No Postman collection

7. **❌ Error Handling**
   - No error responses in API
   - No error UI in web
   - No error logging in OCR

8. **❌ OCR Service Hardening**
   - No PDF processing (pdf2image)
   - No image preprocessing (OpenCV)
   - No field extraction (date, vendor, total, etc.)
   - No confidence scores

9. **❌ Nginx Configuration**
   - No `client_max_body_size` (upload limit)
   - No explicit CORS headers
   - No upload timeout settings

10. **❌ Environment & Docs**
    - No `.env.example` file
    - README needs architecture diagram
    - README needs deployment steps

---

## 8. Proposed Micro-Steps

### Step A: `/status` Page Polish
**Goal:** Dedicated status page with timestamps and recheck button  
**Files:** `apps/web/src/pages/Status.tsx`, router setup  
**Acceptance:** `/status` shows all services with last-checked time

### Step B: OCR Upload API
**Goal:** `POST /api/ocr/extract` with DB persistence  
**Files:** `apps/api/src/routes/ocr.ts`, DB client setup, schema  
**Acceptance:** `curl -F "file=@test.jpg" http://localhost/api/ocr/extract` returns document ID

### Step C: OCR Tester UI
**Goal:** `/ocr-tester` page with drag-drop upload  
**Files:** `apps/web/src/pages/OcrTester.tsx`, upload component  
**Acceptance:** Upload shows parsed JSON + recent documents table

### Step D: OCR Service Hardening
**Goal:** PDF/image processing with field extraction  
**Files:** `services/ocr/app/main.py`, add dependencies, `/parse` endpoint  
**Acceptance:** `curl -F "file=@invoice.pdf" http://localhost/ocr/parse` returns structured fields

### Step E: API Docs & Postman
**Goal:** Swagger UI + Postman collection  
**Files:** Swagger setup, `docs/postman/BookAI.postman_collection.json`  
**Acceptance:** `/api/docs` accessible, Postman collection downloadable

### Step F: README + .env.example
**Goal:** Self-explanatory project docs  
**Files:** `README.md`, `.env.example`  
**Acceptance:** README has architecture, deploy steps; `.env.example` has all vars

### Step G: Nginx Hardening
**Goal:** CORS + upload size limits  
**Files:** `docker/nginx/default.conf`  
**Acceptance:** Uploads up to 20MB work, CORS headers present

### Step H: Error Surfaces
**Goal:** Friendly error messages end-to-end  
**Files:** API error middleware, web error toasts, OCR error logging  
**Acceptance:** Unsupported file shows clear error, no crashes

---

## 9. Current Working State

✅ **What's Working:**
- All containers healthy and running
- Domain resolving correctly
- Health endpoints responding
- Web dashboard showing service status
- Nginx reverse proxy routing correctly
- Docker Compose orchestration working

✅ **Baseline Complete:**
- Infrastructure setup
- Service communication
- Health monitoring
- Basic UI

---

## 10. Phase-1 Completion Criteria

**Done-Done Checklist:**
- [ ] `/status` shows all services Healthy with timestamps
- [ ] `/ocr-tester` uploads image/PDF, returns parsed fields, persists to DB
- [ ] `/api/docs` is live with endpoints documented
- [ ] `.env.example` + README are accurate; `docker compose up -d` works with defaults
- [ ] Nginx accepts uploads up to 20MB; CORS correct for `/api/*`
- [ ] All healthchecks pass; no hanging processes; one-command deploy works

---

**Report Generated:** 2025-11-03  
**Next Action:** Wait for "Next step please" to begin Step A

