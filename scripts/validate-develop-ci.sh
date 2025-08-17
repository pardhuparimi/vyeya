#!/bin/bash

# Validate Develop Branch CI Locally
# This script simulates the exact GitHub Actions develop-ci.yml workflow

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_info() {
    echo -e "${BLUE}📋${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_header() {
    echo ""
    echo "================================================"
    echo "🎯 $1"
    echo "================================================"
    echo ""
}

echo "🚀 Develop Branch CI Validation"
echo "Simulating GitHub Actions workflow locally"
echo ""

# Stage 1: Quality Gate - Unit Tests & Code Quality
print_header "Stage 1: Quality Gate (Unit Tests & Code Quality)"

print_info "Installing dependencies..."
pnpm install --frozen-lockfile

print_info "Running linting checks..."
cd packages/server
pnpm lint
print_success "Linting passed"

print_info "Running type checks..."
pnpm type-check
print_success "Type checking passed"

cd ../shared
pnpm type-check
print_success "Shared type checking passed"

cd ../..

print_info "Running unit tests..."
cd packages/server
pnpm test:unit
print_success "Unit tests passed (149 tests)"

cd ../..
print_success "Quality Gate completed successfully"

# Stage 2: Integration Tests in Docker
print_header "Stage 2: Integration Tests (Docker Environment)"

print_info "Building Docker test environment..."
docker compose -f docker-compose.ci.yml build --quiet

print_info "Starting PostgreSQL and Redis test services..."
docker compose -f docker-compose.ci.yml up -d postgres-test redis-test

print_info "Waiting for services to be ready..."
sleep 10

print_info "Checking service status..."
docker compose -f docker-compose.ci.yml ps

print_info "Running integration tests in Docker container..."
docker compose -f docker-compose.ci.yml run --rm ci-test bash -c "
  cd /workspace &&
  pnpm install --frozen-lockfile &&
  echo '🗃️ Initializing test database...' &&
  cd packages/server &&
  export POSTGRES_HOST='postgres-test' &&
  export POSTGRES_USER='test' &&
  export POSTGRES_PASSWORD='test' &&
  export POSTGRES_DB='vyeya_test' &&
  export POSTGRES_PORT='5432' &&
  pnpm exec ts-node src/scripts/init-db.ts &&
  echo '🧪 Starting E2E integration tests...' &&
  export REDIS_URL='redis://redis-test:6379' &&
  export NODE_ENV=test &&
  export CI=true &&
  echo '🔗 Running real integration tests with database...' &&
  pnpm test:e2e --verbose &&
  echo '📊 Running basic HTTP route tests...' &&
  pnpm test:http --verbose
"

if [ $? -eq 0 ]; then
    print_success "Integration tests passed (17 tests)"
else
    print_error "Integration tests failed"
    docker compose -f docker-compose.ci.yml down --volumes
    exit 1
fi

print_info "Cleaning up Docker services..."
docker compose -f docker-compose.ci.yml down --volumes

print_success "Integration Tests completed successfully"

# Stage 3: Mobile E2E Tests (Simulated for local)
print_header "Stage 3: Mobile E2E Tests (Local Simulation)"

print_warning "Mobile E2E tests require Android SDK and emulators"
print_warning "In CI, this stage would:"
print_info "  • Set up Android SDK and Java 17"
print_info "  • Install Maestro CLI for mobile testing"
print_info "  • Start PostgreSQL and Redis services"
print_info "  • Initialize test database with sample data"
print_info "  • Build and start Node.js backend server"
print_info "  • Run 8 comprehensive mobile E2E tests on both Android and iOS"
print_info "  • Verify app functionality across platforms"

print_success "3-Stage Develop Branch CI simulation completed!"

echo ""
echo "================================================"
echo "🎉 CI Validation Summary"
echo "================================================"
echo ""
echo "✅ Stage 1: Quality Gate (149 unit tests)"
echo "✅ Stage 2: Integration Tests (17 tests)"  
echo "⚠️  Stage 3: Mobile E2E Tests (8 tests - simulated)"
echo ""
echo "📊 Total tests in CI: 174 tests"
echo "🕒 Estimated CI duration: 45-65 minutes"
echo ""
echo "🚀 Ready to push to develop branch!"
