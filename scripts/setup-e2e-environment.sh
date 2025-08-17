#!/bin/bash

# Pre-E2E Test Environment Setup
# This script ensures all required services and apps are ready for E2E testing

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

print_header "🚀 E2E ENVIRONMENT SETUP"

# Step 1: Check Docker services
print_info "🐳 Checking Docker services..."
if ! docker compose ps | grep -q "Up"; then
    print_info "Starting Docker services..."
    docker compose up -d
    sleep 10
fi

# Verify databases are ready
if docker exec vyeya-postgres pg_isready -U postgres >/dev/null 2>&1; then
    print_success "✅ Main PostgreSQL - Ready"
else
    print_error "❌ Main PostgreSQL - Not ready"
    exit 1
fi

if docker exec vyeya-postgres-test pg_isready -U test -d vyeya_test >/dev/null 2>&1; then
    print_success "✅ Test PostgreSQL - Ready"
else
    print_error "❌ Test PostgreSQL - Not ready" 
    exit 1
fi

# Step 2: Start Metro bundler if not running
print_info "📦 Checking Metro bundler..."
if ! ps aux | grep -E "react-native.*start" | grep -v grep >/dev/null; then
    print_info "Starting Metro bundler..."
    cd packages/app
    npx react-native start --reset-cache &
    METRO_PID=$!
    cd ../..
    sleep 5
    print_success "✅ Metro bundler started (PID: $METRO_PID)"
else
    print_success "✅ Metro bundler already running"
fi

# Step 3: Start backend server if not running
print_info "🔧 Checking backend server..."
if ! curl -s --max-time 5 http://localhost:3000/health >/dev/null 2>&1; then
    print_info "Starting backend server..."
    cd packages/server
    pnpm dev &
    SERVER_PID=$!
    cd ../..
    sleep 5
    
    # Wait for server to be ready
    for i in {1..10}; do
        if curl -s --max-time 5 http://localhost:3000/health >/dev/null 2>&1; then
            print_success "✅ Backend server ready"
            break
        fi
        if [ $i -eq 10 ]; then
            print_error "❌ Backend server failed to start"
            exit 1
        fi
        sleep 2
    done
else
    print_success "✅ Backend server already running"
fi

# Step 4: Check Android setup
print_info "🤖 Checking Android environment..."
if command -v adb >/dev/null; then
    if adb devices | grep -q "device$"; then
        print_success "✅ Android emulator connected"
        
        # Check if app is installed
        if adb shell pm list packages | grep -q "com.vyeya"; then
            print_success "✅ Android app installed"
        else
            print_info "📱 Installing Android app..."
            cd packages/app/android
            ./gradlew installCoreNativeDebug
            cd ../../..
            print_success "✅ Android app installed"
        fi
    else
        print_warning "⚠️ Android emulator not connected"
        print_info "To start Android emulator:"
        print_info "  $ANDROID_HOME/emulator/emulator -avd Medium_Phone_API_36.0 &"
    fi
else
    print_warning "⚠️ ADB not found - Android testing will be skipped"
fi

# Step 5: Check iOS setup  
print_info "📱 Checking iOS environment..."
if command -v xcrun >/dev/null; then
    if xcrun simctl list devices | grep -q "Booted"; then
        BOOTED_DEVICE=$(xcrun simctl list devices | grep "Booted" | head -1 | sed -E 's/.*\(([^)]+)\).*/\1/')
        print_success "✅ iOS simulator booted: $BOOTED_DEVICE"
        
        # Check if app is installed
        if xcrun simctl listapps "$BOOTED_DEVICE" | grep -q "org.reactjs.native.example.Vyeya"; then
            print_success "✅ iOS app installed"
        else
            print_info "📱 Building and installing iOS app..."
            cd packages/app
            npx react-native run-ios --simulator "iPhone 16 Pro" &
            IOS_BUILD_PID=$!
            cd ../..
            
            # Wait for build to complete
            print_info "⏳ Waiting for iOS build to complete (this may take a few minutes)..."
            wait $IOS_BUILD_PID
            print_success "✅ iOS app built and installed"
        fi
    else
        print_warning "⚠️ iOS simulator not booted"
        print_info "To start iOS simulator:"
        print_info "  cd packages/app && npx react-native run-ios"
    fi
else
    print_warning "⚠️ Xcode tools not found - iOS testing will be skipped"
fi

# Step 6: Install Maestro if needed
print_info "🎭 Checking Maestro installation..."
export PATH="$PATH":"$HOME/.maestro/bin"
if command -v maestro >/dev/null; then
    MAESTRO_VERSION=$(maestro --version)
    print_success "✅ Maestro installed: v$MAESTRO_VERSION"
else
    print_info "Installing Maestro..."
    curl -Ls "https://get.maestro.mobile.dev" | bash
    export PATH="$PATH":"$HOME/.maestro/bin"
    print_success "✅ Maestro installed"
fi

print_header "✅ E2E ENVIRONMENT READY"

print_info "📋 Environment Status:"
if docker compose ps | grep -q "Up"; then
    print_success "  ✅ Docker services running"
fi
if curl -s --max-time 5 http://localhost:3000/health >/dev/null 2>&1; then
    print_success "  ✅ Backend server running (port 3000)"
fi
if ps aux | grep -E "react-native.*start" | grep -v grep >/dev/null; then
    print_success "  ✅ Metro bundler running"
fi
if adb devices | grep -q "device$"; then
    print_success "  ✅ Android emulator ready"
fi
if xcrun simctl list devices | grep -q "Booted"; then
    print_success "  ✅ iOS simulator ready"
fi

print_info "🎯 Ready to run E2E tests!"
print_info "   Run: ./scripts/run-e2e-tests.sh"
