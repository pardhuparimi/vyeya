# Local Environment Sync with CI

This document outlines how to keep your local development environment in sync with the CI/CD pipeline configuration.

## Overview

The CI environment uses specific versions and configurations to ensure consistency. This setup helps avoid the "works on my machine" problem by making local development match the CI environment as closely as possible.

## Environment Specifications

### CI Environment
- **Node.js**: v22
- **pnpm**: v9.15.0
- **PostgreSQL**: 16-alpine
- **Redis**: 7-alpine

### Local vs CI Configuration

| Component | Local (Dev) | Local (Test) | CI (Test) |
|-----------|------------|--------------|-----------|
| PostgreSQL Version | 16-alpine | 16-alpine | 16-alpine |
| PostgreSQL Port | 5432 | 5433 | 5432 |
| PostgreSQL DB | vyeya | vyeya_test | vyeya_test |
| PostgreSQL User | postgres | test | test |
| PostgreSQL Password | password | test | test |
| Redis Port | 6379 | 6380 | 6379 |
| Redis Host | localhost | localhost | redis-test |

## Quick Setup

Run the automated sync script:

```bash
./scripts/sync-local-with-ci.sh
```

This script will:
1. Check Node.js and pnpm versions
2. Update Docker services to match CI
3. Set up test databases
4. Configure environment variables
5. Run integration tests to verify setup

## Manual Setup Steps

### 1. Version Alignment

```bash
# Install Node.js v22 (recommended via nvm)
nvm install 22
nvm use 22

# Install correct pnpm version
npm install -g pnpm@9.15.0
```

### 2. Environment Configuration

Copy the provided environment template:

```bash
cp .env.local .env
```

The `.env` file includes all necessary environment variables for both development and testing.

### 3. Docker Services

Start the test services that match CI:

```bash
# Start test services (PostgreSQL 16 + Redis)
docker compose up -d postgres-test redis-test

# For development, also start main services
docker compose up -d postgres redis
```

### 4. Database Initialization

The test database is automatically configured with the correct schema and test data when services start.

## Test Configuration

### Unit Tests vs Integration Tests

We use separate Jest configurations:

- **Unit Tests**: `jest.config.js` - Fast, isolated tests with mocks allowed
- **Integration Tests**: `jest.integration.config.js` - Real services, no mocks

### Available Test Commands

```bash
# Unit tests (fast, with mocks)
pnpm test:unit

# Integration tests (real services)
pnpm test:e2e       # End-to-end scenarios
pnpm test:http      # HTTP endpoint tests
pnpm test:ci        # Combined integration tests (matches CI)

# Development
pnpm test:watch     # Watch mode for unit tests
```

### Mock-Free Integration Testing

Integration tests automatically verify that no Jest mocks are being used inappropriately:

```typescript
import { verifyNoMocks } from '../utils/testUtils';

// This function is called automatically in integration tests
verifyNoMocks(); // Warns if mocks are detected
```

## CI Pipeline Matching

### Environment Variables

The CI pipeline uses these key environment variables:

```bash
# CI Detection
CI=true
NODE_ENV=test

# Database (CI uses Docker service names)
POSTGRES_HOST=postgres-test
POSTGRES_USER=test
POSTGRES_PASSWORD=test
POSTGRES_DB=vyeya_test
POSTGRES_PORT=5432

# Redis
REDIS_URL=redis://redis-test:6379
```

### Local Test Environment

For local testing, use different ports to avoid conflicts:

```bash
# Local test configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
REDIS_URL=redis://localhost:6380
```

## Verification

### Health Checks

Verify services are running correctly:

```bash
# Check database connection
docker exec vyeya-postgres-test pg_isready -U test -d vyeya_test

# Check Redis connection
docker exec vyeya-redis-test redis-cli ping

# Run health check
curl http://localhost:3000/health
```

### Integration Test Verification

```bash
# Run integration tests to verify sync
cd packages/server
pnpm test:ci
```

Expected output should show:
- ✅ All integration tests passing
- 🚀 "Starting Integration Tests - No Mocks Enabled"
- 📋 "All services will use real implementations"

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Ensure test services use different ports (5433, 6380)
   - Stop other PostgreSQL/Redis instances if needed

2. **Database Connection Errors**
   - Wait for health checks to pass before running tests
   - Check Docker container logs: `docker compose logs postgres-test`

3. **Node.js Version Mismatch**
   - Use nvm to switch to Node.js v22
   - Some features may work differently on v23+

4. **Jest Configuration Issues**
   - Integration tests use separate config (`jest.integration.config.js`)
   - Ensure no mocks are imported in integration test files

### Reset Environment

To completely reset your environment:

```bash
# Stop all containers and remove volumes
docker compose down -v

# Remove environment file
rm .env

# Re-run sync script
./scripts/sync-local-with-ci.sh
```

## Continuous Sync

### Pre-commit Hooks

The pre-commit hooks ensure code quality matches CI standards:

```bash
# These run automatically on commit
pnpm lint:strict     # Zero warnings allowed
pnpm type-check      # TypeScript validation
pnpm test:unit       # Unit tests must pass
```

### Regular Verification

Run these commands regularly to ensure sync:

```bash
# Weekly environment check
./scripts/sync-local-with-ci.sh

# Before pushing code
pnpm test:ci

# Before creating PRs
pnpm lint:strict && pnpm test:unit && pnpm test:ci
```

## Benefits

1. **Consistency**: Same behavior locally and in CI
2. **Early Detection**: Catch issues before CI fails
3. **Confidence**: Know that passing local tests mean passing CI
4. **Documentation**: Clear understanding of required environment
5. **Debugging**: Easier to reproduce CI issues locally

## Files Modified/Created

- `docker-compose.yml` - Updated to PostgreSQL 16 and test services
- `.env.local` - Environment template matching CI
- `jest.integration.config.js` - Integration test configuration
- `src/setupIntegrationTests.ts` - Mock detection setup
- `src/utils/testUtils.ts` - Integration test utilities
- `scripts/sync-local-with-ci.sh` - Automated sync script
- `package.json` - Updated test scripts for CI compatibility

This setup ensures your local development environment stays in perfect sync with the CI pipeline, reducing surprises and improving development velocity.
