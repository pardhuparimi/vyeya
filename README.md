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
-   **Authentication**: JWT tokens with bcrypt password hashing
-   **Package Manager**: pnpm with workspaces

## Current Features ✅

### Authentication & Security
- ✅ JWT-based authentication with secure token generation
- ✅ bcrypt password hashing for secure password storage
- ✅ Token persistence using AsyncStorage
- ✅ Protected routes with authentication middleware
- ✅ Login/logout functionality with proper state management

### Mobile Application
- ✅ React Native app with TypeScript
- ✅ Conditional navigation (login screen → dashboard)
- ✅ Authentication context with persistent sessions
- ✅ Seller dashboard with product management
- ✅ Add product functionality with form validation

### Backend API
- ✅ Express.js server with TypeScript
- ✅ RESTful API endpoints for authentication
- ✅ JWT middleware for route protection
- ✅ Input validation and error handling
- ✅ PostgreSQL database integration
- ✅ Product CRUD operations

### Database
- ✅ PostgreSQL database with Docker setup
- ✅ Database models and schema
- ✅ Sample data initialization
- ✅ Product management with database persistence

## Architecture Progress

### ✅ Phase 1: Authentication & Security (COMPLETED)
- JWT token-based authentication
- Secure password hashing with bcrypt
- Token persistence and session management
- Protected API routes
- Input validation and sanitization

### 🚧 Phase 2: API Architecture (IN PROGRESS)
- [ ] Standardized API response format
- [ ] Comprehensive error handling middleware
- [ ] Request/response logging
- [ ] API versioning consistency
- [ ] Rate limiting implementation

### 📋 Phase 3: Database Design (PLANNED)
- [ ] Complete relational schema implementation
- [ ] Database indexes for performance
- [ ] Database migrations system
- [ ] Data validation at database level
- [ ] Connection pooling

### 📋 Phase 4: State Management (PLANNED)
- [ ] Redux/Zustand for complex state
- [ ] Offline-first architecture
- [ ] Data caching strategy
- [ ] Network connectivity handling

### 📋 Phase 5: Real-time Features (PLANNED)
- [ ] WebSocket integration
- [ ] Push notifications
- [ ] Real-time inventory updates
- [ ] Chat system

### 📋 Phase 6: Performance & Scalability (PLANNED)
- [ ] Image optimization and CDN
- [ ] API rate limiting
- [ ] Database connection pooling
- [ ] Pagination implementation

## Prerequisites

Before setting up the project, ensure you have the following installed:

### Required Software

-   **[Node.js](https://nodejs.org/)** (v22 or later)
-   **[pnpm](https://pnpm.io/installation)** (v8 or later)
-   **[Git](https://git-scm.com/)**
-   **[Docker](https://www.docker.com/get-started)** (for database)

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

### 3. Start Database

Start PostgreSQL and Redis using Docker:

```bash
docker-compose up -d
```

### 4. Environment Setup

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

### 5. iOS Setup (macOS only)

```bash
cd packages/app/ios
pod install
cd ../..
```

### 6. Android Setup

Ensure Android emulator is running or device is connected:

```bash
# List available emulators
emulator -list-avds

# Start an emulator
emulator -avd <emulator-name>

# Or check connected devices
adb devices
```

## Running the Application

### 1. Start Database
```bash
docker-compose up -d
```

### 2. Start Backend Server
```bash
pnpm --filter server dev
```

### 3. Start Mobile App

#### iOS (macOS only)
```bash
pnpm --filter app ios
```

#### Android
```bash
pnpm --filter app android
```

## Authentication

The app uses JWT-based authentication with the following test credentials:

- **Email**: `seller@vyeya.com`
- **Password**: `password`
- **Role**: `seller`

Additional test user:
- **Email**: `buyer@vyeya.com`
- **Password**: `password`
- **Role**: `buyer`

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user (protected)
- `POST /api/v1/auth/logout` - User logout (protected)

### Products
- `GET /api/v1/products` - Get all products
- `POST /api/v1/products` - Create product (protected)
- `GET /api/v1/products/:id` - Get product by ID
- `PUT /api/v1/products/:id` - Update product (protected)
- `DELETE /api/v1/products/:id` - Delete product (protected)

## Project Structure

```
Vyeya/
├── packages/
│   ├── app/                    # React Native mobile app
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── screens/        # Screen components
│   │   │   ├── navigation/     # Navigation configuration
│   │   │   ├── context/        # React contexts (Auth)
│   │   │   └── services/       # API services
│   │   ├── android/            # Android-specific code
│   │   ├── ios/                # iOS-specific code
│   │   └── package.json
│   ├── server/                 # Node.js backend
│   │   ├── src/
│   │   │   ├── routes/         # API routes
│   │   │   ├── models/         # Database models
│   │   │   ├── middleware/     # Express middleware
│   │   │   ├── services/       # Business logic services
│   │   │   └── scripts/        # Database scripts
│   │   └── package.json
│   └── shared/                 # Shared TypeScript types
│       └── package.json
├── docker-compose.yml          # Database containers
├── pnpm-workspace.yaml         # pnpm workspace configuration
└── README.md
```

## Key Dependencies

### Mobile App
- **React Native**: 0.80.2
- **React Navigation**: ^7.1.17
- **AsyncStorage**: ^2.2.0 (Token persistence)
- **Tailwind RN**: ^4.9.1
- **TypeScript**: Latest

### Backend
- **Express.js**: Latest
- **jsonwebtoken**: ^9.0.2 (JWT authentication)
- **bcryptjs**: ^3.0.2 (Password hashing)
- **pg**: Latest (PostgreSQL client)
- **TypeScript**: 5.x

## Development Workflow

1. **Start Database**: `docker-compose up -d`
2. **Start Backend**: `pnpm --filter server dev`
3. **Start Mobile App**: `pnpm --filter app android` or `pnpm --filter app ios`
4. **Login**: Use `seller@vyeya.com` / `password`
5. **Test Features**: Add products, view dashboard, logout/login

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Restart database containers
docker-compose down
docker-compose up -d
```

#### 2. JWT Token Issues
```bash
# Clear app storage and restart
# On Android: Settings > Apps > Vyeya > Storage > Clear Data
```

#### 3. Metro Cache Issues
```bash
cd packages/app
npx react-native start --reset-cache
```

#### 4. iOS Build Issues
```bash
cd packages/app/ios
rm -rf Pods Podfile.lock
pod install
cd ..
npx react-native run-ios
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

[Add your license information here]