#!/bin/bash

# Production Setup Script for Vyeya Platform
# This script helps set up the production environment with all necessary components

set -e

echo "🚀 Vyeya Production Setup"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
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

# Check prerequisites
print_step "Checking prerequisites..."

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 22 ]; then
        print_success "Node.js $NODE_VERSION detected"
    else
        print_error "Node.js 22 or higher required. Current: $(node --version)"
        exit 1
    fi
else
    print_error "Node.js not found. Please install Node.js 22 or higher."
    exit 1
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version | cut -d'.' -f1)
    if [ "$PNPM_VERSION" -ge 9 ]; then
        print_success "pnpm $PNPM_VERSION detected"
    else
        print_warning "pnpm 9 recommended. Current: $(pnpm --version)"
    fi
else
    print_warning "pnpm not found. Installing pnpm..."
    npm install -g pnpm@latest
fi

# Check AWS CLI
if command -v aws &> /dev/null; then
    print_success "AWS CLI detected"
else
    print_error "AWS CLI not found. Please install AWS CLI and configure credentials."
    exit 1
fi

# Check Terraform
if command -v terraform &> /dev/null; then
    print_success "Terraform detected"
else
    print_error "Terraform not found. Please install Terraform."
    exit 1
fi

# Check Docker
if command -v docker &> /dev/null; then
    print_success "Docker detected"
else
    print_error "Docker not found. Please install Docker."
    exit 1
fi

print_step "Installing dependencies..."
pnpm install --frozen-lockfile
print_success "Dependencies installed"

print_step "Building the project..."
pnpm build
print_success "Project built successfully"

print_step "Running tests..."
pnpm test:unit
print_success "Unit tests passed"

print_step "Type checking..."
pnpm type-check
print_success "Type checking passed"

print_step "Linting code..."
pnpm lint
print_success "Code linting passed"

print_step "Building Docker image..."
pnpm docker:build
print_success "Docker image built"

print_step "Running security audit..."
pnpm security:audit || print_warning "Security audit found issues - please review"

echo ""
echo "🎉 Production setup completed successfully!"
echo ""
echo "Next steps:"
echo "==========="
echo "1. Configure AWS credentials: aws configure"
echo "2. Set up GitHub secrets for CI/CD"
echo "3. Initialize Terraform: pnpm infra:init"
echo "4. Plan infrastructure: pnpm infra:plan:dev"
echo "5. Apply infrastructure: pnpm infra:apply:dev"
echo ""
echo "📚 Documentation:"
echo "- Production Deployment: ./PRODUCTION_DEPLOYMENT.md"
echo "- Environment Setup: ./.github/ENVIRONMENTS.md"
echo "- Backend Guide: ./BACKEND.md"
echo "- Setup Guide: ./SETUP.md"
echo ""
echo "🔧 Useful commands:"
echo "- Start development: pnpm dev"
echo "- Run tests: pnpm test"
echo "- Load testing: pnpm load:test"
echo "- Health check: pnpm health:check"
echo ""
print_success "Setup complete! Happy coding! 🚀"
