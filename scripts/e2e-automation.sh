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
    chmod +x scripts/setup-e2e-environment.sh
    ./scripts/setup-e2e-environment.sh
}

setup_data() {
    print_header "📊 TEST DATA SETUP"
    chmod +x scripts/setup-e2e-data.sh
    ./scripts/setup-e2e-data.sh
}

run_tests() {
    local platform="$1"
    print_header "🧪 RUNNING E2E TESTS"
    chmod +x scripts/run-e2e-tests.sh
    ./scripts/run-e2e-tests.sh "$platform"
}

clean_environment() {
    print_header "🧹 CLEANING ENVIRONMENT"
    
    print_info "Stopping Metro bundler..."
    pkill -f "react-native.*start" || true
    
    print_info "Stopping backend server..."
    pkill -f "ts-node.*server" || true
    pkill -f "pnpm.*dev" || true
    
    print_info "Stopping Android emulator..."
    adb emu kill || true
    
    print_info "Closing iOS simulator..."
    xcrun simctl shutdown all || true
    
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
