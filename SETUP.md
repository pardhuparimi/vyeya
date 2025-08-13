# Vyeya Setup Guide

## Prerequisites

### Required Software
- **[Node.js](https://nodejs.org/)** (v22 or later)
- **[pnpm](https://pnpm.io/installation)** (v8 or later)
- **[Git](https://git-scm.com/)**
- **[Docker](https://www.docker.com/get-started)** (for database)

### For Mobile Development

#### Android Development
- **[Android Studio](https://developer.android.com/studio)** (latest version)
- **Android SDK** (API level 34 or higher)
- **Android Virtual Device (AVD)** or physical Android device
- **Java Development Kit (JDK)** 17 or higher

#### iOS Development (macOS only)
- **[Xcode](https://developer.apple.com/xcode/)** (latest version)
- **Xcode Command Line Tools**: `xcode-select --install`
- **iOS Simulator** (included with Xcode)
- **CocoaPods**: `sudo gem install cocoapods`

### Optional
- **[Watchman](https://facebook.github.io/watchman/)** (recommended for better file watching)

## Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd Vyeya
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup

#### React Native Environment
Follow the [React Native CLI Quickstart](https://reactnative.dev/docs/environment-setup) guide for your operating system.

**For macOS (iOS + Android):**
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required tools
brew install node watchman
brew install --cask android-studio

# Install CocoaPods
sudo gem install cocoapods
```

#### iOS Setup (macOS only)
```bash
cd packages/app/ios
pod install
cd ../..
```

## Running the Application

### Essential Steps

1. **Start Database**
```bash
docker compose up -d
```

2. **Start Backend Server**
```bash
cd packages/server && npm run dev
```

3. **Run Mobile App**
```bash
cd packages/app && npm run android
```

> **Note**: If you get connection errors, run: `adb reverse tcp:3000 tcp:3000`

## Test Authentication

- **Existing User**: `seller@vyeya.com` / `password`
- **New Users**: Use signup form with unique email addresses

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to Metro" Error
```bash
# Kill existing Metro process and restart
kill -9 $(lsof -ti:8081) 2>/dev/null || true
cd packages/app
npx react-native start --reset-cache

# In another terminal, setup port forwarding
adb reverse tcp:8081 tcp:8081
```

#### 2. "Signup/Login Failed" - Network Issues
```bash
# Ensure port forwarding is set up
adb reverse tcp:3000 tcp:3000

# Test server connectivity
curl -X GET http://localhost:3000/health

# Check if emulator is connected
adb devices
```

#### 3. Database Connection Issues
```bash
# Restart database containers
docker compose down
docker compose up -d

# Wait for containers to be healthy
docker ps
```

#### 4. "User already exists" Error
```bash
# Use different email addresses for testing
# Or check existing users in database:
docker exec -i vyeya-postgres psql -U postgres -d vyeya -c "SELECT email FROM users;"
```

#### 5. Android Emulator Not Starting
```bash
# Check available emulators
~/Library/Android/sdk/emulator/emulator -list-avds

# Kill existing emulator processes
killall qemu-system-aarch64 2>/dev/null || true

# Start fresh emulator
~/Library/Android/sdk/emulator/emulator -avd YOUR_AVD_NAME
```

#### 6. Metro Cache Issues
```bash
cd packages/app
npx react-native start --reset-cache
```

#### 7. iOS Build Issues (macOS only)
```bash
cd packages/app/ios
rm -rf Pods Podfile.lock
pod install
cd ..
npx react-native run-ios
```

#### 8. JWT Token Issues
```bash
# Clear app storage and restart
# On Android: Settings > Apps > Vyeya > Storage > Clear Data
```