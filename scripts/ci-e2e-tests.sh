#!/bin/bash

# CI/CD E2E Test Script - Headless Mode
# This script runs E2E tests in headless mode suitable for CI/CD pipelines

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_banner() {
    echo -e "${CYAN}"
    echo "████████████████████████████████████████████████████████████████████████████████"
    echo "█                                                                              █"
    echo "█                     🤖 CI/CD E2E TEST AUTOMATION                            █"
    echo "█                        Headless Mode for Pipelines                          █"
    echo "█                                                                              █"
    echo "████████████████████████████████████████████████████████████████████████████████"
    echo -e "${NC}\n"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running in CI environment
if [[ "$CI" == "true" ]] || [[ "$GITHUB_ACTIONS" == "true" ]]; then
    print_info "🤖 Running in CI environment - using headless mode"
    HEADLESS_MODE=true
else
    print_info "💻 Running locally - checking for headless flag"
    HEADLESS_MODE=${1:-false}
fi

print_banner

# Step 1: Backend Tests
print_info "🧪 Running backend tests..."
cd packages/server
if ! pnpm test; then
    print_error "Backend unit tests failed"
    exit 1
fi

if ! pnpm test:integration; then
    print_error "Backend integration tests failed"
    exit 1
fi
cd ../..
print_success "✅ Backend tests passed"

# Step 2: Start Services
print_info "🚀 Starting services..."

# Kill any existing processes
pkill -f "tsx.*src/index.ts" || true
pkill -f "react-native.*start" || true
pkill -f "metro" || true

# Start backend
cd packages/server
NODE_ENV=test pnpm dev &
BACKEND_PID=$!
cd ../..

# Start Metro
cd packages/app
npx react-native start --reset-cache &
METRO_PID=$!
cd ../..

print_info "⏳ Waiting for services to start..."
sleep 10

# Verify backend is running
for i in {1..30}; do
    if netstat -an | grep -q ":3000.*LISTEN"; then
        print_success "✅ Backend server ready (listening on port 3000)"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "❌ Backend server failed to start"
        # Try to get server logs
        print_info "Server process status:"
        ps aux | grep tsx || true
        exit 1
    fi
    sleep 2
done

# Step 3: Setup Test Data
print_info "📊 Setting up test data..."
chmod +x scripts/setup-e2e-data.sh
./scripts/setup-e2e-data.sh

# Step 4: Android Tests
print_info "🤖 Running Android E2E tests..."

if [[ "$HEADLESS_MODE" == "true" ]]; then
    # CI Mode - headless emulator
    if [[ "$CI" == "true" ]]; then
        # Assume emulator is already running in CI
        print_info "Using CI emulator..."
    else
        # Local headless mode
        /Users/pardhu/Library/Android/sdk/emulator/emulator -avd Medium_Phone_API_36.0 -no-audio -no-window &
        EMULATOR_PID=$!
        adb wait-for-device
        sleep 30
    fi
else
    # Local visible mode - check if emulator is running
    if ! adb devices | grep -q "device$"; then
        print_info "Starting visible Android emulator..."
        /Users/pardhu/Library/Android/sdk/emulator/emulator -avd Medium_Phone_API_36.0 &
        EMULATOR_PID=$!
        adb wait-for-device
        sleep 30
    fi
fi

# Install Android app
cd packages/app/android
./gradlew installCoreNativeDebug
cd ../../..

# Run Android E2E tests
cd packages/app
export PATH="$PATH:$HOME/.maestro/bin"

ANDROID_TESTS=(
    "maestro/app_launch.yaml"
    "maestro/auth_navigation.yaml"
    "maestro/comprehensive_test.yaml"
    "maestro/login_flow.yaml"
)

ANDROID_PASSED=0
ANDROID_FAILED=0

for test in "${ANDROID_TESTS[@]}"; do
    print_info "🔍 Running: $test"
    if maestro test "$test"; then
        print_success "✅ $test - PASSED"
        ((ANDROID_PASSED++))
    else
        print_error "❌ $test - FAILED"
        ((ANDROID_FAILED++))
    fi
done

print_info "📊 Android Results: $ANDROID_PASSED passed, $ANDROID_FAILED failed"

# Step 5: iOS Tests (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    print_info "🍎 Running iOS E2E tests..."
    
    # Stop Android emulator to free resources
    if [[ -n "$EMULATOR_PID" ]]; then
        adb emu kill || true
    fi
    
    # Start iOS simulator
    if [[ "$HEADLESS_MODE" == "true" ]]; then
        # For CI - use xcrun simctl boot
        DEVICE_ID=$(xcrun simctl list devices | grep "iPhone 16 Pro" | head -1 | sed 's/.*(\([^)]*\)).*/\1/')
        if [[ -n "$DEVICE_ID" ]]; then
            xcrun simctl boot "$DEVICE_ID"
        fi
    else
        # For local - open visible simulator
        open -a Simulator
    fi
    
    # Build and install iOS app
    npx react-native run-ios --simulator "iPhone 16 Pro"
    
    IOS_TESTS=(
        "maestro/ios_app_launch.yaml"
        "maestro/ios_navigation_test.yaml"
        "maestro/ios_comprehensive_test.yaml"
        "maestro/ios_login_flow.yaml"
    )
    
    IOS_PASSED=0
    IOS_FAILED=0
    
    for test in "${IOS_TESTS[@]}"; do
        print_info "🔍 Running: $test"
        if maestro test "$test"; then
            print_success "✅ $test - PASSED"
            ((IOS_PASSED++))
        else
            print_error "❌ $test - FAILED"
            ((IOS_FAILED++))
        fi
    done
    
    print_info "📊 iOS Results: $IOS_PASSED passed, $IOS_FAILED failed"
else
    print_info "⏭️ Skipping iOS tests (not on macOS)"
    IOS_PASSED=0
    IOS_FAILED=0
fi

cd ../..

# Cleanup
print_info "🧹 Cleaning up..."
kill $BACKEND_PID $METRO_PID 2>/dev/null || true
if [[ -n "$EMULATOR_PID" ]]; then
    kill $EMULATOR_PID 2>/dev/null || true
fi
adb emu kill 2>/dev/null || true
xcrun simctl shutdown all 2>/dev/null || true

# Summary
TOTAL_PASSED=$((ANDROID_PASSED + IOS_PASSED))
TOTAL_FAILED=$((ANDROID_FAILED + IOS_FAILED))
TOTAL_TESTS=$((TOTAL_PASSED + TOTAL_FAILED))

echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  📊 FINAL RESULTS${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TOTAL_PASSED${NC}"
echo -e "${RED}Failed: $TOTAL_FAILED${NC}"

if [[ $TOTAL_FAILED -eq 0 ]]; then
    print_success "🎉 All E2E tests passed!"
    exit 0
else
    print_error "💥 Some E2E tests failed!"
    exit 1
fi
