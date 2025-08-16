# Vyeya - Direct Producer-to-Consumer Marketplace

Vyeya is a native mobile app (iOS and Android) connecting local produce growers directly with consumers, eliminating middlemen and ensuring fair prices. Whether you're a farmer, backyard gardener, or small-scale grower, this platform empowers you to sell your fresh produce directly to your community while providing consumers with fresh, affordable local products.

## Project Overview

This repository contains the source code for the Vyeya mobile application and its backend services. It is structured as a monorepo using [pnpm workspaces](https://pnpm.io/workspaces).

-   **`packages/app`**: The React Native mobile application for growers and consumers.
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
- ✅ Bottom tab navigation (Home, Browse, Search, Cart, Profile)
- ✅ Authentication context with persistent sessions
- ✅ User profile management (view, edit profile)
- ✅ Product management (add, view, search products)
- ✅ Shopping cart with quantity controls
- ✅ Product browsing with category filtering
- ✅ Toast notification system

### Backend API
- ✅ Express.js server with TypeScript
- ✅ RESTful API endpoints for authentication
- ✅ JWT middleware for route protection
- ✅ Input validation and error handling
- ✅ PostgreSQL database integration
- ✅ Product CRUD operations
- ✅ Product search functionality
- ✅ User-specific product endpoints

### Database
- ✅ PostgreSQL database with Docker setup
- ✅ Database models and schema
- ✅ Sample data initialization
- ✅ Product management with database persistence
- ✅ Product search with ILIKE queries

## Architecture Progress

### ✅ Phase 1: Authentication & Security (COMPLETED)
- JWT token-based authentication
- Secure password hashing with bcrypt
- Token persistence and session management
- Protected API routes
- Input validation and sanitization

### ✅ Phase 2: Core User Features (COMPLETED)
- User profile management
- Product browsing and search
- Shopping cart functionality
- Bottom tab navigation
- Toast notification system
- Category-based filtering

### 🚧 Phase 3: API Architecture (IN PROGRESS)
- [ ] Standardized API response format
- [ ] Comprehensive error handling middleware
- [ ] Request/response logging
- [ ] API versioning consistency
- [ ] Rate limiting implementation

### 📋 Phase 4: Order Management (PLANNED)
- [ ] Order creation and tracking
- [ ] Order history for users
- [ ] Order status updates
- [ ] Payment integration
- [ ] Delivery tracking

### 📋 Phase 5: Real-time Features (PLANNED)
- [ ] WebSocket integration
- [ ] Push notifications
- [ ] Real-time inventory updates
- [ ] Chat system between buyers/sellers

### 📋 Phase 6: Advanced Features (PLANNED)
- [ ] Location-based product discovery
- [ ] Image upload for products
- [ ] Reviews and ratings
- [ ] Seller verification
- [ ] Advanced search filters

### 📋 Phase 7: Performance & Scalability (PLANNED)
- [ ] Image optimization and CDN
- [ ] API rate limiting
- [ ] Database connection pooling
- [ ] Pagination implementation
- [ ] Offline-first architecture

## Quick Start

See [SETUP.md](SETUP.md) for detailed installation and setup instructions.

**TL;DR:**
```bash
# 1. Start database
docker compose up -d

# 2. Start backend
cd packages/server && npm run dev

# 3. Run mobile app
cd packages/app && npm run android
```





## API Endpoints

### Health Check
- `GET /health` - Server and database status

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration  
- `GET /api/v1/auth/me` - Get current user (protected)
- `POST /api/v1/auth/logout` - User logout (protected)

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/search?q=query` - Search products
- `GET /api/v1/products/my` - Get user's products (protected)
- `POST /api/v1/products` - Create product (protected)
- `GET /api/v1/products/:id` - Get product by ID
- `PUT /api/v1/products/:id` - Update product (protected)
- `DELETE /api/v1/products/:id` - Delete product (protected)

### User Profile
- `PUT /api/v1/auth/profile` - Update user profile (protected)



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

## Development

### Test Authentication
- **Existing Grower**: `grower@vyeya.com` / `password`
- **New Users**: Use signup form with unique email addresses

### Troubleshooting
See [SETUP.md](SETUP.md) for common issues and solutions.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

[Add your license information here]