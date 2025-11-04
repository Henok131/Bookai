# BookAI

Dockerized monorepo for BookAI with web (React + Vite + Tailwind), API (Node + Express TS), OCR (Python FastAPI), Postgres, and Nginx reverse proxy.

## Architecture

```
┌─────────────┐
│   Nginx     │ :80 (Reverse Proxy)
└──────┬──────┘
       │
       ├─→ /          → Web (React) :5173
       ├─→ /api/*     → API (Express) :8080
       └─→ /ocr/*     → OCR (FastAPI) :8000
                            │
                            └─→ DB (PostgreSQL) :5432
```

## Structure

```
BookAI/
├── apps/
│   ├── api/              # Node + Express TS + Prisma
│   │   ├── prisma/       # Database schema
│   │   ├── src/
│   │   │   ├── routes/   # API endpoints
│   │   │   ├── services/ # Business logic
│   │   │   ├── middleware/# Error handling, validation
│   │   │   └── lib/      # Prisma client
│   │   └── scripts/      # Migration scripts
│   └── web/              # React + Vite + Tailwind
│       └── src/
│           ├── pages/    # Route components
│           └── components/# Reusable components
├── services/
│   └── ocr/              # Python FastAPI OCR service
│       └── app/
│           └── main.py
├── docker/
│   └── nginx/            # Reverse proxy config
└── docker-compose.yml
```

## API Endpoints

### Health
- `GET /api/health` - API health check (includes DB status)

### Documents
- `GET /api/documents` - List recent documents
- `GET /api/documents/:id` - Get document by ID

### OCR
- `POST /api/ocr/extract` - Upload file and extract OCR data
  - Accepts: `multipart/form-data` with `file` field
  - Returns: `{ id, fields, confidenceSummary, status }`

### OCR Service (Direct)
- `GET /ocr/health` - OCR service health
- `POST /ocr/parse` - Parse file (called internally by API)

## Local Development

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### Setup

1. **Clone and configure:**
```bash
git clone https://github.com/Henok131/Bookai.git
cd Bookai
cp .env.example .env
# Edit .env with your values
```

2. **Start services:**
```bash
# Start all services
docker compose up -d

# Run database migrations (first time)
docker compose exec api npx prisma migrate deploy

# Or use npm scripts
npm run up        # docker compose up -d
npm run down      # docker compose down
```

3. **Access services:**
- Web: http://localhost
- API: http://localhost/api/health
- OCR: http://localhost/ocr/health
- Status: http://localhost/status

### Database Migrations

```bash
# Run migrations
docker compose exec api npx prisma migrate deploy

# Generate Prisma client
docker compose exec api npx prisma generate

# Open Prisma Studio (DB GUI)
docker compose exec api npx prisma studio
```

## Environment Variables

See `.env.example` for all required variables:

- `DOMAIN` - Your domain (default: bookai.asenaytech.com)
- `POSTGRES_USER` - Database user (default: bookai)
- `POSTGRES_PASSWORD` - **⚠️ CHANGE IN PRODUCTION**
- `POSTGRES_DB` - Database name (default: bookai)
- `NODE_ENV` - Environment (production/development)
- `CORS_ORIGIN` - Allowed CORS origins (default: *)
- `OCR_SERVICE_URL` - OCR service URL (default: http://ocr:8000)

## Deployment

### VPS Deployment

1. **SSH into VPS:**
```bash
ssh user@your-vps
cd /var/www/bookai.asenaytech.com
```

2. **Pull and deploy:**
```bash
git pull origin main
npm install
docker compose down
docker compose up -d --build

# Run migrations (first time or after schema changes)
docker compose exec api npx prisma migrate deploy
```

### Auto-Deploy Setup

See `scripts/setup-auto-deploy.md` for GitHub webhook or cron-based auto-deployment.

## Troubleshooting

### Database Connection Issues
```bash
# Check database health
docker compose ps db

# Check database logs
docker compose logs db

# Test connection
docker compose exec api npx prisma db push
```

### API Errors
```bash
# Check API logs
docker compose logs api

# Check Prisma client
docker compose exec api npx prisma generate
```

### File Upload Issues
- Check Nginx `client_max_body_size` (set to 20MB)
- Verify file type is allowed (PDF, PNG, JPG, etc.)
- Check API logs for validation errors

See `TROUBLESHOOTING.md` for more details.

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + TypeScript
- **API:** Node.js 18 + Express + TypeScript + Prisma ORM
- **OCR:** Python 3.11 + FastAPI + Tesseract
- **Database:** PostgreSQL 15
- **Reverse Proxy:** Nginx
- **Containerization:** Docker + Docker Compose

## License

Private project - All rights reserved
