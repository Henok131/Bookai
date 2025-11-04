# BookAI QA + Awareness Audit (Phase-1 Readiness)

**Date:** 2025-11-04  
**Auditor:** AI Tech Lead + QA  
**Repo:** https://github.com/Henok131/Bookai.git  
**Domain:** https://bookai.asenaytech.com

---

## 1. Repo Tree Snapshot

```
BookAI/
├── apps/
│   ├── api/              # Node + Express TS (single file: index.ts)
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── index.ts  # ⚠️ All logic in one file
│   └── web/              # React + Vite + Tailwind
│       ├── Dockerfile
│       ├── package.json
│       ├── vite.config.ts
│       └── src/
│           ├── App.tsx
│           ├── components/Layout.tsx
│           └── pages/
│               ├── Home.tsx
│               └── Status.tsx
├── services/
│   └── ocr/              # Python FastAPI
│       ├── Dockerfile
│       ├── requirements.txt
│       ├── start.py
│       └── app/
│           └── main.py  # ⚠️ Only 16 lines, minimal logic
├── docker/
│   └── nginx/
│       └── default.conf
├── docker-compose.yml
├── scripts/
│   ├── vps-auto-deploy.sh
│   ├── webhook-receiver.py
│   └── setup-auto-deploy.md
└── [docs: README.md, DEPLOYMENT.md, etc.]
```

**Structure Assessment:** ✅ Clean monorepo structure, but services are extremely minimal

---

## 2. Routing & Services Map

### Web Routes (`apps/web`)
- **GET** `/` → Home page (health dashboard)
- **GET** `/status` → Status page (detailed health monitoring)
- **Routing:** React Router v6 configured correctly
- **Navigation:** Layout component with Home/Status links

**Issues:**
- ⚠️ No 404 handler
- ⚠️ No route guards or authentication
- ⚠️ No loading states during navigation

### API Endpoints (`apps/api`)
- **GET** `/health` → `{ ok: true, service: "api", domain: "..." }`
- **No other routes** (only health endpoint)

**Critical Gaps:**
- ❌ No `/api/ocr/extract` (Phase-1 requirement)
- ❌ No `/api/documents/:id` (Phase-1 requirement)
- ❌ No database connection despite `DATABASE_URL` env var
- ❌ No request validation
- ❌ No error handling middleware

### OCR Endpoints (`services/ocr`)
- **GET** `/` → `{ service: "ocr", status: "running", domain: "..." }`
- **GET** `/health` → `{ ok: true, service: "ocr", domain: "..." }`
- **HEAD** `/health` → (same as GET)

**Critical Gaps:**
- ❌ No `/ocr/parse` endpoint (Phase-1 requirement)
- ❌ No `/ocr/extract` endpoint
- ❌ No file upload handling
- ❌ No OCR processing logic

### Nginx Upstream Mappings
```nginx
location /          → http://web:5173/      ✅
location /api/      → http://api:8080/      ✅
location /ocr/      → http://ocr:8000/      ✅
```

**Issues:**
- 🔴 **No `client_max_body_size`** (will fail on file uploads)
- 🔴 **No explicit CORS headers** (relies on API service CORS)
- 🔴 **No timeout configurations** (proxy_read_timeout, etc.)
- ⚠️ **No rate limiting**
- ⚠️ **No SSL/HTTPS configuration** (port 80 only)

---

## 3. Docker + Container Health

### Docker Compose Structure
```yaml
Services: db, api, ocr, web, nginx
Network: app_net (bridge)
Volumes: pgdata (PostgreSQL data)
```

### Healthcheck Configuration

| Service | Command | Interval | Timeout | Retries | Start Period |
|---------|---------|----------|---------|---------|--------------|
| db | `pg_isready` | 10s | 5s | 5 | 10s ✅ |
| api | `wget --spider /health` | 10s | 5s | 3 | 20s ✅ |
| ocr | `wget -qO- /health` | 20s | 10s | 5 | 60s ⚠️ (long) |
| web | `wget --spider /` | 10s | 5s | 3 | 30s ✅ |
| nginx | none | - | - | - | - ⚠️ (no healthcheck) |

**Issues:**
- ⚠️ OCR healthcheck has 60s start_period (very long, but acceptable for Python startup)
- ⚠️ Nginx has no healthcheck (minor issue, it's stateless)
- ✅ All healthchecks configured correctly

### Port Bindings
- **db:** Internal only (5432)
- **api:** 8080:8080 ✅
- **ocr:** 8000:8000 ✅
- **web:** 5173:5173 ✅
- **nginx:** 80:80 ✅

**Issues:**
- ⚠️ All services exposed on host ports (security risk if firewall not configured)
- ⚠️ No port randomization for security

### Dependencies Order
```yaml
api → depends_on: db (healthy) ✅
web → depends_on: api (healthy) ✅
nginx → depends_on: web, api, ocr (all healthy) ✅
```

**Assessment:** ✅ Dependency chain is correct

---

## 4. Environment Matrix

### Environment Variables Used

| Service | Variable | Default | Source | Risk Level |
|---------|----------|---------|--------|------------|
| **Root** | `DOMAIN` | `bookai.asenaytech.com` | Hardcoded default | ⚠️ Medium |
| **Root** | `POSTGRES_USER` | `bookai` | docker-compose | ⚠️ Medium |
| **Root** | `POSTGRES_PASSWORD` | `bookai_password` | docker-compose | 🔴 **HIGH** |
| **Root** | `POSTGRES_DB` | `bookai` | docker-compose | ⚠️ Low |
| **API** | `PORT` | `8080` | Hardcoded fallback | ⚠️ Medium |
| **API** | `DOMAIN` | `bookai.asenaytech.com` | Hardcoded default | ⚠️ Medium |
| **API** | `DATABASE_URL` | Constructed | docker-compose | ⚠️ Medium |
| **OCR** | `PORT` | `8000` | Hardcoded fallback | ⚠️ Medium |
| **OCR** | `DOMAIN` | `bookai.asenaytech.com` | Hardcoded default | ⚠️ Medium |
| **Web** | `VITE_API_BASE` | `https://bookai.asenaytech.com/api` | Hardcoded | ⚠️ Medium |

**Critical Issues:**
- 🔴 **No `.env.example` file** (users don't know what to configure)
- 🔴 **Default password `bookai_password`** (weak, should be required)
- ⚠️ **Hardcoded domain defaults** (should fail fast if not set in production)
- ⚠️ **No validation** that required env vars are set

**Missing Environment Variables:**
- `NODE_ENV` (API should know if it's production)
- `LOG_LEVEL` (no logging framework configured)
- `OCR_PROVIDER` (if we want to switch Tesseract/PaddleOCR)
- `MAX_UPLOAD_SIZE` (should be configurable)

---

## 5. End-to-End Data Flow Trace

### Current Flow (Phase-0: Health Checks Only)

```
User → Browser → Nginx (port 80)
  → /api/health → API (port 8080)
    → Returns: { ok: true, service: "api", domain: "..." }
  → /ocr/health → OCR (port 8000)
    → Returns: { ok: true, service: "ocr", domain: "..." }
  → /status → Web (port 5173)
    → Fetches /api/health and /ocr/health
    → Displays status cards
```

**Status:** ✅ Working correctly for health checks

### Missing Flow (Phase-1: OCR Upload)

```
User → Browser → /ocr-tester (NOT IMPLEMENTED)
  → File upload → POST /api/ocr/extract (NOT IMPLEMENTED)
    → API validates file (NOT IMPLEMENTED)
    → API calls OCR /parse (NOT IMPLEMENTED)
      → OCR processes file (NOT IMPLEMENTED)
      → Returns: { fields: {...}, confidence: {...} }
    → API saves to DB (NOT IMPLEMENTED)
    → API returns: { id, fields, confidenceSummary }
  → Web displays result (NOT IMPLEMENTED)
```

**Status:** ❌ **Complete data flow missing for Phase-1**

---

## 6. Code-Level Consistency Check

### `apps/web` Analysis

**Routing:**
- ✅ React Router v6 properly configured
- ✅ Layout component with navigation
- ✅ Route structure: `/` (Home), `/status` (Status)

**Fetch Patterns:**
```typescript
// Home.tsx and Status.tsx both use:
fetch(`${apiBase}/health`)
  .then(res => res.json())
  .then(data => setApiStatus(data))
  .catch(err => setApiStatus({ error: err.message }))
```

**Issues:**
- ⚠️ **No request timeout** (could hang indefinitely)
- ⚠️ **No response validation** (assumes JSON, no status check)
- ⚠️ **Error handling inconsistent** (some places use `err.message`, others don't)
- 🔴 **Status.tsx useEffect dependency bug:**
  ```typescript
  useEffect(() => {
    checkHealth()
  }, [])  // ⚠️ Missing: apiStatus used in checkHealth but not in deps
  ```
- ⚠️ **No loading states** (shows "Checking..." but no spinner)
- ⚠️ **No retry logic** (failed fetches fail permanently)

**Error Display:**
- ✅ Shows error messages to user
- ⚠️ No error boundaries (uncaught errors crash app)
- ⚠️ No error logging to backend

**Type Safety:**
- ✅ TypeScript interfaces defined (`ServiceStatus`)
- ⚠️ Some `any` types implicit (fetch responses)
- ⚠️ No runtime validation (TypeScript only)

### `apps/api` Analysis

**File Structure:**
```
apps/api/src/index.ts  (18 lines total)
```

**Issues:**
- 🔴 **All logic in single file** (will become unmaintainable)
- 🔴 **No route separation** (no `/routes/` or `/controllers/`)
- 🔴 **No middleware directory** (error handling, validation, logging)
- 🔴 **No database client** (despite `DATABASE_URL` env var)
- 🔴 **No request validation** (no `express-validator` or similar)
- 🔴 **No error handling middleware** (uncaught errors crash server)
- 🔴 **No logging framework** (only `console.log`)

**Code Patterns:**
```typescript
// Current pattern (minimal):
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'api', domain });
});

// Missing patterns:
// - Request validation
// - Error handling
// - Logging
// - Database connection
// - File upload handling
```

**Response Format:**
- ✅ Health endpoint returns consistent format
- ⚠️ No standardized error response format
- ⚠️ No versioning (no `/api/v1/` prefix)

**CORS:**
- ✅ `app.use(cors())` configured
- ⚠️ No CORS configuration (allows all origins)
- ⚠️ No CORS preflight handling for complex requests

### `services/ocr` Analysis

**File Structure:**
```
services/ocr/app/main.py  (16 lines total)
```

**Issues:**
- 🔴 **Minimal implementation** (only health endpoints)
- 🔴 **No OCR processing logic** (no Tesseract/PaddleOCR usage)
- 🔴 **No file upload handling** (no `UploadFile` from FastAPI)
- 🔴 **No image processing** (no OpenCV, PIL, pdf2image)
- 🔴 **No field extraction** (no regex patterns, no ML models)
- 🔴 **No error handling** (no try/except blocks)
- 🔴 **No logging** (no structured logging)

**Dependencies:**
```python
# requirements.txt (only 2 packages):
fastapi==0.115.0
uvicorn[standard]==0.30.1

# Missing:
# - pillow (image processing)
# - pdf2image (PDF support)
# - opencv-python (image preprocessing)
# - pytesseract (OCR engine)
# - python-multipart (file uploads)
```

**Code Patterns:**
```python
# Current pattern (minimal):
@app.get("/health")
async def health():
    return {"ok": True, "service": "ocr", "domain": DOMAIN}

# Missing patterns:
# - File upload endpoint
# - OCR processing
# - Error handling
# - Logging
```

**Response Format:**
- ✅ Health endpoint consistent
- ⚠️ No standardized error response format
- ⚠️ No versioning

### Shared Logic Consistency

**Response Format:**
- ✅ Health endpoints all return `{ ok: true, service: "...", domain: "..." }`
- ⚠️ No standardized error format (`{ error: "...", hint: "..." }`)
- ⚠️ No versioning strategy

**Error Handling:**
- ❌ **No consistent error handling** across services
- ❌ **No error logging** (no centralized logging)
- ❌ **No error codes** (no HTTP status code consistency)

**Data Contracts:**
- ⚠️ No API documentation (no OpenAPI/Swagger)
- ⚠️ No type definitions shared between services
- ⚠️ No request/response schemas defined

---

## 7. Error Handling & Logging

### API Error Handling

**Current State:**
```typescript
// apps/api/src/index.ts - NO error handling
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'api', domain });
});
```

**Missing:**
- ❌ No error middleware (`app.use((err, req, res, next) => { ... })`)
- ❌ No try/catch blocks
- ❌ No 404 handler
- ❌ No 500 handler
- ❌ No request validation errors
- ❌ No database connection error handling

**Risk:** 🔴 **Any unhandled error crashes the API server**

### OCR Error Handling

**Current State:**
```python
# services/ocr/app/main.py - NO error handling
@app.get("/health")
async def health():
    return {"ok": True, "service": "ocr", "domain": DOMAIN}
```

**Missing:**
- ❌ No try/except blocks
- ❌ No FastAPI exception handlers
- ❌ No input validation errors
- ❌ No OCR processing errors (when implemented)
- ❌ No file format validation errors

**Risk:** 🔴 **Any unhandled error crashes the OCR server**

### Web Error Handling

**Current State:**
```typescript
// apps/web/src/pages/Status.tsx - Basic error handling
catch (err: unknown) {
  setApiStatus({ error: err instanceof Error ? err.message : 'Unknown error', checkedAt: now })
}
```

**Issues:**
- ⚠️ Error handling exists but inconsistent
- ❌ No error boundaries (React component errors crash app)
- ❌ No retry logic
- ❌ No error logging to backend
- ⚠️ Error messages shown to user (good) but no error codes

### Logging

**Current State:**
- API: `console.log()` only
- OCR: No logging (print statements in start.py)
- Web: No logging (client-side only)

**Missing:**
- ❌ No structured logging framework (Winston, Pino, etc.)
- ❌ No log levels (INFO, WARN, ERROR)
- ❌ No centralized logging (no ELK, Loki, etc.)
- ❌ No request logging (no access logs)
- ❌ No error logging (no stack traces saved)

**Risk:** 🔴 **Cannot debug production issues**

---

## 8. Awareness Flags (🔴 Risk Areas)

### 🔴 Critical Risks (Must Fix Before Phase-1)

1. **No Database Schema**
   - `DATABASE_URL` env var set but no DB client
   - No ORM (Prisma, Sequelize, etc.)
   - No migration system
   - **Impact:** Cannot persist documents in Phase-1
   - **Fix:** Add Prisma or raw PostgreSQL client

2. **No File Upload Handling**
   - API has no `multer` or file upload middleware
   - OCR has no `UploadFile` handling
   - Nginx has no `client_max_body_size`
   - **Impact:** Cannot accept files in Phase-1
   - **Fix:** Add file upload support to API + OCR, configure Nginx

3. **No Request Validation**
   - API accepts any request without validation
   - OCR has no input validation
   - **Impact:** Security risk, invalid data crashes services
   - **Fix:** Add `express-validator` or `zod` validation

4. **No Error Handling Middleware**
   - API crashes on any unhandled error
   - OCR crashes on any exception
   - **Impact:** Single error takes down entire service
   - **Fix:** Add error middleware to API, exception handlers to OCR

5. **Hardcoded Default Password**
   - `POSTGRES_PASSWORD` defaults to `bookai_password`
   - **Impact:** Security risk if deployed with defaults
   - **Fix:** Require env var in production, fail fast if missing

### ⚠️ High Risks (Fix Soon)

6. **No Logging Framework**
   - Cannot debug production issues
   - No audit trail
   - **Impact:** Hard to diagnose problems
   - **Fix:** Add Winston/Pino to API, structlog to OCR

7. **No CORS Configuration**
   - `app.use(cors())` allows all origins
   - **Impact:** Security risk, allows any domain to call API
   - **Fix:** Configure allowed origins

8. **No Request Timeouts**
   - Web fetch calls can hang indefinitely
   - **Impact:** Poor UX, resource leaks
   - **Fix:** Add timeout to fetch calls, configure Nginx timeouts

9. **No Response Validation**
   - Web assumes all responses are JSON
   - No status code checking
   - **Impact:** Crashes on unexpected responses
   - **Fix:** Validate response status and content-type

10. **Status.tsx useEffect Dependency Bug**
    - `apiStatus` used in `checkHealth` but not in deps array
    - **Impact:** Stale closure, DB check may use old state
    - **Fix:** Add proper dependencies or refactor logic

### ⚠️ Medium Risks (Fix Later)

11. **Single File Architecture**
    - API: All logic in `index.ts`
    - OCR: All logic in `main.py`
    - **Impact:** Will become unmaintainable
    - **Fix:** Split into routes/controllers/services

12. **No API Versioning**
    - No `/api/v1/` prefix
    - **Impact:** Breaking changes will break clients
    - **Fix:** Add versioning strategy

13. **No Rate Limiting**
    - API can be spammed
    - **Impact:** DoS risk
    - **Fix:** Add rate limiting middleware

14. **No Healthcheck for Nginx**
    - Nginx has no healthcheck
    - **Impact:** Cannot detect Nginx failures
    - **Fix:** Add healthcheck endpoint (optional)

15. **Hardcoded Domain Values**
    - Multiple places hardcode `bookai.asenaytech.com`
    - **Impact:** Hard to change domain or use different environments
    - **Fix:** Use env vars consistently, fail fast if missing

### 📌 Code Smells & Patterns

16. **Magic Values**
    - Ports: `8080`, `8000`, `5173` hardcoded
    - Timeouts: Various hardcoded values
    - **Fix:** Use constants or env vars

17. **Inconsistent Error Format**
    - Some errors return `{ error: "..." }`
    - Some return `{ ok: false }`
    - **Fix:** Standardize error response format

18. **No Loading States**
    - Web shows "Checking..." but no spinner
    - **Impact:** Poor UX during async operations
    - **Fix:** Add loading indicators

19. **No Retry Logic**
    - Failed fetches fail permanently
    - **Impact:** Network glitches cause permanent failures
    - **Fix:** Add exponential backoff retry

20. **Tight Coupling**
    - Web directly calls `/api/health` and `/ocr/health`
    - **Impact:** Cannot change API structure easily
    - **Fix:** Use API client abstraction

---

## 9. Action Plan — Suggested Improvements

### 🛠️ Fix Now (Before Phase-1)

1. **Add Database Client & Schema**
   - Install Prisma or pg (PostgreSQL client)
   - Create `documents` table schema
   - Add migration system
   - **Priority:** 🔴 Critical

2. **Add File Upload Support**
   - Install `multer` for API
   - Add `UploadFile` to OCR
   - Configure Nginx `client_max_body_size 20m`
   - **Priority:** 🔴 Critical

3. **Add Error Handling Middleware**
   - API: Error middleware with `{ error, hint }` format
   - OCR: FastAPI exception handlers
   - Web: Error boundaries + retry logic
   - **Priority:** 🔴 Critical

4. **Add Request Validation**
   - API: `express-validator` or `zod`
   - OCR: Pydantic models for file uploads
   - **Priority:** 🔴 Critical

5. **Fix Status.tsx useEffect Bug**
   - Add proper dependencies or refactor
   - **Priority:** ⚠️ High

### 📌 Fix Later (After Phase-1)

6. **Add Logging Framework**
   - Winston/Pino for API
   - Structlog for OCR
   - **Priority:** ⚠️ High

7. **Split Single Files into Modules**
   - API: `routes/`, `controllers/`, `services/`
   - OCR: `routes/`, `services/`, `utils/`
   - **Priority:** ⚠️ Medium

8. **Add API Versioning**
   - `/api/v1/` prefix
   - Version negotiation
   - **Priority:** ⚠️ Medium

9. **Add CORS Configuration**
   - Whitelist allowed origins
   - Configure credentials
   - **Priority:** ⚠️ Medium

10. **Add Request Timeouts**
    - Fetch timeout in Web
    - Nginx proxy timeouts
    - **Priority:** ⚠️ Medium

---

## 10. Final Verdict

### ❌ Critical Issues Detected — Hold Phase-1 Deployment

**Blocking Issues:**
1. 🔴 No database schema/client (Phase-1 requires document persistence)
2. 🔴 No file upload handling (Phase-1 requires OCR upload)
3. 🔴 No error handling middleware (services will crash)
4. 🔴 No request validation (security risk)
5. 🔴 Hardcoded default password (security risk)

**Status:** Cannot proceed with Phase-1 until blocking issues are resolved.

**Recommendation:**
1. Fix all 🔴 Critical issues first
2. Fix ⚠️ High priority issues (Status.tsx bug, logging)
3. Then proceed with Phase-1 Step B (OCR Upload API)

**Estimated Time to Fix:**
- Critical fixes: 2-3 hours
- High priority fixes: 1-2 hours
- **Total: 3-5 hours before Phase-1 can proceed safely**

---

**Report Generated:** 2025-11-04  
**Next Action:** Fix critical issues before proceeding with Phase-1 Step B

