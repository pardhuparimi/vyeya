# Vyeya Troubleshooting Guide

This guide covers common issues encountered during development and their solutions.

## Quick Fixes

### Reset Everything
If you're experiencing multiple issues, try this complete reset:

```bash
# 1. Clean all caches
cd packages/app
rm -rf node_modules/.cache
rm -rf /tmp/metro-*
rm -rf /tmp/react-*
watchman watch-del-all

# 2. Clean iOS (macOS only)
cd ios
rm -rf Pods Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/Vyeya-*
export LANG=en_US.UTF-8
pod install
cd ..

# 3. Clean Android
cd android
./gradlew clean
cd ..

# 4. Reinstall dependencies
cd ../..
pnpm install --force

# 5. Restart Metro
cd packages/app
npx react-native start --reset-cache
```

## Specific Error Solutions

### 1. Babel Runtime Errors

**Error:**
```
Error: Unable to resolve module @babel/runtime/helpers/interopRequireDefault
```

**Solution:**
```bash
cd packages/app
npm install @babel/runtime
npx react-native start --reset-cache
```

### 2. Navigation Errors

**Error:**
```
Cannot read property 'StackView' of undefined
TurboModuleRegistry.getEnforcing(...): 'RNGestureHandlerModule' could not be found
```

**Root Cause:** Missing or incorrectly configured gesture handler.

**Solution:**
```bash
cd packages/app
npm install react-native-gesture-handler
```

Ensure `index.js` has the correct imports at the top:
```javascript
import 'react-native-gesture-handler';
import 'react-native-screens';
```

For iOS, rebuild:
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

### 3. iOS Build Issues

**Error:**
```
Unable to open base configuration reference file
Clang compilation errors
```

**Solution:**
```bash
cd packages/app/ios
rm -rf Pods Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/Vyeya-*
export LANG=en_US.UTF-8
pod install
cd ..
npx react-native run-ios
```

### 4. Android Build Issues

**Error:**
```
Included build does not exist
Gradle plugin path error
```

**Root Cause:** pnpm monorepo structure requires specific gradle configuration.

**Solution:** The `android/settings.gradle` file has been pre-configured. If issues persist:
```bash
cd packages/app/android
./gradlew clean
cd ..
npx react-native run-android
```

### 5. Metro Bundler Issues

**Error:**
```
Metro bundler fails to start
Port 8081 already in use
```

**Solution:**
```bash
# Kill existing Metro processes
pkill -f metro
lsof -ti:8081 | xargs kill -9

# Clear cache and restart
cd packages/app
rm -rf node_modules/.cache
npx react-native start --reset-cache
```

### 6. Tailwind Styling Issues

**Error:**
```
useTailwind is not a function
Cannot read property of undefined (tailwind styles)
```

**Root Cause:** Incorrect import syntax for twrnc.

**Solution:** Use direct import:
```javascript
// Wrong
import { useTailwind } from 'twrnc';
const tailwind = useTailwind();

// Correct
import tw from 'twrnc';
// Use tw`class-name` directly
```

### 7. TypeScript Errors

**Error:**
```
Parameter 'navigation' implicitly has an 'any' type
```

**Solution:** Add type annotations:
```typescript
// Add type annotation
const ScreenComponent = ({ navigation }: any) => {
  // component code
};
```

### 8. Simulator/Emulator Issues

**iOS Simulator not starting:**
```bash
# List available simulators
xcrun simctl list devices

# Boot specific simulator
xcrun simctl boot <device-id>

# Or use Xcode to manage simulators
```

**Android Emulator issues:**
```bash
# List available AVDs
emulator -list-avds

# Start specific emulator
emulator -avd <avd-name>

# Check connected devices
adb devices

# Restart ADB if needed
adb kill-server && adb start-server
```

## Development Environment Issues

### Node.js Version
Ensure you're using Node.js v22 or later:
```bash
node --version
# Should show v22.x.x or higher
```

### pnpm Issues
```bash
# Update pnpm
npm install -g pnpm@latest

# Clear pnpm cache
pnpm store prune
```

### Xcode Issues (macOS)
```bash
# Ensure command line tools are installed
xcode-select --install

# Check Xcode path
xcode-select -p
# Should show: /Applications/Xcode.app/Contents/Developer
```

### Android Studio Issues
1. Ensure Android SDK Platform 34 is installed
2. Check environment variables:
```bash
echo $ANDROID_HOME
echo $PATH | grep android
```

## Performance Issues

### Slow Metro Bundler
```bash
# Use Watchman for better file watching
brew install watchman

# Increase Metro cache
export METRO_CACHE_SIZE=1000
```

### Slow iOS Builds
```bash
# Enable Hermes (already enabled in project)
# Use Xcode build settings optimization
# Consider using Flipper for debugging instead of Chrome DevTools
```

## Debugging Tips

### Enable Verbose Logging
```bash
# React Native verbose mode
npx react-native run-ios --verbose
npx react-native run-android --verbose

# Metro verbose mode
npx react-native start --verbose
```

### Check React Native Setup
```bash
cd packages/app
npx react-native doctor
```

### View Logs
```bash
# iOS logs
xcrun simctl spawn booted log stream --predicate 'process == "Vyeya"'

# Android logs
adb logcat | grep -i react
```

## Getting Help

If you're still experiencing issues:

1. Check the main README.md troubleshooting section
2. Run `npx react-native doctor` for environment issues
3. Search for similar issues in React Native documentation
4. Check if the issue is specific to the monorepo setup
5. Create a detailed issue report with:
   - Operating system and version
   - Node.js and pnpm versions
   - Exact error messages
   - Steps to reproduce
   - What you've already tried

## Prevention

### Regular Maintenance
```bash
# Weekly cleanup
cd packages/app
rm -rf node_modules/.cache
watchman watch-del-all
npx react-native start --reset-cache

# Monthly dependency updates
pnpm update
```

### Best Practices
- Always import `react-native-gesture-handler` first in `index.js`
- Use `export LANG=en_US.UTF-8` before CocoaPods operations
- Keep Android SDK and Xcode updated
- Use `npx react-native doctor` to check environment health
- Clear caches when switching between branches