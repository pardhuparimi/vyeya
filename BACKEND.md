# Vyeya Backend API

## Current Implementation Status

✅ **Completed:**
- Express.js server with TypeScript
- RESTful API structure (/api/v1/)
- PostgreSQL database models
- Product CRUD operations
- Database schema with relationships
- Docker setup for local development
- Database connection working
- Sample data loaded
- Environment configuration
- CORS and JSON middleware

❌ **Pending:**
- User authentication (JWT/Cognito)
- File upload (S3 integration)
- Real-time features (WebSocket)
- Input validation middleware
- Error handling middleware
- API testing suite

## API Endpoints

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create new product

### Users
- `GET /api/v1/users/profile` - Get user profile
- `POST /api/v1/users/register` - Register new user

### Stores
- `GET /api/v1/stores` - Get all stores
- `GET /api/v1/stores/:id` - Get store by ID
- `POST /api/v1/stores` - Create new store

## Database Schema

### Tables Created:
- `users` - User accounts and profiles
- `stores` - Seller store information
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Order management
- `reviews` - Product reviews

### Key Features:
- JSONB columns for flexible location/address data
- Foreign key relationships
- Performance indexes
- Sample data included

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

# Initialize database schema
docker compose exec postgres psql -U postgres -d vyeya -f /docker-entrypoint-initdb.d/init-db.sql
```

### 3. Start Server
```bash
cd packages/server
pnpm dev
```

### 4. Verify Setup
```bash
# Test API endpoint
curl http://localhost:3000/api/v1/products

# Check database
docker compose exec postgres psql -U postgres -d vyeya -c "SELECT * FROM products;"
```

Server runs on http://localhost:3000

## Architecture

```
src/
├── config/
│   └── database.ts          # PostgreSQL connection
├── models/
│   └── Product.ts           # Database models
├── routes/
│   ├── products.ts          # Product endpoints
│   ├── users.ts             # User endpoints
│   └── stores.ts            # Store endpoints
├── scripts/
│   └── init-db.sql          # Database schema
└── index.ts                 # Express server
```

## Next Steps

1. **Database Connection** - Set up local PostgreSQL
2. **Authentication** - Implement JWT middleware
3. **Validation** - Add input validation
4. **Error Handling** - Standardize error responses
5. **Testing** - Add unit and integration tests