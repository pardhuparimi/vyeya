# 🚀 Vyeya Platform - Production-Ready E-commerce

> **Enterprise-grade React Native + Node.js platform with automated AWS deployment**

[![CI/CD Pipeline](https://github.com/pardhuparimi/vyeya/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/pardhuparimi/vyeya/actions)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.80+-blue.svg)](https://reactnative.dev/)
[![AWS](https://img.shields.io/badge/AWS-Production%20Ready-orange.svg)](https://aws.amazon.com/)

## 🎯 Quick Start (5 Minutes)

```bash
# 1. Clone and setup
git clone https://github.com/pardhuparimi/vyeya.git
cd vyeya && ./scripts/production-setup.sh

# 2. Setup AWS (one-time)
aws configure  # Add your AWS credentials
pnpm aws:setup  # Auto-configure AWS resources

# 3. Deploy infrastructure
pnpm infra:apply:dev    # Deploy development environment
pnpm infra:apply:prod   # Deploy production environment

# 4. Start developing
pnpm dev               # Start all services locally
```

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION PLATFORM                      │
├─────────────────┬─────────────────┬─────────────────────────┤
│   DEVELOPMENT   │       QA        │      PRODUCTION         │
│                 │                 │                         │
│ • develop branch│ • release/*     │ • main branch           │
│ • Cost optimized│ • Full testing  │ • High availability     │
│ • Fast iteration│ • Staging env   │ • Auto-scaling          │
└─────────────────┴─────────────────┴─────────────────────────┘
│
├── 📱 Mobile Apps (React Native)
│   ├── Android (Google Play Store ready)
│   └── iOS (Apple App Store ready)
│
├── 🖥️ Backend API (Node.js 22 + TypeScript)
│   ├── REST API with Express
│   ├── PostgreSQL database
│   └── Health monitoring
│
└── ☁️ AWS Infrastructure (Auto-configured)
    ├── ECS Fargate (Container orchestration)
    ├── RDS PostgreSQL (Managed database)
    ├── Application Load Balancer (High availability)
    ├── ECR (Container registry)
    ├── CloudWatch (Monitoring & alerts)
    └── VPC (Network security)
```

## ✨ Key Features

### 🔄 **Automated CI/CD Pipeline**
- **Multi-environment deployment** (dev/qa/prod)
- **Security scanning** (Trivy, npm audit, CodeQL)
- **Performance testing** (k6 load testing)
- **E2E testing** (Maestro mobile testing)
- **Zero-downtime deployments** (Blue/green strategy)

### 📱 **Mobile-First Design**
- **React Native 0.80+** with TypeScript
- **Android & iOS** app store ready builds
- **Automated signing** and deployment
- **E2E testing** with Maestro
- **Performance optimized** bundles

### ⚡ **Modern Backend Stack**
- **Node.js 22** (latest LTS)
- **TypeScript** for type safety
- **Express.js** with modular architecture
- **PostgreSQL** with connection pooling
- **Health checks** and monitoring

### ☁️ **Production AWS Infrastructure**
- **Auto-scaling ECS Fargate** clusters
- **RDS PostgreSQL** with automated backups
- **CloudWatch** monitoring and alerting
- **VPC security** with isolated networks
- **Load balancer** with health checks

### 🛡️ **Security & Best Practices**
- **Container security** scanning
- **Dependency vulnerability** auditing
- **Network isolation** with VPC
- **Encrypted communication** (HTTPS/TLS)
- **IAM least privilege** access

## 📋 Environment Guide

| Environment | Purpose | Branch | Auto-Deploy | Infrastructure |
|-------------|---------|--------|-------------|----------------|
| **Development** | Rapid development & testing | `develop` | ✅ Every push | Minimal (cost-effective) |
| **QA** | User acceptance testing | `release/*` | ✅ Release branches | Production-like |
| **Production** | Live user traffic | `main` | ✅ After QA approval | High-availability |

### 🔧 Development Environment
- **Fast deployment** (2-3 minutes)
- **Debug logging** enabled
- **Test database** with seed data
- **Cost optimized** resources

### 🧪 QA Environment  
- **Full test suite** execution
- **Production-like** data volumes
- **Performance testing** validation
- **Security scanning** comprehensive

### 🚀 Production Environment
- **Zero-downtime** deployments
- **Auto-scaling** based on traffic
- **Real-time monitoring** and alerting
- **Automated backups** and recovery

## 📱 Mobile App Store Deployment

### 🤖 Android (Google Play Store)
```bash
# Automated CI/CD builds signed APK/AAB
# Download from GitHub Actions artifacts
# Upload to Google Play Console
# Review process: 1-3 days

# Quick commands:
cd packages/app/android && ./gradlew bundleRelease  # Manual build
```

### 🍎 iOS (Apple App Store)  
```bash
# Automated CI/CD uploads to TestFlight
# Submit for App Store review
# Review process: 1-3 days

# Quick commands:
cd packages/app/ios && open Vyeya.xcworkspace  # Open in Xcode
```

**📋 See [Mobile App Store Deployment Guide](./MOBILE_APP_STORE_DEPLOYMENT.md) for detailed instructions**

## ⚙️ AWS Configuration (Simplified)

### Minimal Setup Required
```bash
# Only these need configuration:
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret  
ALERT_EMAIL=your-email@company.com  # For CloudWatch alerts
```

### Auto-Configured Resources
- ✅ **VPC** with public/private subnets
- ✅ **ECS Fargate** clusters with auto-scaling
- ✅ **RDS PostgreSQL** with automated backups
- ✅ **Application Load Balancer** with health checks
- ✅ **CloudWatch** monitoring and dashboards
- ✅ **ECR** container registry
- ✅ **Security Groups** with minimal required access
- ✅ **IAM Roles** with least privilege

### Environment-Specific Scaling
```bash
# Development: 1-3 tasks, db.t3.micro (cost-optimized)
# QA: 2-5 tasks, db.t3.small (production-like)  
# Production: 3-20 tasks, db.r6g.large (high-performance)
```

## 🛠️ Development Commands

```bash
# Quick start
pnpm env:check           # Check environment consistency
pnpm env:setup           # Run full production setup
pnpm aws:setup           # Configure AWS resources

# Development
pnpm dev                 # Start all services locally
pnpm test                # Run all tests
pnpm lint                # Code linting
pnpm type-check         # TypeScript checking

# Mobile development
pnpm android            # Run Android app
pnpm ios                # Run iOS app  
pnpm test:e2e          # E2E tests with Maestro

# Infrastructure
pnpm infra:plan:dev     # Plan dev infrastructure changes
pnpm infra:apply:dev    # Deploy dev infrastructure
pnpm infra:plan:prod    # Plan prod infrastructure changes
pnpm infra:apply:prod   # Deploy prod infrastructure

# Quality assurance
pnpm security:audit    # Security vulnerability audit
pnpm load:test         # Performance load testing
pnpm health:check      # API health validation
```

## 📊 Monitoring & Observability

### CloudWatch Dashboards
- **API Performance**: Response times, throughput, error rates
- **Infrastructure**: CPU, memory, network utilization
- **Database**: Connections, query performance, locks
- **Mobile Apps**: Crash reports, user sessions

### Automated Alerts (Production)
- 🚨 API response time > 2 seconds
- 🚨 Error rate > 5%
- 🚨 CPU utilization > 80%
- 🚨 Memory utilization > 85%
- 🚨 Database connection issues

## 🔒 Security Features

- **Container vulnerability scanning** with Trivy
- **Dependency security auditing** with npm audit
- **Static code analysis** with CodeQL
- **Network isolation** with VPC and security groups
- **Encrypted communication** (HTTPS/TLS everywhere)
- **Secrets management** via AWS Secrets Manager
- **IAM least privilege** access policies

## 📚 Documentation

- 📖 **[Complete Setup Guide](./COMPLETE_SETUP_GUIDE.md)** - Comprehensive setup instructions
- 📱 **[Mobile App Store Deployment](./MOBILE_APP_STORE_DEPLOYMENT.md)** - App store deployment guide  
- 🏗️ **[Production Deployment](./PRODUCTION_DEPLOYMENT.md)** - Infrastructure deployment guide
- 🔧 **[Backend Documentation](./BACKEND.md)** - API and server documentation
- 🛠️ **[Setup Guide](./SETUP.md)** - Basic setup instructions
- 🔍 **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

## 🎯 Production Readiness Checklist

- ✅ **Node.js 22+** with modern tooling
- ✅ **Three-tier infrastructure** (dev/qa/prod)
- ✅ **Automated CI/CD pipeline** with quality gates
- ✅ **Security scanning** and vulnerability management
- ✅ **Performance testing** and load validation
- ✅ **Mobile app store** deployment ready
- ✅ **Monitoring and alerting** comprehensive
- ✅ **Auto-scaling** and high availability
- ✅ **Backup and recovery** strategies
- ✅ **Documentation** complete

## 🚀 Getting Started

1. **Clone**: `git clone https://github.com/pardhuparimi/vyeya.git`
2. **Setup**: `cd vyeya && ./scripts/production-setup.sh`
3. **AWS**: `aws configure && pnpm aws:setup`
4. **Deploy**: `pnpm infra:apply:dev`
5. **Develop**: `pnpm dev`

**🎉 You're ready for production! 🚀**

## 📞 Support & Contributing

- **Issues**: [GitHub Issues](https://github.com/pardhuparimi/vyeya/issues)
- **Discussions**: [GitHub Discussions](https://github.com/pardhuparimi/vyeya/discussions)
- **Contributing**: See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**Built with ❤️ for production-scale applications** - Direct Producer-to-Consumer Marketplace

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