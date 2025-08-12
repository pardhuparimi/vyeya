#!/bin/bash

echo "🚀 Starting Vyeya development environment..."

# Start Docker services
echo "📦 Starting PostgreSQL and Redis..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec postgres pg_isready -U postgres; do
  sleep 2
done

echo "✅ Database is ready!"

# Start the backend server
echo "🔧 Starting backend server..."
cd packages/server && pnpm dev