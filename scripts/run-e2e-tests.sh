#!/bin/bash

# Comprehensive E2E Test Runner for Both Platforms
# This script manages device selection and runs platform-specific tests

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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

cd "$(dirname "$0")/.."

print_header "🧪 E2E TEST AUTOMATION SUITE"

# Check if backend is running
print_info "🔍 Checking backend services..."
if ! curl -s --max-time 5 http://localhost:3000/health >/dev/null 2>&1; then
    print_error "Backend server is not running on port 3000"
    print_info "Please start the backend: cd packages/server && pnpm dev"
    exit 1
fi

# Setup test data
print_info "📊 Setting up E2E test data..."
chmod +x scripts/setup-e2e-data.sh
./scripts/setup-e2e-data.sh

# Navigate to app directory
cd packages/app

# Ensure Maestro is available
export PATH="$PATH":"$HOME/.maestro/bin"

# Function to run platform-specific tests
run_android_tests() {
    print_header "🤖 ANDROID E2E TESTS"
    
    # Check if Android emulator is running
    if ! adb devices | grep -q "device$"; then
        print_error "Android emulator is not running"
        print_info "Please start the emulator and install the app:"
        print_info "  $ANDROID_HOME/emulator/emulator -avd Medium_Phone_API_36.0 &"
        print_info "  cd packages/app/android && ./gradlew installCoreNativeDebug"
        return 1
    fi

    print_info "📱 Running Android E2E tests..."
    
    local android_tests=(
        "app_launch.yaml"
        "auth_navigation.yaml" 
        "comprehensive_test.yaml"
        "login_flow.yaml"
    )
    
    local passed=0
    local failed=0
    
    for test in "${android_tests[@]}"; do
        print_info "🔍 Running: $test"
        if maestro test "maestro/$test"; then
            print_success "✅ $test - PASSED"
            ((passed++))
        else
            print_error "❌ $test - FAILED"
            ((failed++))
        fi
        echo ""
    done
    
    print_info "📊 Android Results: $passed passed, $failed failed"
    return $failed
}

run_ios_tests() {
    print_header "📱 iOS E2E TESTS"
    
    # Check if iOS simulator is running
    if ! xcrun simctl list devices | grep -q "Booted"; then
        print_error "iOS simulator is not running"
        print_info "Please start the simulator and build the app:"
        print_info "  cd packages/app && npx react-native run-ios"
        return 1
    fi

    # Need to temporarily stop Android emulator for iOS tests
    local android_running=false
    if adb devices | grep -q "device$"; then
        print_info "⏸️ Temporarily stopping Android emulator for iOS tests..."
        adb emu kill || true
        android_running=true
        sleep 3
    fi

    print_info "📱 Running iOS E2E tests..."
    
    local ios_tests=(
        "ios_app_launch.yaml"
        "ios_navigation_test.yaml"
    )
    
    local passed=0
    local failed=0
    
    for test in "${ios_tests[@]}"; do
        print_info "🔍 Running: $test"
        if maestro test "maestro/$test"; then
            print_success "✅ $test - PASSED"
            ((passed++))
        else
            print_error "❌ $test - FAILED"
            ((failed++))
        fi
        echo ""
    done
    
    print_info "📊 iOS Results: $passed passed, $failed failed"
    
    # Restart Android emulator if it was running
    if [ "$android_running" = true ]; then
        print_info "🔄 Restarting Android emulator..."
        $ANDROID_HOME/emulator/emulator -avd Medium_Phone_API_36.0 -no-audio -no-window &
        sleep 10
    fi
    
    return $failed
}

# Parse command line arguments
PLATFORM="both"
if [ $# -gt 0 ]; then
    PLATFORM="$1"
fi

case $PLATFORM in
    "android")
        run_android_tests
        exit $?
        ;;
    "ios")
        run_ios_tests  
        exit $?
        ;;
    "both"|*)
        print_info "🎯 Running tests on both platforms..."
        
        android_result=0
        ios_result=0
        
        # Run Android tests
        if adb devices | grep -q "device$"; then
            run_android_tests
            android_result=$?
        else
            print_warning "⚠️ Android emulator not available, skipping Android tests"
        fi
        
        # Run iOS tests
        if xcrun simctl list devices | grep -q "Booted"; then
            run_ios_tests
            ios_result=$?
        else
            print_warning "⚠️ iOS simulator not available, skipping iOS tests"
        fi
        
        # Summary
        print_header "📋 FINAL TEST RESULTS"
        
        if [ $android_result -eq 0 ]; then
            print_success "✅ Android tests: PASSED"
        else
            print_error "❌ Android tests: $android_result FAILED"
        fi
        
        if [ $ios_result -eq 0 ]; then
            print_success "✅ iOS tests: PASSED"
        else
            print_error "❌ iOS tests: $ios_result FAILED"
        fi
        
        total_failures=$((android_result + ios_result))
        if [ $total_failures -eq 0 ]; then
            print_success "🎉 ALL E2E TESTS PASSED!"
        else
            print_error "💥 $total_failures test(s) failed"
        fi
        
        exit $total_failures
        ;;
esac
