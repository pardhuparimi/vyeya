#!/bin/bash

# Quick Docker Mobile Development Setup
# Start mobile development environment using Docker

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_header() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
}

cd "$(dirname "$0")/.."

print_header "📱 QUICK DOCKER MOBILE SETUP"

print_info "Starting Docker-based mobile development environment..."

# Start services
print_info "Starting backend services..."
docker compose up -d postgres redis

print_info "Building and starting mobile development container..."
docker compose up -d mobile-dev

print_info "Waiting for services to be ready..."
sleep 10

# Check status
if docker ps | grep vyeya-mobile-dev >/dev/null; then
    print_success "Mobile development environment is running!"
else
    echo "❌ Mobile development environment failed to start"
    exit 1
fi

print_header "🎉 DOCKER MOBILE ENVIRONMENT READY"

echo "🔧 Available Commands:"
echo ""
echo "  📱 Start Metro bundler:"
echo "    docker compose exec mobile-dev pnpm start"
echo ""
echo "  🏗️ Build Android app:"
echo "    docker compose exec mobile-dev bash -c 'cd android && ./gradlew assembleDebug'"
echo ""
echo "  🧪 Run tests:"
echo "    docker compose exec mobile-dev pnpm test"
echo ""
echo "  📱 Install on device (connect device first):"
echo "    docker compose exec mobile-dev pnpm android"
echo ""
echo "  🔍 Check container logs:"
echo "    docker compose logs mobile-dev"
echo ""
echo "  🛑 Stop environment:"
echo "    docker compose down mobile-dev"
echo ""

print_success "🚀 No local Android SDK needed - everything runs in Docker!"
print_info "💡 Connect your Android device and run the commands above"
