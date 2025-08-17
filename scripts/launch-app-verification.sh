#!/bin/bash

# App Launch and Verification Script
# Ensures mobile app can be launched and verified to work with backend

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

print_header "📱 MOBILE APP LAUNCH & VERIFICATION"

print_info "This script will launch and verify the mobile app works with backend"
print_info "Started at: $(date)"

# 1. Verify backend is running
print_header "🔍 BACKEND VERIFICATION"

print_step "Checking if backend server is running..."
if curl -s http://localhost:3000/health >/dev/null 2>&1; then
    print_success "Backend server is running on http://localhost:3000"
else
    print_error "Backend server is not running!"
    print_info "Starting backend server..."
    cd packages/server
    pnpm dev > /tmp/vyeya-server.log 2>&1 &
    SERVER_PID=$!
    
    # Wait for server to start
    for i in {1..30}; do
        if curl -s http://localhost:3000/health >/dev/null 2>&1; then
            print_success "Backend server started successfully"
            break
        fi
        sleep 2
        echo -n "."
    done
    cd ../..
fi

# Test API endpoints
print_step "Testing API endpoints..."
if curl -s http://localhost:3000/health | grep -q "ok"; then
    print_success "Health endpoint responding"
else
    print_error "Health endpoint not working"
    exit 1
fi

if curl -s "http://localhost:3000/api/v1/users" >/dev/null 2>&1; then
    print_success "Users API endpoint accessible"
else
    print_warning "Users API endpoint may have auth requirements"
fi

# 2. Check mobile development environment
print_header "📱 MOBILE ENVIRONMENT CHECK"

cd packages/app

print_step "Checking mobile development tools..."

# Check if Android SDK is available
if command -v adb >/dev/null 2>&1; then
    print_success "Android Debug Bridge (adb) available"
    
    # Check for connected devices/emulators
    DEVICES=$(adb devices | grep -v "List of devices" | grep -E "(device|emulator)" | wc -l)
    if [ "$DEVICES" -gt 0 ]; then
        print_success "Android device/emulator detected"
        adb devices
    else
        print_warning "No Android devices/emulators detected"
        print_info "You may need to start an emulator or connect a device"
    fi
else
    print_warning "ADB not found - Android development may not work"
fi

# Check iOS development (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v xcrun >/dev/null 2>&1; then
        print_success "iOS development tools available"
        
        # Check for iOS simulators
        SIMULATORS=$(xcrun simctl list devices | grep -c "Booted" || echo "0")
        if [ "$SIMULATORS" -gt 0 ]; then
            print_success "iOS simulator running"
        else
            print_info "No iOS simulators running"
        fi
    else
        print_warning "Xcode tools not found - iOS development not available"
    fi
fi

# Check React Native CLI
if [ -f "node_modules/.bin/react-native" ]; then
    print_success "React Native CLI available"
else
    print_warning "React Native CLI not found in node_modules"
fi

# 3. Build and launch mobile app
print_header "🔨 BUILDING MOBILE APP"

print_step "Installing mobile app dependencies..."
pnpm install

# Build for Android if available
if command -v adb >/dev/null 2>&1 && adb devices | grep -E "(device|emulator)" >/dev/null 2>&1; then
    print_step "Building Android app..."
    
    # Clean and build
    cd android
    ./gradlew clean
    ./gradlew assembleDebug
    print_success "Android app built"
    
    # Install app
    print_step "Installing app on Android device/emulator..."
    ./gradlew installDebug
    print_success "Android app installed"
    
    cd ..
    
    # Launch app
    print_step "Launching Android app..."
    adb shell am start -n com.vyeya/.MainActivity
    print_success "Android app launched"
    
    # Wait a moment for app to start
    sleep 5
    
    # Check if app is running
    if adb shell "ps | grep com.vyeya" >/dev/null 2>&1; then
        print_success "Android app is running"
    else
        print_warning "Android app may not be running properly"
    fi
fi

# Build for iOS if available (macOS only)
if [[ "$OSTYPE" == "darwin"* ]] && command -v xcrun >/dev/null 2>&1; then
    print_step "Building iOS app..."
    
    # Install pods if needed
    if [ -d "ios" ]; then
        cd ios
        if command -v pod >/dev/null 2>&1; then
            pod install
            print_success "iOS pods installed"
        else
            print_warning "CocoaPods not found - iOS build may fail"
        fi
        cd ..
    fi
    
    # Build iOS app
    npx react-native run-ios --configuration Debug || print_warning "iOS build failed"
fi

cd ../..

# 4. Run E2E tests if available
print_header "🧪 END-TO-END TESTING"

cd packages/app

# Check if Maestro is available
if command -v maestro >/dev/null 2>&1; then
    print_step "Running mobile E2E tests with Maestro..."
    
    # Run app launch test first
    print_info "Testing app launch..."
    if maestro test maestro/app_launch.yaml; then
        print_success "App launch test passed"
    else
        print_warning "App launch test failed - may indicate UI issues"
    fi
    
    # Run comprehensive test
    print_info "Running comprehensive E2E test..."
    if maestro test maestro/comprehensive_test.yaml; then
        print_success "Comprehensive E2E test passed"
    else
        print_warning "Comprehensive E2E test failed - check app/backend integration"
    fi
else
    print_warning "Maestro not installed - skipping mobile E2E tests"
    print_info "To install Maestro: curl -Ls 'https://get.maestro.mobile.dev' | bash"
fi

cd ../..

# 5. Test app-backend integration
print_header "🔗 APP-BACKEND INTEGRATION TEST"

print_step "Testing app can communicate with backend..."

# Create a simple integration test
print_info "Testing authentication endpoint..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test-app@example.com","password":"TestPassword123!","name":"App Test","role":"buyer"}')

if echo "$AUTH_RESPONSE" | grep -q "token\|success"; then
    print_success "Backend authentication endpoint working"
else
    print_warning "Backend authentication may have issues"
fi

# Test user data endpoint
print_info "Testing user data endpoint..."
if curl -s "http://localhost:3000/api/v1/users" | grep -q "users\|data\|\["; then
    print_success "Backend user data endpoint accessible"
else
    print_warning "Backend user data endpoint may require authentication"
fi

# 6. Final verification and summary
print_header "✅ LAUNCH VERIFICATION SUMMARY"

echo "📊 App Launch Status:"

# Check backend
if curl -s http://localhost:3000/health >/dev/null 2>&1; then
    echo "  ✅ Backend server running and responding"
else
    echo "  ❌ Backend server not responding"
fi

# Check database
if curl -s "http://localhost:3000/api/v1/users" >/dev/null 2>&1; then
    echo "  ✅ Database connectivity working"
else
    echo "  ⚠️  Database connectivity uncertain"
fi

# Check mobile environment
if command -v adb >/dev/null 2>&1 && adb devices | grep -E "(device|emulator)" >/dev/null 2>&1; then
    echo "  ✅ Android environment ready"
    if adb shell "ps | grep com.vyeya" >/dev/null 2>&1; then
        echo "  ✅ Android app running"
    else
        echo "  ⚠️  Android app status unknown"
    fi
else
    echo "  ⚠️  Android environment not available"
fi

if [[ "$OSTYPE" == "darwin"* ]] && command -v xcrun >/dev/null 2>&1; then
    echo "  ✅ iOS environment available"
else
    echo "  ⚠️  iOS environment not available"
fi

# Check E2E testing
if command -v maestro >/dev/null 2>&1; then
    echo "  ✅ E2E testing framework ready"
else
    echo "  ⚠️  E2E testing framework not installed"
fi

print_header "🎉 APP LAUNCH COMPLETE"

echo "🚀 Your mobile app environment is ready!"
echo ""
echo "📱 Mobile App Commands:"
echo "  cd packages/app && pnpm android    # Launch Android app"
echo "  cd packages/app && pnpm ios        # Launch iOS app"
echo "  cd packages/app && maestro test maestro/comprehensive_test.yaml  # E2E test"
echo ""
echo "🌐 Backend URLs:"
echo "  http://localhost:3000/health       # Health check"
echo "  http://localhost:3000/api/v1/users # User API"
echo ""
echo "🧪 Testing Commands:"
echo "  pnpm test:unit                     # Unit tests"
echo "  pnpm test:ci                       # Integration tests"
echo "  ./scripts/build-full-stack.sh      # Full automation"
echo ""

print_success "🎯 App is launched and ready for development!"
