# Vyeya Backend API

## Current Implementation Status

✅ **Completed:**
- Express.js server with TypeScript
- RESTful API structure (/api/v1/)
- **Controller-based Architecture**
- **Standardized API Responses**
- **Global Error Handling & Logging**
- PostgreSQL database models
- Product CRUD operations
- User Authentication (JWT)
- Database schema with relationships
- Docker setup for local development
- Environment configuration

❌ **Pending:**
- File upload (S3 integration)
- Real-time features (WebSocket)
- Input validation middleware (zod/joi)
- Comprehensive API testing suite (Unit tests started)

## API Endpoints

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create new product (Protected)
- `GET /api/v1/products/my` - Get user's products (Protected)
- `GET /api/v1/products/search` - Search products

### Auth & Users
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register
- `GET /api/v1/auth/me` - Get current user profile (Protected)
- `PUT /api/v1/auth/profile` - Update profile (Protected)

### Orders
- `POST /api/v1/orders` - Create order (Protected)
- `GET /api/v1/orders` - Get user orders (Protected)
- `GET /api/v1/orders/:orderId` - Get order details (Protected)

## Architecture

The backend follows a layered architecture to separate concerns:

```
src/
├── controllers/         # Business logic & request handling
│   ├── auth.controller.ts
│   ├── order.controller.ts
│   └── product.controller.ts
├── middleware/          # Express middleware
│   ├── auth.ts          # JWT Authentication
│   ├── error.ts         # Global error handler
│   └── logger.ts        # Request logger
├── models/              # Database interaction (Data Layer)
│   ├── Order.ts
│   └── Product.ts
├── routes/              # Route definitions
│   ├── auth.ts
│   ├── orders.ts
│   └── products.ts
├── utils/               # Shared utilities
│   ├── AppError.ts      # Custom error class
│   └── apiResponse.ts   # Standardized response helper
└── index.ts             # Application entry point
```

### Standardized API Response

All API endpoints return responses in a consistent JSON format:

**Success Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "..."
  },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message description"
}
```

## Development Flow

### How to Add a New Feature

1.  **Define the Route (`src/routes/`)**
    -   Create or update a route file.
    -   Import the controller.
    -   Define the HTTP method and path.
    -   Add necessary middleware (e.g., `authenticateToken`).

2.  **Create/Update the Controller (`src/controllers/`)**
    -   Create a function to handle the request.
    -   Use `req.body`, `req.params`, or `req.query` to get input.
    -   Call Models or Services to perform business logic.
    -   Use `sendSuccess(res, data, statusCode)` to return data.
    -   Use `next(error)` to handle errors.

3.  **Update the Model (`src/models/`)**
    -   Define database queries or schema interactions.
    -   Return plain data to the controller.

### Error Handling

Use the `AppError` class to throw operational errors that should be sent to the client:

```typescript
import { AppError } from '../utils/AppError';

if (!product) {
  throw new AppError('Product not found', 404);
}
```

Unexpected errors are caught by the global error handler and returned as 500 Internal Server Error (unless they are instances of `AppError`).

## Setup Instructions

### 1. Install Dependencies
```bash
cd packages/server
pnpm install
```

### 2. Start Database with Docker
```bash
# From project root
docker compose up -d
```

### 3. Start Server
```bash
cd packages/server
pnpm dev
```

Server runs on http://localhost:3000
