#!/bin/sh
# Prisma migration script for Docker
# Run this inside the API container to migrate database

cd /app
npx prisma migrate deploy
npx prisma generate

