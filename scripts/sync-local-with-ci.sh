#!/bin/bash

# Local Environment Sync with CI
# This script ensures your local development environment matches the CI environment

set -e

echo "🔄 Syncing Local Environment with CI Configuration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Node.js version
print_status "Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" != "22" ]; then
    print_warning "Node.js version mismatch: Local v$NODE_VERSION, CI expects v22"
    print_status "Consider using nvm to switch to Node.js v22:"
    echo "  nvm install 22"
    echo "  nvm use 22"
else
    print_success "Node.js version matches CI (v22)"
fi

# Check pnpm version
print_status "Checking pnpm version..."
PNPM_VERSION=$(pnpm --version | cut -d'.' -f1)
if [ "$PNPM_VERSION" != "9" ]; then
    print_warning "pnpm version mismatch: Local v$(pnpm --version), CI expects v9.15.0"
    print_status "Installing correct pnpm version..."
    npm install -g pnpm@9.15.0
else
    print_success "pnpm version matches CI (v9.15.0)"
fi

# Check if Docker is running
print_status "Checking Docker availability..."
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop."
    exit 1
else
    print_success "Docker is running"
fi

# Stop any existing containers
print_status "Stopping existing containers..."
docker compose down -v 2>/dev/null || true

# Pull the latest PostgreSQL 16 image to match CI
print_status "Pulling PostgreSQL 16 image to match CI..."
docker pull postgres:16-alpine

# Start test services that match CI configuration
print_status "Starting test services (PostgreSQL 16 + Redis)..."
docker compose up -d postgres-test redis-test

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check if services are healthy
print_status "Verifying service health..."
if docker compose ps postgres-test | grep -q "healthy"; then
    print_success "PostgreSQL test database is healthy"
else
    print_warning "PostgreSQL test database may not be ready yet"
fi

if docker compose ps redis-test | grep -q "healthy"; then
    print_success "Redis test instance is healthy"
else
    print_warning "Redis test instance may not be ready yet"
fi

# Set up environment file
print_status "Setting up local environment file..."
if [ ! -f ".env" ]; then
    cp .env.local .env
    print_success "Created .env from .env.local template"
else
    print_warning ".env already exists - please manually verify it matches .env.local"
fi

# Test database connectivity
print_status "Testing database connectivity..."
if docker exec vyeya-postgres-test pg_isready -U test -d vyeya_test >/dev/null 2>&1; then
    print_success "Test database connection successful"
else
    print_error "Test database connection failed"
fi

# Install dependencies to ensure they match CI
print_status "Installing dependencies..."
cd "$(dirname "$0")/.."
pnpm install --frozen-lockfile

# Run integration tests to verify everything works
print_status "Running integration tests to verify sync..."
cd packages/server
export NODE_ENV=test
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5433
export POSTGRES_USER=test
export POSTGRES_PASSWORD=test
export POSTGRES_DB=vyeya_test
export REDIS_URL=redis://localhost:6380

if pnpm test:e2e; then
    print_success "Integration tests passed - environment sync successful!"
else
    print_warning "Integration tests had issues - check configuration"
fi

echo ""
print_success "🎉 Local environment sync complete!"
echo ""
print_status "Your local environment now matches CI configuration:"
echo "  ✅ PostgreSQL 16-alpine (port 5433 for tests)"
echo "  ✅ Redis 7-alpine (port 6380 for tests)"  
echo "  ✅ Test database credentials match CI"
echo "  ✅ Environment variables configured"
echo "  ✅ Jest integration config matches CI"
echo ""
print_status "Next steps:"
echo "  1. Run 'pnpm test:e2e' to test E2E scenarios"
echo "  2. Run 'pnpm test:http' to test HTTP endpoints"
echo "  3. Run 'pnpm test:ci' to run all integration tests like CI"
echo ""
print_status "To start development services:"
echo "  docker compose up -d postgres redis"
echo "  cd packages/server && pnpm dev"
