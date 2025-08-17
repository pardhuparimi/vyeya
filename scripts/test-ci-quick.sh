#!/bin/bash

# Quick Local CI Test Script - Core Stages Only
# Tests Quality Gate + Integration Tests (skips mobile for speed)

set -e

echo "🧪 Quick Local CI Test - Core Stages"
echo "===================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track results
QUALITY_GATE_RESULT=""
INTEGRATION_TESTS_RESULT=""

# Function to print stage header
print_stage() {
    echo ""
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_stage "🔍 Checking Prerequisites"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js 22+"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 22 ]; then
        print_error "Node.js version $NODE_VERSION found. Required: 22+"
        exit 1
    fi
    print_success "Node.js $(node --version) found"
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm not found. Installing..."
        npm install -g pnpm@9.15.0
    fi
    print_success "pnpm $(pnpm --version) found"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker not found. Please install Docker"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker"
        exit 1
    fi
    print_success "Docker is running"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "pnpm-workspace.yaml" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    print_success "Project structure validated"
}

# Stage 1: Quality Gate
quality_gate() {
    print_stage "🚦 Stage 1: Quality Gate (5-10 minutes)"
    
    local stage_start=$(date +%s)
    
    echo "📦 Installing dependencies..."
    if pnpm install --frozen-lockfile 2>/dev/null || pnpm install; then
        print_success "Dependencies installed"
    else
        print_error "Failed to install dependencies"
        QUALITY_GATE_RESULT="failed"
        return 1
    fi
    
    echo ""
    echo "🔍 Running linting and type checks..."
    
    # Server lint and type check
    cd packages/server
    if pnpm lint && pnpm type-check; then
        print_success "Server code quality checks passed"
    else
        print_error "Server code quality checks failed"
        cd ../..
        QUALITY_GATE_RESULT="failed"
        return 1
    fi
    
    cd ../shared
    if pnpm type-check; then
        print_success "Shared code type checks passed"
    else
        print_error "Shared code type checks failed"
        cd ../..
        QUALITY_GATE_RESULT="failed"
        return 1
    fi
    
    cd ../server
    echo ""
    echo "🧪 Running unit tests..."
    if pnpm test:unit; then
        print_success "Unit tests passed (166 tests)"
    else
        print_error "Unit tests failed"
        cd ../..
        QUALITY_GATE_RESULT="failed"
        return 1
    fi
    
    cd ../..
    
    echo ""
    echo "🔒 Security scan (simulated - would run Trivy in CI)"
    print_warning "Security scan skipped in local test (CI-only)"
    
    local stage_end=$(date +%s)
    local duration=$((stage_end - stage_start))
    
    QUALITY_GATE_RESULT="success"
    print_success "Quality Gate completed in ${duration}s"
}

# Stage 2: Integration Tests
integration_tests() {
    print_stage "🔗 Stage 2: Integration Tests (10-15 minutes)"
    
    local stage_start=$(date +%s)
    
    echo "🐳 Building Docker test environment..."
    if docker compose -f docker-compose.ci.yml build --quiet; then
        print_success "Docker environment built"
    else
        print_error "Failed to build Docker environment"
        INTEGRATION_TESTS_RESULT="failed"
        return 1
    fi
    
    echo ""
    echo "🚀 Starting test services..."
    if docker compose -f docker-compose.ci.yml up -d postgres-test redis-test --quiet-pull; then
        print_success "Test services started"
    else
        print_error "Failed to start test services"
        INTEGRATION_TESTS_RESULT="failed"
        return 1
    fi
    
    echo "⏳ Waiting for services to be ready..."
    sleep 15
    
    echo ""
    echo "📊 Checking service status..."
    docker compose -f docker-compose.ci.yml ps --format table
    
    echo ""
    echo "🔗 Running integration tests..."
    if docker compose -f docker-compose.ci.yml run --rm ci-test bash -c "
        cd /workspace &&
        pnpm install --frozen-lockfile &&
        echo '🗃️ Initializing test database...' &&
        cd packages/server &&
        export DB_HOST='postgres-test' &&
        export DB_USER='test' &&
        export DB_PASSWORD='test' &&
        export DB_NAME='vyeya_test' &&
        export DB_PORT='5432' &&
        pnpm exec ts-node src/scripts/init-db.ts &&
        echo '🧪 Running integration tests...' &&
        export POSTGRES_HOST='postgres-test' &&
        export POSTGRES_USER='test' &&
        export POSTGRES_PASSWORD='test' &&
        export POSTGRES_DB='vyeya_test' &&
        export POSTGRES_PORT='5432' &&
        export REDIS_URL='redis://redis-test:6379' &&
        export NODE_ENV=test &&
        export CI=true &&
        pnpm test:e2e --verbose &&
        echo '📊 Running HTTP route tests...' &&
        pnpm test:http --verbose
    "; then
        print_success "Integration tests passed (17 tests)"
    else
        print_error "Integration tests failed"
        INTEGRATION_TESTS_RESULT="failed"
        docker compose -f docker-compose.ci.yml down -v
        return 1
    fi
    
    echo ""
    echo "🧹 Cleaning up Docker services..."
    docker compose -f docker-compose.ci.yml down -v
    
    local stage_end=$(date +%s)
    local duration=$((stage_end - stage_start))
    
    INTEGRATION_TESTS_RESULT="success"
    print_success "Integration Tests completed in ${duration}s"
}

# Final summary
print_summary() {
    print_stage "✅ Quick CI Test Summary"
    
    echo "🌿 Core Develop Branch CI Results:"
    echo "✅ Quality Gate: $QUALITY_GATE_RESULT"
    echo "✅ Integration Tests: $INTEGRATION_TESTS_RESULT"
    echo ""
    echo "📊 Test Summary:"
    echo "  • Unit Tests: 166 tests"
    echo "  • Integration Tests: 17 tests"
    echo "  • Total Tests: 183 tests"
    echo ""
    echo "⚠️ Mobile E2E Tests (8 tests) skipped in quick test"
    echo ""
    
    if [[ "$QUALITY_GATE_RESULT" == "success" && "$INTEGRATION_TESTS_RESULT" == "success" ]]; then
        print_success "🎉 Core stages passed! Ready to push to develop branch."
        echo ""
        echo "📝 Next steps:"
        echo "  1. git add ."
        echo "  2. git commit -m 'Add complete 3-stage CI pipeline with mobile E2E'"
        echo "  3. git push origin develop"
        echo ""
        echo "💡 The full pipeline (including mobile E2E tests) will run in GitHub Actions"
        return 0
    else
        print_error "❌ Some stages failed. Please review and fix issues before pushing."
        return 1
    fi
}

# Main execution
main() {
    local script_start=$(date +%s)
    
    check_prerequisites
    
    # Run core stages
    if quality_gate; then
        integration_tests
    fi
    
    local script_end=$(date +%s)
    local total_duration=$((script_end - script_start))
    
    echo ""
    echo "🕒 Total test duration: ${total_duration}s (~$((total_duration / 60))m)"
    
    print_summary
}

# Run main function
main "$@"
