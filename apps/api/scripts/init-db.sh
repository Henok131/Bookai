#!/bin/sh
# Initialize database with Prisma migrations
# This script should be run after the database container is healthy

echo "Waiting for database to be ready..."
sleep 5

echo "Running Prisma migrations..."
npx prisma migrate dev --name init --create-only || npx prisma migrate deploy

echo "Generating Prisma client..."
npx prisma generate

echo "Database initialized successfully!"

