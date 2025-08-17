#!/bin/bash

# E2E Test Data Setup Script
# This script ensures consistent test data for E2E testing

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info "🔄 Resetting E2E test data..."

# Navigate to server directory
cd "$(dirname "$0")/../packages/server"

# Check if test database is available
if ! docker exec postgres-e2e-test pg_isready -U postgres -d vyeya_e2e >/dev/null 2>&1; then
    print_error "Test database is not ready. Please ensure Docker services are running."
    exit 1
fi

print_info "📊 Clearing existing test data..."

# Clear test database and recreate schema
export NODE_ENV=development
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5433
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=postgres
export POSTGRES_DB=vyeya_e2e
export REDIS_URL=redis://localhost:6380

# Run database initialization script
print_info "🗃️ Initializing test database schema..."
pnpm exec ts-node src/scripts/init-db.ts

print_info "👤 Creating test users for E2E scenarios..."

# Create test users that our E2E tests expect
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@vyeya.com",
    "password": "password",
    "name": "Test Seller",
    "role": "seller"
  }' >/dev/null 2>&1 || print_warning "Seller user may already exist"

curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@vyeya.com", 
    "password": "password",
    "name": "Test Buyer",
    "role": "buyer"
  }' >/dev/null 2>&1 || print_warning "Buyer user may already exist"

# Create a user that will fail login (for negative test cases)
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "correctpassword", 
    "name": "Test User",
    "role": "buyer"
  }' >/dev/null 2>&1 || print_warning "Test user may already exist"

print_success "✅ E2E test data setup completed!"
print_info "📋 Created test users:"
print_info "  • seller@vyeya.com / password (for successful login tests)"
print_info "  • buyer@vyeya.com / password (for buyer role tests)"
print_info "  • test@example.com / correctpassword (valid user, tests use wrong password)"

print_info "🎯 Test scenarios ready:"
print_info "  • Login with seller@vyeya.com + password → Should succeed"
print_info "  • Login with test@example.com + testpassword → Should fail (wrong password)"
print_info "  • Registration flows → Should work with new emails"
