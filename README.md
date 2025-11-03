# BookAI

Dockerized monorepo for BookAI with web (React + Vite + Tailwind), API (Node + Express TS), OCR (Python FastAPI), Postgres, and Nginx reverse proxy.

## Structure

```
/apps
  /web       # React + Vite + Tailwind (TypeScript)
  /api       # Node + Express (TypeScript)
/services
  /ocr       # FastAPI OCR service
/docker
  /nginx     # reverse proxy config
/infra
  env/       # env examples
```

## Local development (Docker)

- Install Docker and Docker Compose
- Copy `.env.example` to `.env` and adjust values
- Run:

```bash
npm run up        # docker compose up -d
npm run down      # docker compose down
npm run dev:docker
```

After starting, access:
- http://localhost/api/health
- http://localhost/ocr/health
- http://localhost/

## Environment

See `.env.example` and files under `infra/env/` for service-specific examples.
