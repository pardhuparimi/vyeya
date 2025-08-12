# Vyeya Development Setup Guide

This guide provides step-by-step instructions for setting up the Vyeya development environment.

## Quick Start Checklist

- [ ] Node.js v18+ installed
- [ ] pnpm installed
- [ ] Git installed
- [ ] Xcode installed (macOS only)
- [ ] Android Studio installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] iOS pods installed (macOS only)
- [ ] Emulators/simulators set up

## Detailed Setup Instructions

### 1. System Requirements

#### macOS
```bash
# Check versions
node --version    # Should be v22+
pnpm --version    # Should be v8+
xcode-select -p   # Should show Xcode path
```

#### Windows/Linux
```bash
# Check versions
node --version    # Should be v22+
pnpm --version    # Should be v8+
```

### 2. Install Required Software

#### Node.js and pnpm
```bash
# Install Node.js from https://nodejs.org/
# Then install pnpm
npm install -g pnpm
```

#### Xcode (macOS only)
1. Install from Mac App Store
2. Install Command Line Tools:
```bash
xcode-select --install
```

#### Android Studio
1. Download from https://developer.android.com/studio
2. Install Android SDK Platform 34
3. Set up environment variables:

**macOS/Linux:**
```bash
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc
```

**Windows:**
```cmd
setx ANDROID_HOME "%USERPROFILE%\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\emulator;%ANDROID_HOME%\platform-tools"
```

### 3. Clone and Setup Project

```bash
# Clone repository
git clone <repository-url>
cd Vyeya

# Install all dependencies
pnpm install

# Install iOS dependencies (macOS only)
cd packages/app/ios
pod install
cd ../../..
```

### 4. Set Up Emulators/Simulators

#### iOS Simulator (macOS only)
```bash
# Open Xcode and install iOS simulators
# Or use command line
xcrun simctl list devices
```

#### Android Emulator
```bash
# Create AVD in Android Studio or via command line
avdmanager create avd -n Vyeya_Emulator -k "system-images;android-34;google_apis;x86_64"

# Start emulator
emulator -avd Vyeya_Emulator
```

### 5. Verify Setup

#### Test Backend
```bash
cd packages/server
pnpm dev
# Should start on http://localhost:3000
```

#### Test Mobile App
```bash
cd packages/app

# iOS (macOS only)
npx react-native run-ios

# Android
npx react-native run-android
```

## Common Setup Issues and Solutions

### Issue: Metro bundler fails to start
```bash
# Solution
cd packages/app
rm -rf node_modules/.cache
npx react-native start --reset-cache
```

### Issue: iOS build fails
```bash
# Solution
cd packages/app/ios
rm -rf Pods Podfile.lock
pod install
cd ..
npx react-native run-ios
```

### Issue: Android build fails
```bash
# Solution
cd packages/app/android
./gradlew clean
cd ..
npx react-native run-android
```

### Issue: Babel runtime error
```bash
# Solution
cd packages/app
npm install @babel/runtime
npx react-native start --reset-cache
```

### Issue: Navigation errors
```bash
# Solution: Ensure gesture handler is imported first
# In packages/app/index.js:
import 'react-native-gesture-handler';
```

## Development Workflow

### Starting Development
1. Start backend server:
```bash
pnpm --filter server dev
```

2. Start mobile app:
```bash
# iOS
pnpm --filter app ios

# Android
pnpm --filter app android
```

### Making Changes
1. Backend changes: Server auto-reloads
2. Mobile changes: Use Fast Refresh (Cmd+R to reload)

### Debugging
1. Enable debugging in app (Cmd+D on iOS, Cmd+M on Android)
2. Use React Native Debugger or browser dev tools
3. Check Metro bundler logs for JavaScript errors

## Environment Variables

Create `.env` files in respective packages:

### packages/server/.env
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
AWS_REGION=us-east-1
```

### packages/app/.env
```
API_URL=http://localhost:3000
```

## Testing

### Run Tests
```bash
# All packages
pnpm test

# Specific package
pnpm --filter app test
pnpm --filter server test
```

### Linting
```bash
# All packages
pnpm lint

# Specific package
pnpm --filter app lint
```

## Production Build

### Mobile App
```bash
cd packages/app

# iOS
npx react-native run-ios --configuration Release

# Android
npx react-native run-android --variant=release
```

### Backend
```bash
cd packages/server
pnpm build
pnpm start
```

## Useful Commands

### pnpm Workspace Commands
```bash
# Install dependency to specific package
pnpm --filter app add react-native-vector-icons
pnpm --filter server add express

# Run script in specific package
pnpm --filter app ios
pnpm --filter server dev

# Run script in all packages
pnpm -r test
```

### React Native Commands
```bash
# Reset Metro cache
npx react-native start --reset-cache

# Clean builds
npx react-native clean

# Check React Native setup
npx react-native doctor

# List devices
npx react-native run-ios --list-devices
npx react-native run-android --list-devices
```

### Android Commands
```bash
# List emulators
emulator -list-avds

# Start emulator
emulator -avd <emulator-name>

# Check connected devices
adb devices

# View logs
adb logcat
```

### iOS Commands
```bash
# List simulators
xcrun simctl list devices

# Boot simulator
xcrun simctl boot <device-id>

# View logs
xcrun simctl spawn booted log stream --predicate 'process == "Vyeya"'
```

## Support

If you encounter issues:

1. Check this setup guide
2. Review the troubleshooting section in README.md
3. Check React Native documentation
4. Search existing issues in the repository
5. Create a new issue with detailed error information

## Next Steps

After successful setup:

1. Explore the codebase structure
2. Review the API documentation
3. Check out the development workflow
4. Start contributing!