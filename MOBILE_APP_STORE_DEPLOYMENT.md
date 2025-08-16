# 📱 Mobile App Store Deployment Guide

## 🎯 Overview

This guide covers deploying your Vyeya mobile app to Google Play Store and Apple App Store using the automated CI/CD pipeline and manual processes.

## 🤖 Android - Google Play Store Deployment

### 🔧 Setup (One-time)

#### 1. Google Play Developer Account
```bash
# Requirements:
- Google Play Developer Account ($25 one-time fee)
- Google Play Console access
- Android app bundle signing key
```

#### 2. Generate Signing Key
```bash
# Generate Android keystore (run once, keep secure!)
keytool -genkey -v -keystore release-key.keystore \
  -alias release-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Answer the prompts:
# - Name: Your Company Name
# - Organizational Unit: Mobile Development  
# - Organization: Your Company
# - City: Your City
# - State: Your State
# - Country Code: US (or your country)
# - Password: [STRONG PASSWORD - SAVE THIS!]

# Convert keystore to base64 for GitHub Secrets
base64 -i release-key.keystore -o release-key-base64.txt
cat release-key-base64.txt  # Copy this for GitHub Secrets
```

#### 3. Configure GitHub Secrets
Navigate to: `GitHub Repository → Settings → Secrets and Variables → Actions`

Add these secrets:
```bash
ANDROID_KEYSTORE: [paste base64 content from above]
ANDROID_STORE_PASSWORD: [your keystore password]  
ANDROID_KEY_PASSWORD: [your key alias password]
```

#### 4. Configure App Details
```bash
# Edit: packages/app/android/app/build.gradle
android {
    defaultConfig {
        applicationId "com.vyeya.app"  # Change to your package name
        versionCode 1                  # Increment for each release
        versionName "1.0.0"           # User-facing version
    }
    
    signingConfigs {
        release {
            if (project.hasProperty('ANDROID_STORE_PASSWORD')) {
                storeFile file('release-key.keystore')
                storePassword ANDROID_STORE_PASSWORD
                keyAlias 'release-key'
                keyPassword ANDROID_KEY_PASSWORD
            }
        }
    }
}
```

### 🚀 Automated Deployment (CI/CD)

#### Production Release Process
```bash
# 1. Update version in packages/app/android/app/build.gradle
versionCode 2      # Increment
versionName "1.0.1" # Update version

# 2. Commit and push to main branch
git add .
git commit -m "Release v1.0.1 - Android"
git push origin main

# 3. CI/CD automatically:
# - Builds signed APK/AAB
# - Runs tests and security scans
# - Creates GitHub release with artifacts
# - Uploads APK as downloadable artifact
```

#### Download and Upload to Play Store
```bash
# 1. Go to GitHub → Actions → Latest workflow run
# 2. Download "android-apk-[commit-hash]" artifact
# 3. Extract the signed APK/AAB file
# 4. Upload to Google Play Console:
#    - Go to Play Console → Your App → Production
#    - Click "Create new release"
#    - Upload the AAB file (preferred) or APK
#    - Add release notes
#    - Submit for review
```

### 📱 Manual Build Process (if needed)
```bash
# Build signed release APK locally
cd packages/app/android

# Clean previous builds
./gradlew clean

# Build release APK (signed automatically if keystore configured)
./gradlew assembleRelease

# Build release AAB (recommended for Play Store)
./gradlew bundleRelease

# Output files:
# APK: app/build/outputs/apk/release/app-release.apk
# AAB: app/build/outputs/bundle/release/app-release.aab
```

### 🔄 Play Store Upload Process
```bash
# 1. Open Google Play Console
# 2. Select your app (or create new app)
# 3. Go to "Production" in left sidebar
# 4. Click "Create new release"
# 5. Upload your AAB file
# 6. Fill in release details:
#    - Release notes (what's new)
#    - Version information
# 7. Review and submit for publishing
# 8. Review process: 1-3 days typically
```

## 🍎 iOS - Apple App Store Deployment

### 🔧 Setup (One-time)

#### 1. Apple Developer Account
```bash
# Requirements:
- Apple Developer Account ($99/year)
- App Store Connect access
- iOS Distribution Certificate
- App Store Provisioning Profile
```

#### 2. Xcode Configuration
```bash
# Open project in Xcode
cd packages/app/ios
open Vyeya.xcworkspace

# In Xcode:
# 1. Select Vyeya project → Signing & Capabilities
# 2. Select your Team (Apple Developer Account)
# 3. Set Bundle Identifier: com.yourcompany.vyeya
# 4. Ensure "Automatically manage signing" is checked
# 5. Select "iOS Distribution" for Release builds
```

#### 3. App Store Connect Setup
```bash
# 1. Go to App Store Connect (appstoreconnect.apple.com)
# 2. Click "My Apps" → "+" → "New App"
# 3. Fill in app information:
#    - Platform: iOS
#    - Name: Vyeya
#    - Primary Language: English
#    - Bundle ID: com.yourcompany.vyeya (must match Xcode)
#    - SKU: vyeya-ios (unique identifier)
```

#### 4. Export iOS Certificates for CI/CD
```bash
# Export iOS Distribution Certificate from Keychain:
# 1. Open Keychain Access
# 2. Find "iOS Distribution: [Your Name]"
# 3. Right-click → Export
# 4. Save as .p12 file with password
# 5. Convert to base64:
base64 -i certificate.p12 -o certificate-base64.txt

# Export Provisioning Profile:
# 1. Download from Apple Developer Portal
# 2. Convert to base64:
base64 -i profile.mobileprovision -o profile-base64.txt
```

#### 5. Configure GitHub Secrets for iOS
```bash
# Add these secrets to GitHub:
IOS_CERTIFICATE_P12: [base64 certificate content]
IOS_CERTIFICATE_PASSWORD: [certificate password]
IOS_PROVISIONING_PROFILE: [base64 profile content]
APP_STORE_CONNECT_API_KEY: [optional, for automation]
```

### 🚀 Automated Deployment (CI/CD)

#### Production Release Process
```bash
# 1. Update version in packages/app/ios/Vyeya/Info.plist
<key>CFBundleShortVersionString</key>
<string>1.0.1</string>  <!-- User-facing version -->
<key>CFBundleVersion</key>
<string>2</string>      <!-- Build number, increment each build -->

# 2. Commit and push to main branch
git add .
git commit -m "Release v1.0.1 - iOS"
git push origin main

# 3. CI/CD automatically:
# - Builds iOS archive with release configuration
# - Signs with distribution certificate
# - Uploads to TestFlight automatically
# - Creates GitHub release with artifacts
```

### 📱 Manual Build Process (if needed)
```bash
# Build iOS release archive locally
cd packages/app/ios

# Clean previous builds
xcodebuild clean -workspace Vyeya.xcworkspace -scheme Vyeya

# Build and archive for App Store
xcodebuild archive \
  -workspace Vyeya.xcworkspace \
  -scheme Vyeya \
  -configuration Release \
  -archivePath build/Vyeya.xcarchive

# Export for App Store distribution
xcodebuild -exportArchive \
  -archivePath build/Vyeya.xcarchive \
  -exportPath build/Release-iphoneos \
  -exportOptionsPlist ExportOptions.plist
```

### 🔄 App Store Upload Process
```bash
# Option 1: Automatic upload via CI/CD
# - CI/CD uploads to TestFlight automatically
# - Go to App Store Connect → TestFlight
# - Submit for external testing or App Store review

# Option 2: Manual upload using Xcode
# 1. Open Xcode → Window → Organizer
# 2. Select your archive → "Distribute App"
# 3. Select "App Store Connect"
# 4. Follow prompts to upload

# Option 3: Command line upload
xcrun altool --upload-app -f "Vyeya.ipa" \
  -u "your-apple-id@email.com" \
  -p "app-specific-password"
```

### 📋 App Store Review Process
```bash
# 1. Complete app metadata in App Store Connect:
#    - App description
#    - Keywords
#    - Screenshots (required sizes)
#    - App category
#    - Content rating
#    - Pricing information

# 2. Submit for review:
#    - Go to App Store Connect → Your App → App Store
#    - Fill in "App Information" section
#    - Add screenshots and app preview videos
#    - Set pricing and availability
#    - Submit for review

# 3. Review timeline:
#    - Initial review: 24-48 hours
#    - If rejected: Fix issues and resubmit
#    - If approved: App goes live automatically
```

## 🎯 Version Management

### Semantic Versioning
```bash
# Follow semantic versioning: MAJOR.MINOR.PATCH
# Example: 1.2.3

# MAJOR (1.x.x): Breaking changes, major new features
# MINOR (x.2.x): New features, backwards compatible  
# PATCH (x.x.3): Bug fixes, small improvements

# For mobile apps also increment build numbers:
# Android: versionCode (integer, always increment)
# iOS: CFBundleVersion (integer, always increment)
```

### Release Workflow
```bash
# 1. Development phase
git checkout develop
# ... develop features

# 2. Release preparation  
git checkout -b release/v1.2.0
# Update version numbers in:
# - packages/app/package.json
# - packages/app/android/app/build.gradle (versionCode & versionName)
# - packages/app/ios/Vyeya/Info.plist (CFBundleVersion & CFBundleShortVersionString)

# 3. QA testing
git push origin release/v1.2.0
# CI/CD deploys to QA environment and builds test apps

# 4. Production release
git checkout main
git merge release/v1.2.0
git tag v1.2.0
git push origin main --tags
# CI/CD builds production-signed apps
```

## 🔒 Security & Compliance

### App Security Checklist
```bash
# ✅ Code obfuscation enabled (production builds)
# ✅ SSL pinning implemented for API calls
# ✅ No sensitive data in logs (production)
# ✅ Proper data encryption for stored credentials
# ✅ Network security config (Android)
# ✅ App Transport Security (iOS)
# ✅ Permissions requested only when needed
# ✅ Third-party library security audit
```

### Store Compliance
```bash
# Google Play Store requirements:
# ✅ Target API level 33+ (Android 13)
# ✅ 64-bit native libraries
# ✅ Privacy Policy link
# ✅ Data safety declarations
# ✅ Content rating appropriate

# Apple App Store requirements:
# ✅ iOS 12.0+ support recommended
# ✅ Privacy nutrition labels
# ✅ App Privacy Policy
# ✅ Human Interface Guidelines compliance
# ✅ Content rating appropriate
```

## 📊 Release Monitoring

### Post-Release Checklist
```bash
# After app store release:
# 1. Monitor crash reports (Firebase Crashlytics)
# 2. Check app store ratings and reviews
# 3. Monitor API performance (increased load)
# 4. Verify health check endpoints
# 5. Check CloudWatch metrics
# 6. Monitor user adoption metrics
# 7. Prepare hotfix process if needed
```

### Rollback Strategy
```bash
# If critical issues found:

# 1. Immediate action:
# - Remove app from store (if critical security issue)
# - Deploy API hotfix if backend issue

# 2. App rollback options:
# - Google Play: Use "Staged rollout" to limit exposure
# - Apple: Submit urgent hotfix update

# 3. Communication:
# - Update app store descriptions with known issues
# - Send push notifications to users if applicable
# - Update status page if you have one
```

## 🎉 Success Metrics

### App Store KPIs
```bash
# Download metrics:
- Install rate vs. impressions
- Retention rates (1-day, 7-day, 30-day)
- App store search ranking
- User ratings and review sentiment

# Technical metrics:
- App crash rate < 1%
- App load time < 3 seconds
- API response time < 500ms
- Battery usage optimization
```

Your mobile apps are now ready for the world! 📱🚀

## 📚 Quick Reference

### Android Commands
```bash
# Build signed APK for Play Store
cd packages/app/android && ./gradlew bundleRelease

# Test locally
cd packages/app && pnpm android

# Check build
cd packages/app/android && ./gradlew assembleRelease
```

### iOS Commands  
```bash
# Build for App Store
cd packages/app/ios && xcodebuild -workspace Vyeya.xcworkspace -scheme Vyeya -configuration Release

# Test locally
cd packages/app && pnpm ios

# Open in Xcode
cd packages/app/ios && open Vyeya.xcworkspace
```

### Version Update Commands
```bash
# Update all version numbers for release
# Android: packages/app/android/app/build.gradle
# iOS: packages/app/ios/Vyeya/Info.plist  
# Package: packages/app/package.json
```
