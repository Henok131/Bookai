# BookAI VPS Deployment Guide

## Initial VPS Setup (First Time Only)

Run these commands on your VPS via SSH:

```bash
# Create deployment directory
sudo mkdir -p /var/www/bookai.asenaytech.com
cd /var/www/bookai.asenaytech.com

# Clone repository
git clone https://github.com/Henok131/Bookai.git .

# Create .env file (copy from example)
cp .env.example .env
# Edit .env with your actual values if needed (defaults are set)

# Install Docker Compose if not already installed
# (Usually pre-installed on Hostinger VPS)

# Build and start services
docker compose up -d --build

# Check container status
docker compose ps

# View logs if needed
docker compose logs -f
```

## Subsequent Deployments (After Initial Setup)

```bash
cd /var/www/bookai.asenaytech.com && \
git pull origin main && \
npm install && \
npm run build && \
docker compose down && \
docker compose up -d --build
```

## Verify Deployment

After deployment, verify endpoints:

- https://bookai.asenaytech.com/api/health
- https://bookai.asenaytech.com/ocr/health
- https://bookai.asenaytech.com

## Troubleshooting

### Check container health
```bash
docker compose ps
```

### View logs
```bash
docker compose logs api
docker compose logs ocr
docker compose logs web
docker compose logs nginx
```

### Restart services
```bash
docker compose restart
```

### Stop all services
```bash
docker compose down
```

