# Develop Branch CI/CD Pipeline Stages

The develop branch runs a comprehensive 3-stage CI pipeline focused on testing and quality assurance before merging to main.

## Pipeline Overview

**Total Pipeline Time**: 45-65 minutes  
**Total Tests**: 191 tests (166 unit + 17 integration + 8 mobile E2E)  
**Environment**: Testing-only (no deployments)

## Stage Breakdown

### Stage 1: 🚦 Quality Gate (5-10 minutes)
**Purpose**: Code quality validation and unit testing  
**Dependencies**: None  
**Tests**: 166 unit tests

**Activities**:
- Dependency installation with pnpm
- ESLint code quality checks  
- TypeScript type checking
- Unit test execution (166 tests)
- Security vulnerability scanning with Trivy
- SARIF security report upload

**Success Criteria**: 
- All linting rules pass
- No TypeScript errors  
- 166/166 unit tests pass
- Security scan completes (warnings allowed)

### Stage 2: 🔗 Integration Tests (10-15 minutes)  
**Purpose**: Database and service integration testing  
**Dependencies**: Stage 1 (Quality Gate)  
**Tests**: 17 integration tests

**Activities**:
- Docker Compose CI environment setup
- PostgreSQL 16 + Redis 7 service startup  
- Database schema initialization
- API integration testing with real database
- HTTP route validation
- Service cleanup

**Success Criteria**:
- All services start successfully
- Database connection established  
- 17/17 integration tests pass
- HTTP endpoints respond correctly

### Stage 3: 📱 Mobile E2E Tests (20-30 minutes)
**Purpose**: End-to-end mobile application testing  
**Dependencies**: Stage 2 (Integration Tests)  
**Tests**: 8 mobile E2E tests (4 Android + 4 iOS)

**Activities**:
- Android SDK and Java 17 setup
- Maestro CLI installation
- Backend service startup with test database
- E2E test data initialization  
- Headless mobile testing execution
- Test result artifact collection

**Success Criteria**:
- Backend services respond to health checks
- Test data setup completes successfully
- Mobile E2E tests execute in headless mode
- Minimum 6/8 tests pass (75% success rate)

## Environment Configuration

### Database
- **PostgreSQL**: 16-alpine on port 5433
- **Redis**: 7-alpine on port 6380  
- **Database**: vyeya_test with test schema

### Backend
- **Node.js**: v22 with TypeScript
- **Server**: Express API on port 3000
- **Environment**: NODE_ENV=test

### Mobile Testing  
- **Framework**: Maestro CLI v1.41.0
- **Mode**: Headless (CI-compatible)
- **Platforms**: Android emulator + iOS simulator

## Test Coverage Summary

| Test Type | Count | Purpose |
|-----------|--------|---------|
| Unit Tests | 166 | Function/component validation |
| Integration Tests | 17 | Database/API integration |  
| Mobile E2E Tests | 8 | Cross-platform app testing |
| **Total** | **191** | **Complete application coverage** |

## Deployment Strategy

The develop branch **does not deploy** to any environment. Its purpose is comprehensive testing validation.

**Next Steps After Success**:
1. Create Pull Request to `main` branch
2. Main branch triggers full deployment pipeline  
3. Includes production deployment to AWS infrastructure

## Pipeline Files

- **Workflow**: `.github/workflows/develop-ci.yml`
- **Docker Config**: `docker-compose.ci.yml`  
- **Mobile Tests**: `packages/app/maestro/`
- **Scripts**: `scripts/setup-e2e-data.sh`, `scripts/ci-e2e-tests.sh`
