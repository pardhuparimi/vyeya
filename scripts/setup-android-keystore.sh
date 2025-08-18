#!/bin/bash
# Android Debug Keystore Generation Script
# Ensures debug keystore exists for Android builds

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔑 Android Debug Keystore Setup${NC}"

# Navigate to Android app directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_APP_DIR="${SCRIPT_DIR}/../packages/app/android/app"

if [ ! -d "$ANDROID_APP_DIR" ]; then
    echo -e "${RED}❌ Android app directory not found: $ANDROID_APP_DIR${NC}"
    exit 1
fi

cd "$ANDROID_APP_DIR"
echo -e "${BLUE}📁 Working in: $(pwd)${NC}"

# Check if debug keystore already exists
if [ -f "debug.keystore" ]; then
    echo -e "${GREEN}✅ Debug keystore already exists${NC}"
    
    # Verify keystore is valid
    if keytool -list -keystore debug.keystore -storepass android -alias androiddebugkey > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Keystore is valid and accessible${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  Keystore exists but may be corrupted, regenerating...${NC}"
        rm -f debug.keystore
    fi
fi

# Generate debug keystore
echo -e "${YELLOW}🔧 Generating Android debug keystore...${NC}"

keytool -genkey -v \
    -keystore debug.keystore \
    -storepass android \
    -alias androiddebugkey \
    -keypass android \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=Android Debug,O=Android,C=US" \
    > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Debug keystore generated successfully${NC}"
    
    # Verify the generated keystore
    echo -e "${BLUE}🔍 Verifying keystore...${NC}"
    keytool -list -keystore debug.keystore -storepass android -alias androiddebugkey | head -10
    
    echo -e "${GREEN}🎉 Android debug keystore setup complete!${NC}"
else
    echo -e "${RED}❌ Failed to generate debug keystore${NC}"
    exit 1
fi

# Set appropriate permissions
chmod 644 debug.keystore
echo -e "${BLUE}📋 Keystore permissions set to 644${NC}"

echo -e "\n${YELLOW}💡 Next steps:${NC}"
echo -e "  1. Keystore is ready for Android builds"
echo -e "  2. Use 'pnpm android' or 'npx react-native run-android' to build"
echo -e "  3. Keystore will be used automatically for debug builds"
