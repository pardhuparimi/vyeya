# Vyeya Mobile App

React Native mobile application for the Vyeya hyper-local ecommerce marketplace.

## Overview

This is the mobile frontend for Vyeya, built with React Native and TypeScript. It provides a native mobile experience for both iOS and Android platforms.

## Tech Stack

- **React Native**: 0.80.2
- **TypeScript**: 5.0.4
- **React Navigation**: 7.x (Stack Navigator)
- **Tailwind RN**: 4.x (Styling)
- **AWS Cognito**: Authentication
- **Metro**: Bundler

## Key Dependencies

### Navigation
- `@react-navigation/native`: Core navigation library
- `@react-navigation/stack`: Stack navigator
- `react-native-screens`: Native screen components
- `react-native-safe-area-context`: Safe area handling
- `react-native-gesture-handler`: Gesture handling

### Styling
- `twrnc`: Tailwind CSS for React Native

### Authentication
- `amazon-cognito-identity-js`: AWS Cognito integration

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ProductList.tsx  # Product listing component
├── navigation/          # Navigation configuration
│   └── AppNavigator.tsx # Main app navigator
├── screens/            # Screen components
│   ├── SellerDashboardScreen.tsx
│   └── AddProductScreen.tsx
└── services/           # API services
    └── product.service.ts
```

## Getting Started

### Prerequisites

Ensure you have completed the main project setup from the root README.md.

### Running the App

#### iOS (macOS only)
```bash
# From root directory
pnpm --filter app ios

# Or from app directory
cd packages/app
npx react-native run-ios
```

#### Android
```bash
# From root directory
pnpm --filter app android

# Or from app directory
cd packages/app
npx react-native run-android
```

### Development Server

Start the Metro bundler:
```bash
cd packages/app
npx react-native start
```

## Available Scripts

```bash
# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run tests
npm test

# Lint code
npm run lint
```

## App Architecture

### Navigation Structure

The app uses React Navigation with a stack navigator:

```
AppNavigator
├── SellerDashboard (Initial Route)
└── AddProduct
```

### Screen Components

#### SellerDashboardScreen
- Main dashboard for sellers
- Displays product list
- Navigation to add product screen
- Fetches products from API

#### AddProductScreen
- Form to add new products
- Input validation
- API integration for product creation

### Services

#### product.service.ts
- API calls for product operations
- GET /api/products
- POST /api/products

## Styling

The app uses Tailwind CSS via `twrnc` for styling:

```typescript
import tw from 'twrnc';

// Usage
<View style={tw`flex-1 p-4`}>
  <Text style={tw`text-lg font-bold`}>Hello World</Text>
</View>
```

## State Management

Currently using React's built-in state management:
- `useState` for local component state
- `useEffect` for side effects

## API Integration

The app communicates with the backend server running on `http://localhost:3000`.

### API Endpoints Used
- `GET /api/products` - Fetch all products
- `POST /api/products` - Create new product

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling

### File Naming
- Components: PascalCase (e.g., `ProductList.tsx`)
- Services: camelCase with .service suffix (e.g., `product.service.ts`)
- Screens: PascalCase with Screen suffix (e.g., `SellerDashboardScreen.tsx`)

### Import Order
1. React and React Native imports
2. Third-party libraries
3. Local components and services
4. Type imports

## Debugging

### React Native Debugger
1. Install React Native Debugger
2. Enable debugging in app (Cmd+D on iOS, Cmd+M on Android)
3. Select "Debug"

### Common Debug Commands
```bash
# Reset Metro cache
npx react-native start --reset-cache

# Clean builds
npx react-native clean

# Check React Native setup
npx react-native doctor
```

## Testing

### Running Tests
```bash
npm test
```

### Test Structure
- Unit tests for components
- Integration tests for services
- E2E tests for critical user flows

## Building for Production

### iOS
```bash
npx react-native run-ios --configuration Release
```

### Android
```bash
npx react-native run-android --variant=release
```

## Troubleshooting

### Common Issues

#### Metro bundler fails to start
```bash
rm -rf node_modules/.cache
npx react-native start --reset-cache
```

#### iOS build fails
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npx react-native run-ios
```

#### Android build fails
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

#### Navigation errors
Ensure `react-native-gesture-handler` is imported first in `index.js`:
```javascript
import 'react-native-gesture-handler';
```

## Performance Optimization

### Best Practices
- Use FlatList for large lists
- Implement proper image caching
- Optimize bundle size
- Use Hermes JavaScript engine
- Implement code splitting

## Security

### Best Practices
- Store sensitive data in Keychain/Keystore
- Use HTTPS for API calls
- Implement proper authentication flows
- Validate user inputs
- Use secure storage for tokens

## Contributing

1. Follow the coding standards
2. Write tests for new features
3. Update documentation
4. Test on both iOS and Android
5. Submit pull request with detailed description

## Future Enhancements

- [ ] Add user authentication screens
- [ ] Implement push notifications
- [ ] Add offline support
- [ ] Implement image upload
- [ ] Add location services
- [ ] Implement real-time updates
- [ ] Add dark mode support
- [ ] Implement accessibility features