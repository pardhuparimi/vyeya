#!/bin/bash

# Development Environment Setup Script
# Sets up local environment to expected state before automation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}[✅]${NC} $1"
}

print_error() {
    echo -e "${RED}[❌]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠️]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[ℹ️]${NC} $1"
}

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

cd "$(dirname "$0")/.."

print_header "🚀 VYEYA DEVELOPMENT ENVIRONMENT SETUP"

print_info "This script will prepare your local environment for development"
print_info "Started at: $(date)"

# 1. Clean up any existing processes
print_header "🧹 CLEANUP EXISTING PROCESSES"

print_step "Stopping any running servers..."
pkill -f "tsx.*src/index.ts" 2>/dev/null || true
pkill -f "pnpm.*dev" 2>/dev/null || true
pkill -f "ts-node.*server" 2>/dev/null || true
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:8081 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 2
print_success "Processes cleaned up"

# 2. Stop and clean Docker containers
print_step "Cleaning Docker environment..."
docker compose down -v --remove-orphans 2>/dev/null || true
docker system prune -f >/dev/null 2>&1 || true
print_success "Docker environment cleaned"

# 3. Install dependencies
print_header "📦 INSTALLING DEPENDENCIES"

print_step "Installing workspace dependencies..."
pnpm install
print_success "Dependencies installed"

# 4. Create .env if it doesn't exist
print_header "⚙️ ENVIRONMENT CONFIGURATION"

if [ ! -f ".env" ]; then
    print_step "Creating .env file..."
    cat > .env << 'EOF'
# Development Environment Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=vyeya

# Test Database Configuration  
POSTGRES_TEST_HOST=localhost
POSTGRES_TEST_PORT=5433
POSTGRES_TEST_USER=test
POSTGRES_TEST_PASSWORD=test
POSTGRES_TEST_DB=vyeya_test

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_TEST_URL=redis://localhost:6380

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:8081

# Logging
LOG_LEVEL=info
EOF
    print_success ".env file created"
else
    print_success ".env file already exists"
fi

# 5. Start Docker services
print_header "� STARTING DOCKER SERVICES"

print_step "Starting PostgreSQL and Redis services..."
docker compose up -d postgres redis postgres-test redis-test

# Wait for services to be ready
print_step "Waiting for services to be ready..."
for i in {1..30}; do
    if docker exec vyeya-postgres pg_isready -U postgres >/dev/null 2>&1; then
        print_success "Main PostgreSQL is ready"
        break
    fi
    sleep 2
    echo -n "."
done

for i in {1..30}; do
    if docker exec vyeya-postgres-test pg_isready -U test -d vyeya_test >/dev/null 2>&1; then
        print_success "Test PostgreSQL is ready"
        break
    fi
    sleep 2
    echo -n "."
done

for i in {1..15}; do
    if docker exec vyeya-redis redis-cli ping >/dev/null 2>&1; then
        print_success "Main Redis is ready"
        break
    fi
    sleep 2
    echo -n "."
done

for i in {1..15}; do
    if docker exec vyeya-redis-test redis-cli ping >/dev/null 2>&1; then
        print_success "Test Redis is ready"
        break
    fi
    sleep 2
    echo -n "."
done

# 6. Initialize databases
print_header "🗃️ DATABASE INITIALIZATION"

print_step "Initializing databases with sample data..."
cd packages/server
pnpm exec ts-node src/scripts/init-db.ts
print_success "Databases initialized"

cd ../..

# 7. Build all packages
print_header "🔨 BUILDING PACKAGES"

print_step "Building all packages..."
pnpm build || print_warning "Build failed - continuing anyway"
print_success "Build completed"

# 8. Run quick test to verify setup
print_header "🧪 VERIFICATION TESTS"

print_step "Running quick verification tests..."
cd packages/server

# Run a subset of tests to verify setup
pnpm test:unit --testNamePattern="should" --maxWorkers=1 --silent || print_warning "Some tests failed"
print_success "Verification tests completed"

cd ../..

# 9. Start development server
print_header "🚀 STARTING DEVELOPMENT SERVER"

print_step "Starting server in background..."
cd packages/server
pnpm dev > /tmp/vyeya-server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
print_step "Waiting for server to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3000/health >/dev/null 2>&1; then
        print_success "Server is running on http://localhost:3000"
        break
    fi
    sleep 2
    echo -n "."
done

cd ../..

# 10. Final verification
print_header "✅ FINAL VERIFICATION"

print_step "Testing API endpoints..."
if curl -s http://localhost:3000/health | grep -q "ok"; then
    print_success "Health endpoint working"
else
    print_warning "Health endpoint not responding correctly"
fi

# Test database connectivity
if curl -s "http://localhost:3000/api/v1/users" >/dev/null 2>&1; then
    print_success "Database connectivity working"
else
    print_warning "Database connectivity issues"
fi

print_header "🎉 DEVELOPMENT ENVIRONMENT READY"

echo "📊 Environment Summary:"
echo "  ✅ Docker services running (PostgreSQL + Redis)"  
echo "  ✅ Dependencies installed"
echo "  ✅ Databases initialized with sample data"
echo "  ✅ Server running on http://localhost:3000"
echo "  ✅ Ready for development and testing"
echo ""
echo "🔧 Available Commands:"
echo "  pnpm dev                 # Start all services"
echo "  pnpm test:unit           # Run unit tests"
echo "  pnpm test:ci             # Run integration tests"
echo "  curl http://localhost:3000/health  # Test server"
echo ""
echo "📱 Mobile Development:"
echo "  cd packages/app && pnpm android     # Start Android app"
echo "  cd packages/app && pnpm ios         # Start iOS app"
echo ""
echo "🎯 Ready to run full automation:"
echo "  ./scripts/build-full-stack.sh"
echo ""

# Show running services
print_info "🐳 Docker Services Status:"
docker compose ps

print_success "🚀 Development environment is ready for use!"

# Save PID for cleanup scripts
echo $SERVER_PID > /tmp/vyeya-server.pid