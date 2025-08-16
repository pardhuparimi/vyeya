#!/bin/bash

# Comprehensive E2E Test Runner
# This script provides idempotent E2E testing by setting up clean data before each test run

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVER_DIR="$(cd "$APP_DIR/../server" && pwd)"
PROJECT_ROOT="$(cd "$APP_DIR/../.." && pwd)"

echo "🎯 Comprehensive E2E Test Runner"
echo "📁 Project Root: $PROJECT_ROOT"
echo "📱 App Directory: $APP_DIR"
echo "🖥️  Server Directory: $SERVER_DIR"

# Function to check if server is running
check_server() {
    if curl -s "http://localhost:3000/health" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start server if needed
ensure_server_running() {
    if check_server; then
        echo "✅ Server is already running"
        return 0
    fi
    
    echo "🚀 Starting server..."
    cd "$SERVER_DIR"
    
    # Start server in background
    pnpm dev > "$APP_DIR/server.log" 2>&1 &
    SERVER_PID=$!
    
    # Wait for server to be ready
    echo "⏳ Waiting for server to start..."
    for i in $(seq 1 30); do
        if check_server; then
            echo "✅ Server started successfully (PID: $SERVER_PID)"
            return 0
        fi
        echo "   Attempt $i/30 - waiting 2s..."
        sleep 2
    done
    
    echo "❌ Server failed to start"
    echo "📋 Server log:"
    tail -20 "$APP_DIR/server.log"
    exit 1
}

# Function to setup test data
setup_test_data() {
    echo "🔄 Setting up idempotent test data..."
    cd "$APP_DIR"
    
    if [ -f "scripts/setup-e2e-data.sh" ]; then
        ./scripts/setup-e2e-data.sh
    else
        echo "❌ Test data setup script not found"
        exit 1
    fi
}

# Function to run backend integration tests
run_backend_tests() {
    echo "🧪 Running backend integration tests..."
    cd "$SERVER_DIR"
    
    echo "📦 Installing dependencies..."
    pnpm install --frozen-lockfile
    
    echo "🧹 Cleaning previous test results..."
    rm -rf coverage/ || true
    
    echo "🔬 Running Jest tests..."
    if pnpm test; then
        echo "✅ Backend tests passed"
        return 0
    else
        echo "❌ Backend tests failed"
        return 1
    fi
}

# Function to run Maestro E2E tests
run_maestro_tests() {
    echo "🎭 Running Maestro E2E tests..."
    cd "$APP_DIR"
    
    # Check if Maestro is installed
    if ! command -v maestro &> /dev/null; then
        echo "❌ Maestro not found. Please install it first:"
        echo "   curl -Ls \"https://get.maestro.mobile.dev\" | bash"
        echo "   export PATH=\"\$PATH\":\"\$HOME/.maestro/bin\""
        return 1
    fi
    
    echo "📱 Maestro version: $(maestro --version)"
    
    # Run individual test files
    local test_files=(
        "maestro/app_launch.yaml"
        "maestro/auth_navigation.yaml"
        "maestro/login_flow.yaml"
        "maestro/comprehensive_test.yaml"
    )
    
    local failed_tests=()
    
    for test_file in "${test_files[@]}"; do
        if [ -f "$test_file" ]; then
            echo "🧪 Running: $test_file"
            if maestro test "$test_file"; then
                echo "   ✅ $test_file passed"
            else
                echo "   ❌ $test_file failed"
                failed_tests+=("$test_file")
            fi
        else
            echo "   ⚠️  Test file not found: $test_file"
        fi
    done
    
    if [ ${#failed_tests[@]} -eq 0 ]; then
        echo "✅ All Maestro tests passed"
        return 0
    else
        echo "❌ Failed tests: ${failed_tests[*]}"
        return 1
    fi
}

# Main execution function
main() {
    local run_backend=true
    local run_maestro=true
    local setup_data=true
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-backend)
                run_backend=false
                shift
                ;;
            --skip-maestro)
                run_maestro=false
                shift
                ;;
            --skip-data-setup)
                setup_data=false
                shift
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --skip-backend      Skip backend integration tests"
                echo "  --skip-maestro      Skip Maestro E2E tests"
                echo "  --skip-data-setup   Skip test data setup"
                echo "  -h, --help          Show this help message"
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                echo "Use -h or --help for usage information"
                exit 1
                ;;
        esac
    done
    
    echo "🏁 Starting comprehensive E2E test suite..."
    echo "⚙️  Configuration:"
    echo "   Backend tests: $([ "$run_backend" = true ] && echo "enabled" || echo "disabled")"
    echo "   Maestro tests: $([ "$run_maestro" = true ] && echo "enabled" || echo "disabled")"
    echo "   Data setup: $([ "$setup_data" = true ] && echo "enabled" || echo "disabled")"
    echo ""
    
    # Ensure server is running
    ensure_server_running
    
    # Setup test data for idempotent tests
    if [ "$setup_data" = true ]; then
        setup_test_data
    fi
    
    local exit_code=0
    
    # Run backend integration tests
    if [ "$run_backend" = true ]; then
        if ! run_backend_tests; then
            exit_code=1
        fi
    fi
    
    # Run Maestro E2E tests
    if [ "$run_maestro" = true ]; then
        if ! run_maestro_tests; then
            exit_code=1
        fi
    fi
    
    echo ""
    if [ $exit_code -eq 0 ]; then
        echo "🎉 All tests completed successfully!"
    else
        echo "💥 Some tests failed. Check the output above for details."
    fi
    
    return $exit_code
}

# Run main function with all arguments
main "$@"
