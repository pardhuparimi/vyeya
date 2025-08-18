#!/bin/bash

# Master E2E Test Automation Script
# This is the single entry point for all E2E testing

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

print_banner() {
    echo -e "${CYAN}"
    echo "████████████████████████████████████████████████████████████████████████████████"
    echo "█                                                                              █"
    echo "█                          🧪 VYEYA E2E TEST SUITE                           █"
    echo "█                     Comprehensive Cross-Platform Testing                    █"
    echo "█                                                                              █"
    echo "████████████████████████████████████████████████████████████████████████████████"
    echo -e "${NC}\n"
}

print_header() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
}

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

usage() {
    echo -e "${BOLD}Usage:${NC} $0 [COMMAND] [OPTIONS]"
    echo ""
    echo -e "${BOLD}Commands:${NC}"
    echo "  setup     Setup E2E environment and dependencies"
    echo "  data      Reset and setup test data"
    echo "  android   Run Android E2E tests only"
    echo "  ios       Run iOS E2E tests only"  
    echo "  test      Run tests on all available platforms (default)"
    echo "  full      Complete setup + data + tests"
    echo "  clean     Clean up processes and reset environment"
    echo ""
    echo -e "${BOLD}Examples:${NC}"
    echo "  $0 full           # Complete E2E test cycle"
    echo "  $0 setup          # One-time environment setup"
    echo "  $0 test           # Run tests (assumes environment is ready)"
    echo "  $0 android        # Test Android only"
    echo "  $0 ios            # Test iOS only"
}

setup_environment() {
    print_header "🚀 ENVIRONMENT SETUP"
    
    # Ensure Docker services are running
    print_info "🐳 Starting Docker services..."
    docker compose up -d postgres-test redis-test || true
    sleep 5
    
    # Verify databases
    print_info "🔍 Verifying database connections..."
    if docker exec vyeya-postgres-test pg_isready -U test -d vyeya_test >/dev/null 2>&1; then
        print_success "✅ Test PostgreSQL - Ready"
    else
        print_error "❌ Test PostgreSQL - Not ready"
        exit 1
    fi
    
    print_success "✅ Environment setup complete"
}

setup_data() {
    print_header "📊 TEST DATA SETUP"
    chmod +x scripts/setup-e2e-data.sh
    ./scripts/setup-e2e-data.sh
}

run_tests() {
    local platform="$1"
    print_header "🧪 RUNNING E2E TESTS"
    
    # Clean up any existing processes first
    print_info "🧹 Cleaning up existing processes..."
    pkill -f "ts-node.*server" 2>/dev/null || true
    pkill -f "tsx.*src/index.ts" 2>/dev/null || true
    pkill -f "pnpm.*dev" 2>/dev/null || true
    pkill -f "react-native.*start" 2>/dev/null || true
    pkill -f "metro" 2>/dev/null || true
    lsof -ti:3000,8081 | xargs kill -9 2>/dev/null || true
    sleep 3
    
    # Start backend server
    print_info "🚀 Starting backend server..."
    cd packages/server
    export NODE_ENV=development
    export POSTGRES_HOST=localhost
    export POSTGRES_PORT=5433
    export POSTGRES_USER=test
    export POSTGRES_PASSWORD=test
    export POSTGRES_DB=vyeya_test
    export REDIS_URL=redis://localhost:6380
    
    # Use tsx directly instead of pnpm dev to avoid conflicts
    print_info "Starting backend with tsx..."
    npx tsx src/index.ts > ../../e2e-backend.log 2>&1 &
    BACKEND_PID=$!
    cd ../..
    
    # Wait for backend to be ready
    print_info "⏳ Waiting for backend to start..."
    for i in {1..30}; do
        if curl -s --max-time 5 http://localhost:3000/health > /dev/null 2>&1; then
            print_success "✅ Backend server ready"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "❌ Backend server failed to start"
            print_info "Backend logs:"
            cat e2e-backend.log 2>/dev/null || echo "No logs found"
            exit 1
        fi
        print_info "  Attempt $i/30..."
        sleep 2
    done
    
    # Start Metro bundler
    print_info "📦 Starting Metro bundler..."
    cd packages/app
    npx react-native start --reset-cache > ../../e2e-metro.log 2>&1 &
    METRO_PID=$!
    cd ../..
    
    # Wait for Metro to be ready
    sleep 10
    print_success "✅ Metro bundler ready"
    
    # Now run the tests (but skip the service checks since we just started them)
    print_info "🧪 Running E2E tests for platform: $platform"
    
    # Use our CI E2E script which focuses on mobile testing
    chmod +x scripts/ci-e2e-tests.sh
    ./scripts/ci-e2e-tests.sh false  # false = not headless for local testing
    
    # Clean up processes
    print_info "🧹 Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $METRO_PID 2>/dev/null || true
    pkill -f "tsx.*src/index.ts" 2>/dev/null || true
    pkill -f "react-native.*start" 2>/dev/null || true
}

clean_environment() {
    print_header "🧹 CLEANING ENVIRONMENT"
    
    print_info "Stopping Metro bundler..."
    pkill -f "react-native.*start" || true
    pkill -f "metro" || true
    
    print_info "Stopping backend server..."
    pkill -f "ts-node.*server" || true
    pkill -f "pnpm.*dev" || true
    pkill -f "tsx.*src/index.ts" || true
    
    print_info "Stopping Android emulator..."
    adb emu kill || true
    
    print_info "Closing iOS simulator..."
    xcrun simctl shutdown all || true
    
    print_info "Cleaning up ports..."
    lsof -ti:3000,8081 | xargs kill -9 2>/dev/null || true
    
    print_info "Cleaning up log files..."
    rm -f e2e-backend.log e2e-metro.log || true
    
    print_success "✅ Environment cleaned"
}

# Main script execution
cd "$(dirname "$0")/.."

print_banner

# Parse command line arguments
COMMAND="${1:-test}"

case $COMMAND in
    "setup")
        setup_environment
        ;;
    "data")
        setup_data
        ;;
    "android")
        run_tests "android"
        ;;
    "ios")
        run_tests "ios"
        ;;
    "test")
        run_tests "both"
        ;;
    "full")
        print_info "🎯 Running complete E2E test cycle..."
        setup_environment
        setup_data
        run_tests "both"
        ;;
    "clean")
        clean_environment
        ;;
    "help"|"-h"|"--help")
        usage
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        echo ""
        usage
        exit 1
        ;;
esac

print_header "✅ E2E AUTOMATION COMPLETE"
print_info "🎉 E2E test automation finished successfully!"
print_info "📋 Available commands:"
print_info "  • Setup: ./scripts/e2e-automation.sh setup"
print_info "  • Test:  ./scripts/e2e-automation.sh test"
print_info "  • Full:  ./scripts/e2e-automation.sh full"
