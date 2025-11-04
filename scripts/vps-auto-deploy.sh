#!/bin/bash
# VPS Auto-Deploy Script for BookAI
# This script runs automatically when GitHub webhook is triggered

set -e

PROJECT_DIR="/var/www/bookai.asenaytech.com"
LOG_FILE="/var/log/bookai-deploy.log"

cd "$PROJECT_DIR" || exit 1

echo "[$(date)] Starting auto-deploy..." >> "$LOG_FILE"

# Pull latest changes
git pull origin main >> "$LOG_FILE" 2>&1

# Install dependencies
npm install >> "$LOG_FILE" 2>&1

# Build
npm run build >> "$LOG_FILE" 2>&1

# Restart containers
docker compose down >> "$LOG_FILE" 2>&1
docker compose up -d >> "$LOG_FILE" 2>&1

echo "[$(date)] Auto-deploy completed successfully" >> "$LOG_FILE"

