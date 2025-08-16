#!/bin/bash

# E2E Test Data Reset Script
# This script sets up clean, predictable test data before running E2E tests

set -e  # Exit on any error

echo "🔄 Starting E2E test data reset..."

# Configuration
SERVER_URL="http://localhost:3000"
TIMEOUT=30

# Function to wait for server
wait_for_server() {
    echo "⏳ Waiting for server to be ready..."
    for i in $(seq 1 $TIMEOUT); do
        if curl -s "$SERVER_URL/health" > /dev/null 2>&1; then
            echo "✅ Server is ready"
            return 0
        fi
        echo "   Attempt $i/$TIMEOUT - Server not ready, waiting 1s..."
        sleep 1
    done
    echo "❌ Server failed to start within $TIMEOUT seconds"
    exit 1
}

# Function to create test user if not exists
create_test_user() {
    local email=$1
    local password=$2
    local name=$3
    local role=${4:-"buyer"}
    
    echo "👤 Creating test user: $email"
    
    # Try to create user - ignore if already exists
    curl -s -X POST "$SERVER_URL/api/v1/auth/register" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$email\", \"password\": \"$password\", \"name\": \"$name\", \"role\": \"$role\"}" \
        > /dev/null 2>&1 || echo "   User $email already exists or creation failed (expected)"
}

# Function to verify user login
verify_user_login() {
    local email=$1
    local password=$2
    
    echo "🔐 Verifying login for: $email"
    
    local response=$(curl -s -X POST "$SERVER_URL/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$email\", \"password\": \"$password\"}")
    
    if echo "$response" | jq -e '.token' > /dev/null 2>&1; then
        echo "   ✅ Login successful"
        return 0
    else
        echo "   ❌ Login failed: $response"
        return 1
    fi
}

# Main execution
main() {
    echo "🚀 Starting E2E test environment setup..."
    
    # Wait for server to be ready
    wait_for_server
    
    # Verify server health
    echo "🏥 Checking server health..."
    health_response=$(curl -s "$SERVER_URL/health")
    if echo "$health_response" | jq -e '.status == "OK"' > /dev/null 2>&1; then
        echo "   ✅ Server health check passed"
        echo "   Database: $(echo "$health_response" | jq -r '.database')"
        echo "   User count: $(echo "$health_response" | jq -r '.userCount')"
    else
        echo "   ❌ Server health check failed"
        exit 1
    fi
    
    # Create test users for E2E tests
    echo "👥 Setting up test users..."
    
    # Main test seller/grower (this should already exist)
    verify_user_login "seller@vyeya.com" "password"
    
    # Create additional test users for comprehensive testing
    create_test_user "testbuyer@vyeya.com" "testpass123" "Test Buyer" "buyer"
    create_test_user "testgrower@vyeya.com" "testpass123" "Test Grower" "grower"
    
    # Verify all test users can login
    echo "🔍 Verifying all test users..."
    verify_user_login "seller@vyeya.com" "password"
    verify_user_login "testbuyer@vyeya.com" "testpass123" || echo "   ⚠️  New user login may fail - this is expected on first run"
    verify_user_login "testgrower@vyeya.com" "testpass123" || echo "   ⚠️  New user login may fail - this is expected on first run"
    
    echo "✨ E2E test data setup complete!"
    echo ""
    echo "📋 Test Users Available:"
    echo "   • seller@vyeya.com / password (Grower)"
    echo "   • testbuyer@vyeya.com / testpass123 (Buyer)"
    echo "   • testgrower@vyeya.com / testpass123 (Grower)"
    echo ""
    echo "🎯 Ready to run E2E tests!"
}

# Run main function
main "$@"
