# Vyeya - Hyper-Local Ecommerce Marketplace

Vyeya is a native mobile app (iOS and Android) for a hyper-local ecommerce marketplace connecting local buyers and sellers. This platform prioritizes local commerce, reduces delivery times, supports small businesses, and fosters community-driven shopping experiences.

## Project Overview

This repository contains the source code for the Vyeya mobile application and its backend services. It is structured as a monorepo using [pnpm workspaces](https://pnpm.io/workspaces).

-   **`packages/app`**: The React Native mobile application for iOS and Android.
-   **`packages/server`**: The Node.js backend server powered by Express.js.
-   **`packages/shared`**: Shared code, primarily TypeScript types and interfaces, used across the app and server.

## Tech Stack

-   **Frontend**: React Native with TypeScript, Tailwind RN for styling, React Navigation
-   **Backend**: Node.js with Express.js, TypeScript
-   **Database**: PostgreSQL with Redis for caching
-   **Cloud**: AWS (EC2, S3, RDS, etc.)
-   **Authentication**: AWS Cognito
-   **Package Manager**: pnpm with workspaces

## Prerequisites

Before setting up the project, ensure you have the following installed:

### Required Software

-   **[Node.js](https://nodejs.org/)** (v22 or later)
-   **[pnpm](https://pnpm.io/installation)** (v8 or later)
-   **[Git](https://git-scm.com/)**

### For Mobile Development

#### iOS Development (macOS only)
-   **[Xcode](https://developer.apple.com/xcode/)** (latest version)
-   **Xcode Command Line Tools**: `xcode-select --install`
-   **iOS Simulator** (included with Xcode)
-   **CocoaPods**: `sudo gem install cocoapods`

#### Android Development
-   **[Android Studio](https://developer.android.com/studio)** (latest version)
-   **Android SDK** (API level 34 or higher)
-   **Android Virtual Device (AVD)** or physical Android device
-   **Java Development Kit (JDK)** 17 or higher

### Optional
-   **[Docker](https://www.docker.com/get-started)** (for running local database)
-   **[Watchman](https://facebook.github.io/watchman/)** (recommended for better file watching)

## Installation & Setup

> ✅ **Tested Setup**: This setup has been verified to work on macOS with both iOS and Android simulators.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Vyeya
```

### 2. Install Dependencies

Install all dependencies for all packages using pnpm:

```bash
pnpm install
```

This will install dependencies for:
- Root workspace
- `packages/app` (React Native app)
- `packages/server` (Node.js backend)
- `packages/shared` (Shared TypeScript types)

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

**Android SDK Setup:**
1. Open Android Studio
2. Go to SDK Manager
3. Install Android SDK Platform 34
4. Install Android SDK Build-Tools
5. Set up environment variables in `~/.zshrc` or `~/.bash_profile`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 4. iOS Setup (macOS only)

```bash
cd packages/app/ios
pod install
cd ../..
```

### 5. Android Setup

Ensure Android emulator is running or device is connected:

```bash
# List available emulators
emulator -list-avds

# Start an emulator
emulator -avd <emulator-name>

# Or check connected devices
adb devices
```

## Setup Verification

After completing the setup, verify everything works:

```bash
# 1. Test that all dependencies are installed
pnpm install

# 2. Verify React Native setup
cd packages/app
npx react-native doctor

# 3. Test iOS (macOS only)
npx react-native run-ios

# 4. Test Android
npx react-native run-android
```

You should see the Seller Dashboard screen with an "Add Product" button on both platforms.

## Running the Application

### Backend Server

Start the Node.js backend server:

```bash
pnpm --filter server dev
```

The server will be running on `http://localhost:3000`.

### Mobile App

#### iOS (macOS only)

```bash
# Using pnpm workspace command
pnpm --filter app ios

# Or directly in the app directory
cd packages/app
npx react-native run-ios
```

#### Android

```bash
# Using pnpm workspace command
pnpm --filter app android

# Or directly in the app directory
cd packages/app
npx react-native run-android
```

### Development Server

The Metro bundler will start automatically when running the mobile app. If you need to start it manually:

```bash
cd packages/app
npx react-native start
```

## Troubleshooting

### Common Issues

#### 1. Babel Runtime Error
```
Error: Unable to resolve module @babel/runtime/helpers/interopRequireDefault
```

**Solution:**
```bash
cd packages/app
npm install @babel/runtime
npx react-native start --reset-cache
```

#### 2. CocoaPods Issues (iOS)
```
Unable to open base configuration reference file
```

**Solution:**
```bash
cd packages/app/ios
# Clean and reinstall pods
rm -rf Pods Podfile.lock
export LANG=en_US.UTF-8
pod install
```

#### 3. Android Gradle Plugin Path Error
```
Included build does not exist
```

**Solution:** The `android/settings.gradle` file has been configured for pnpm monorepo structure.

#### 4. Navigation Stack View Error
```
Cannot read property 'StackView' of undefined
TurboModuleRegistry.getEnforcing(...): 'RNGestureHandlerModule' could not be found
```

**Solution:** Install and configure gesture handler:
```bash
cd packages/app
npm install react-native-gesture-handler
```

Then ensure it's imported at the top of `index.js`:
```javascript
import 'react-native-gesture-handler';
import 'react-native-screens';
```

For iOS, rebuild after installing:
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

#### 5. iOS C++ Compilation Errors
```
Clang compilation errors during iOS build
```

**Solution:**
```bash
cd packages/app/ios
# Clean everything and reinstall
rm -rf Pods Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/Vyeya-*
export LANG=en_US.UTF-8
pod install
cd ..
npx react-native run-ios
```

#### 6. Metro Cache Issues

**Solution:**
```bash
cd packages/app
npx react-native start --reset-cache
# Or
rm -rf node_modules/.cache
watchman watch-del-all
```

### Development Tools

#### React Native Debugger

1. Install [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
2. Enable debugging in the app (Cmd+D on iOS, Cmd+M on Android)
3. Select "Debug" to connect

#### Flipper (Optional)

For advanced debugging, install [Flipper](https://fbflipper.com/).

## Project Structure

```
Vyeya/
├── packages/
│   ├── app/                    # React Native mobile app
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── screens/        # Screen components
│   │   │   ├── navigation/     # Navigation configuration
│   │   │   └── services/       # API services
│   │   ├── android/            # Android-specific code
│   │   ├── ios/                # iOS-specific code
│   │   ├── App.tsx             # Main app component
│   │   ├── index.js            # App entry point
│   │   └── package.json
│   ├── server/                 # Node.js backend
│   │   ├── src/
│   │   │   ├── routes/         # API routes
│   │   │   ├── models/         # Database models
│   │   │   ├── middleware/     # Express middleware
│   │   │   └── services/       # Business logic
│   │   └── package.json
│   └── shared/                 # Shared TypeScript types
│       ├── src/
│       │   └── index.ts        # Exported types and interfaces
│       └── package.json
├── pnpm-workspace.yaml         # pnpm workspace configuration
├── package.json                # Root package.json
└── README.md
```

## Available Scripts

### Root Level
```bash
# Install all dependencies
pnpm install

# Run server
pnpm --filter server dev

# Run mobile app
pnpm --filter app ios
pnpm --filter app android
```

### App Package
```bash
cd packages/app

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test

# Lint code
npm run lint
```

### Server Package
```bash
cd packages/server

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Dependencies

### Mobile App Key Dependencies
- **React Native**: 0.80.2
- **React Navigation**: ^7.1.17 (Stack Navigator)
- **React Native Screens**: ^4.13.1
- **React Native Gesture Handler**: ^2.28.0 (Required for navigation)
- **React Native Safe Area Context**: ^5.6.0
- **Tailwind RN (twrnc)**: ^4.9.1
- **AWS Cognito Identity JS**: ^6.3.15
- **Babel Runtime**: ^7.28.2 (Critical for Metro bundler)

### Backend Key Dependencies
- **Express.js**: Latest
- **TypeScript**: 5.x
- **Node.js**: v22+

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

[Add your license information here]