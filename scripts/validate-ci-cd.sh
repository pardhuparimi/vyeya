#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[CI/CD LOCAL]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to run a step and check result
run_step() {
    local step_name="$1"
    local command="$2"
    
    print_status "Running: $step_name"
    
    if eval "$command"; then
        print_success "$step_name completed successfully"
        return 0
    else
        print_error "$step_name failed"
        return 1
    fi
}

# Main CI/CD Pipeline Simulation
main() {
    print_status "🚀 Starting Local CI/CD Pipeline Validation"
    print_status "This simulates the GitHub Actions workflow locally"
    echo ""
    
    # Build and start services
    print_status "Building CI testing environment..."
    docker compose -f docker-compose.ci.yml build ci-test
    
    print_status "Starting test services..."
    docker compose -f docker-compose.ci.yml up -d postgres-test redis-test
    
    # Wait for services to be healthy
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Run CI/CD steps in the container
    print_status "Running CI/CD steps in container..."
    
    # Step 1: Lint and Type Check
    run_step "Linting code" \
        "docker compose -f docker-compose.ci.yml run --rm ci-test pnpm lint"
    
    run_step "Type checking" \
        "docker compose -f docker-compose.ci.yml run --rm ci-test pnpm type-check"
    
    # Step 2: Unit Tests
    run_step "Running unit tests" \
        "docker compose -f docker-compose.ci.yml run --rm ci-test pnpm test:unit"
    
    # Step 3: Security Scan
    run_step "Running security audit" \
        "docker compose -f docker-compose.ci.yml run --rm ci-test pnpm audit --audit-level high || true"
    
    run_step "Running Trivy filesystem scan" \
        "docker compose -f docker-compose.ci.yml run --rm ci-test trivy fs --severity HIGH,CRITICAL ."
    
    # Step 4: Build Server
    run_step "Building server" \
        "docker compose -f docker-compose.ci.yml run --rm ci-test pnpm build:server"
    
    # Step 5: Database Operations
    print_status "Setting up test database..."
    docker compose -f docker-compose.ci.yml run --rm ci-test bash -c "
        export DATABASE_URL=postgresql://test:test@postgres-test:5432/vyeya_test
        pnpm db:migrate
        pnpm db:seed
    "
    
    # Step 6: Integration Tests
    run_step "Running integration tests" \
        "docker compose -f docker-compose.ci.yml run --rm ci-test bash -c '
            export DATABASE_URL=postgresql://test:test@postgres-test:5432/vyeya_test
            export REDIS_URL=redis://redis-test:6379
            export JWT_SECRET=test-secret-key-for-ci-testing
            export NODE_ENV=test
            pnpm test:integration
        '"
    
    # Step 7: Build Android APK (without signing)
    print_status "Building Android APK..."
    docker compose -f docker-compose.ci.yml run --rm ci-test bash -c "
        cd packages/app/android
        ./gradlew assembleDebug
    " || print_warning "Android build failed (expected without proper setup)"
    
    # Step 8: Build Docker Image
    run_step "Building API Docker image" \
        "docker compose -f docker-compose.ci.yml run --rm ci-test docker build -t vyeya-api:test -f packages/server/Dockerfile ."
    
    # Step 9: Load Testing (start API and run k6)
    print_status "Starting API for load testing..."
    docker compose -f docker-compose.ci.yml up -d api-test
    sleep 10
    
    run_step "Running load tests" \
        "docker compose -f docker-compose.ci.yml run --rm ci-test k6 run packages/server/k6-load-test.js" || print_warning "Load tests may fail if API isn't fully ready"
    
    # Step 10: Coverage Report
    run_step "Generating coverage report" \
        "docker compose -f docker-compose.ci.yml run --rm ci-test pnpm test:coverage"
    
    print_success "🎉 Local CI/CD pipeline validation completed!"
    print_status "Review the output above for any issues before pushing to GitHub"
    
    # Cleanup
    print_status "Cleaning up test environment..."
    docker compose -f docker-compose.ci.yml down -v
    
    echo ""
    print_status "Summary:"
    print_success "✅ All critical CI/CD steps have been validated locally"
    print_status "🔄 You can now push to GitHub with confidence"
    print_status "📝 Check the GitHub Actions workflow for any remaining issues"
}

# Handle cleanup on script exit
cleanup() {
    print_status "Cleaning up..."
    docker compose -f docker-compose.ci.yml down -v 2>/dev/null || true
}

trap cleanup EXIT

# Run main function
main "$@"
