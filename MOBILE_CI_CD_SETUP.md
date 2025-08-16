# Mobile CI/CD Setup Guide

This project now includes comprehensive CI/CD for both iOS and Android platforms.

## Pipeline Overview

The GitHub Actions pipeline now includes:

### ✅ Core CI/CD
- **Lint & Test**: Code quality checks, unit tests, security scanning
- **API Testing**: Server build, testing, and Docker image creation
- **Multi-platform Mobile Builds**: Both Android APK and iOS IPA generation

### ✅ Cross-Platform Testing
- **Android E2E**: Automated testing on Android emulator using Maestro
- **iOS E2E**: Automated testing on iOS simulator using Maestro
- **API Integration**: Full stack testing with real backend

### ✅ Store Deployments
- **Android Play Store**: Automated AAB upload to Play Console
- **iOS TestFlight**: Automated IPA upload to App Store Connect
- **Environment-aware**: Different tracks for dev/qa/prod branches

## Platform Coverage

| Platform | Build | E2E Tests | Store Deployment |
|----------|-------|-----------|------------------|
| Android  | ✅     | ✅         | ✅ Play Store    |
| iOS      | ✅     | ✅         | ✅ TestFlight    |

## Required Secrets

### iOS Deployment
```
IOS_CERTIFICATE_P12              # Base64 encoded P12 certificate
IOS_CERTIFICATE_PASSWORD         # Certificate password
IOS_PROVISIONING_PROFILE         # Base64 encoded provisioning profile
APP_STORE_CONNECT_API_KEY_ID     # App Store Connect API key ID
APP_STORE_CONNECT_API_ISSUER_ID  # App Store Connect API issuer ID
APP_STORE_CONNECT_API_KEY        # Base64 encoded API key (.p8 file)
```

### Android Deployment
```
ANDROID_SIGNING_KEY              # Base64 encoded release keystore
ANDROID_KEY_ALIAS               # Keystore alias
ANDROID_KEY_PASSWORD            # Key password
ANDROID_STORE_PASSWORD          # Keystore password
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON # Base64 encoded service account JSON
```

## Branch Strategy

- **`develop`**: Deploys to internal/alpha tracks
- **`main`**: Deploys to beta/production tracks
- **Feature branches**: Run tests only, no deployment

## Running Locally

### Prerequisites
- Node.js 22+
- pnpm 9.15.0+
- Android Studio with SDK 34
- Xcode 15+ (macOS only)
- Maestro CLI for E2E testing

### Setup Commands
```bash
# Install dependencies
pnpm install

# iOS setup (macOS only)
cd packages/app/ios && pod install

# Run tests
pnpm test

# Start development
pnpm dev
```

### E2E Testing
```bash
# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Run Android E2E (with emulator running)
maestro test packages/app/maestro/ --device android

# Run iOS E2E (with simulator running)  
maestro test packages/app/maestro/ --device ios
```

## Pipeline Jobs

1. **lint-and-test**: Code quality and unit tests
2. **build-and-test-api**: Server build and API tests
3. **build-mobile**: Android APK build (Ubuntu runner)
4. **build-ios**: iOS IPA build (macOS runner)
5. **e2e-tests**: Cross-platform E2E testing (macOS runner)
6. **deploy-***: Environment-specific deployments
7. **deploy-ios-testflight**: iOS TestFlight deployment
8. **deploy-android-play-store**: Android Play Store deployment

## Store Deployment Process

### iOS TestFlight
- Builds signed IPA with distribution certificate
- Uploads to TestFlight automatically
- Available for internal testing immediately
- Can be promoted to App Store manually

### Android Play Store
- Builds signed AAB (Android App Bundle)
- Uploads to appropriate track (internal/beta)
- Uses Google Play Console for release management
- Includes automated release notes

## Troubleshooting

### iOS Build Issues
- Ensure provisioning profiles match bundle ID
- Check certificate validity
- Verify team ID in ExportOptions.plist

### Android Build Issues
- Ensure keystore is properly base64 encoded
- Check signing configuration in gradle.properties
- Verify Google Play service account permissions

### E2E Test Issues
- Ensure app is properly installed on simulator/emulator
- Check Maestro test device targeting
- Verify Metro bundler is running for React Native

## Next Steps

1. **Configure Store Secrets**: Add required secrets to GitHub repository
2. **Update Bundle IDs**: Ensure iOS bundle ID matches provisioning profiles
3. **Test Pipeline**: Push to develop branch to test full pipeline
4. **Store Setup**: Configure app listings in App Store Connect and Play Console
5. **Monitoring**: Set up deployment notifications and monitoring

The pipeline is now ready for cross-platform React Native development with full CI/CD automation! 🚀
