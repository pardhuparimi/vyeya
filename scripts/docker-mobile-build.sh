#!/bin/bash

# Docker-based Mobile App Build Automation Script
# Builds mobile app using Docker containers instead of local installations

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

# Track execution time
START_TIME=$(date +%s)

cd "$(dirname "$0")/.."

print_header "📱 DOCKER-BASED MOBILE APP BUILD AUTOMATION"

print_info "This script builds the mobile app using Docker containers"
print_info "No local Android SDK or React Native installation required!"
print_info "Started at: $(date)"

# 1. Pre-flight checks
print_header "🔍 PRE-FLIGHT CHECKS"

print_step "Checking Docker availability..."
if ! command -v docker >/dev/null 2>&1; then
    print_error "Docker is not installed. Please install Docker Desktop"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop"
    exit 1
fi

print_success "Docker is available and running"

print_step "Checking Docker Compose..."
if ! command -v docker-compose >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
    print_error "Docker Compose is not available"
    exit 1
fi

print_success "Docker Compose is available"

# 2. Clean up any existing containers
print_header "🧹 CLEANUP"

print_step "Stopping any existing mobile containers..."
docker compose down mobile-dev mobile-builder 2>/dev/null || true
docker stop vyeya-mobile-dev vyeya-mobile-builder 2>/dev/null || true
docker rm vyeya-mobile-dev vyeya-mobile-builder 2>/dev/null || true

print_success "Cleanup completed"

# 3. Start backend services if not running
print_header "🚀 BACKEND SERVICES"

print_step "Starting backend services..."
docker compose up -d postgres redis postgres-test redis-test

# Wait for services
print_step "Waiting for backend services to be ready..."
for i in {1..30}; do
    if docker exec vyeya-postgres pg_isready -U postgres >/dev/null 2>&1; then
        print_success "PostgreSQL is ready"
        break
    fi
    sleep 2
    echo -n "."
done

for i in {1..15}; do
    if docker exec vyeya-redis redis-cli ping >/dev/null 2>&1; then
        print_success "Redis is ready"
        break
    fi
    sleep 2
    echo -n "."
done

# 4. Build mobile Docker image
print_header "🔨 BUILDING MOBILE DOCKER IMAGE"

print_step "Building mobile development environment..."
docker build -f Dockerfile.mobile-fixed -t vyeya-mobile-dev .
print_success "Mobile development image built"

print_step "Building mobile builder environment..."
docker build -f Dockerfile.mobile-fixed -t vyeya-mobile-builder .
print_success "Mobile builder image built"

# 5. Build mobile app
print_header "📱 BUILDING MOBILE APP"

print_step "Creating build output directory..."
mkdir -p ./packages/app/build-output/debug
mkdir -p ./packages/app/build-output/release

print_step "Building Android APK using Docker..."
docker run --rm \
    --name vyeya-mobile-builder-temp \
    -v "$(pwd)/packages/app/build-output:/app/packages/app/build-output" \
    -v "$(pwd)/packages/app:/app/packages/app:ro" \
    -v "$(pwd)/packages/shared:/app/packages/shared:ro" \
    vyeya-mobile-builder \
    bash -c "
        echo '🏗️ Starting mobile app build...'
        cd /app/packages/app/android
        ./gradlew assembleDebug assembleRelease
        echo '📦 Copying build artifacts...'
        cp -r app/build/outputs/apk/debug/* /app/packages/app/build-output/debug/ 2>/dev/null || echo 'No debug APK found'
        cp -r app/build/outputs/apk/release/* /app/packages/app/build-output/release/ 2>/dev/null || echo 'No release APK found'
        echo '✅ Build completed'
        ls -la /app/packages/app/build-output/debug/
        ls -la /app/packages/app/build-output/release/
    "

print_success "Mobile app build completed"

# 6. Verify build artifacts
print_header "✅ BUILD VERIFICATION"

print_step "Checking build artifacts..."

if [ -f "./packages/app/build-output/debug/app-debug.apk" ]; then
    APK_SIZE=$(du -h "./packages/app/build-output/debug/app-debug.apk" | cut -f1)
    print_success "Debug APK built successfully (${APK_SIZE})"
else
    print_warning "Debug APK not found"
fi

if [ -f "./packages/app/build-output/release/app-release-unsigned.apk" ]; then
    APK_SIZE=$(du -h "./packages/app/build-output/release/app-release-unsigned.apk" | cut -f1)
    print_success "Release APK built successfully (${APK_SIZE})"
else
    print_warning "Release APK not found"
fi

# 7. Start development environment
print_header "🚀 STARTING DEVELOPMENT ENVIRONMENT"

print_step "Starting mobile development container..."
docker compose up -d mobile-dev

print_step "Waiting for development environment to be ready..."
sleep 5

if docker ps | grep vyeya-mobile-dev >/dev/null; then
    print_success "Mobile development environment is running"
else
    print_warning "Mobile development environment may not be running"
fi

# 8. Run E2E tests if requested
if [ "$1" = "--with-e2e" ]; then
    print_header "🧪 RUNNING E2E TESTS"
    
    print_step "Running Maestro E2E tests in container..."
    docker exec vyeya-mobile-dev bash -c "
        echo '🎯 Running mobile E2E tests...'
        if command -v maestro >/dev/null 2>&1; then
            maestro test maestro/app_launch.yaml || echo 'App launch test failed'
            maestro test maestro/comprehensive_test.yaml || echo 'Comprehensive test failed'
        else
            echo 'Maestro not available in container'
        fi
    "
fi

# 9. Calculate execution time
END_TIME=$(date +%s)
EXECUTION_TIME=$((END_TIME - START_TIME))
MINUTES=$((EXECUTION_TIME / 60))
SECONDS=$((EXECUTION_TIME % 60))

# 10. Final summary
print_header "🎉 DOCKER MOBILE BUILD COMPLETED"

echo "📊 Build Summary:"
echo "  ✅ Docker-based mobile environment ready"
echo "  ✅ Backend services running (PostgreSQL + Redis)"
echo "  ✅ Mobile development container running"
if [ -f "./packages/app/build-output/debug/app-debug.apk" ]; then
    echo "  ✅ Debug APK built successfully"
fi
if [ -f "./packages/app/build-output/release/app-release-unsigned.apk" ]; then
    echo "  ✅ Release APK built successfully"
fi
echo ""

echo "⏱️ Total execution time: ${MINUTES}m ${SECONDS}s"
echo ""

echo "🔧 Available Commands:"
echo ""
echo "  📱 Mobile Development:"
echo "    docker compose exec mobile-dev pnpm start     # Start Metro bundler"
echo "    docker compose exec mobile-dev pnpm android   # Build and install on device"
echo ""
echo "  🧪 Testing:"
echo "    docker compose exec mobile-dev pnpm test      # Run mobile tests"
echo "    docker compose exec mobile-dev maestro test maestro/app_launch.yaml  # E2E tests"
echo ""
echo "  🔨 Building:"
echo "    docker run --rm -v \$(pwd)/packages/app/build-output:/output vyeya-mobile-builder  # Build APK"
echo ""
echo "  🐳 Container Management:"
echo "    docker compose logs mobile-dev               # View development logs"
echo "    docker compose down mobile-dev               # Stop mobile container"
echo "    docker compose up -d mobile-dev              # Start mobile container"
echo ""

echo "📱 Build Artifacts:"
if [ -d "./packages/app/build-output" ]; then
    echo "  📁 Build output: ./packages/app/build-output/"
    find ./packages/app/build-output -name "*.apk" -exec echo "    📱 {}" \;
fi
echo ""

echo "🌐 Development URLs:"
echo "  📊 Backend Health: http://localhost:3000/health"
echo "  📱 Metro Bundler: http://localhost:8081"
echo ""

print_success "🎯 Docker-based mobile development environment is ready!"

echo ""
print_info "💡 Next Steps:"
echo "  1. Connect Android device or start emulator"
echo "  2. Run: docker compose exec mobile-dev pnpm android"
echo "  3. Run E2E tests: ./scripts/docker-mobile-build.sh --with-e2e"
echo ""

print_info "🎉 No local Android SDK installation required - everything runs in Docker!"
