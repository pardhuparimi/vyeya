# Vyeya CI/CD Pipeline

This document details the automated Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Vyeya platform, implemented using GitHub Actions.

## 🔄 Workflow Overview

The pipeline is defined in `.github/workflows/ci-cd.yml` and is triggered on:
- **Push** to `main`, `develop`, and `release/*` branches.
- **Pull Requests** targeting `main` and `develop` branches.

## 📊 Pipeline Stages

The workflow consists of several parallel and dependent jobs:

### 1. 🧹 Lint and Test (`lint-and-test`)
Runs quality checks on the entire codebase.
- **Linting:** Runs `pnpm lint` to check code style and potential errors.
- **Type Checking:** Runs `pnpm type-check` (TypeScript) for both server and app.
- **Unit Tests:** Runs `pnpm test:unit` for backend logic and frontend components.
- **Coverage:** Generates and uploads code coverage reports to Codecov.

### 2. 🛡️ Security Scan (`security-scan`)
Performs security audits on dependencies and code.
- **npm audit:** Checks for known vulnerabilities in dependencies.
- **Trivy:** Scans the filesystem for security flaws.
- **CodeQL:** Runs semantic code analysis to find logic vulnerabilities.

### 3. 🏗️ Build and Test API (`build-and-test-api`)
*Depends on: Lint and Test*
Builds and verifies the backend server.
- **Build:** Compiles the TypeScript server code.
- **Database:** Spins up ephemeral PostgreSQL and Redis containers.
- **Integration Tests:** Runs `pnpm test:integration` against the test database.
- **Load Testing:** Runs k6 load tests to ensure performance benchmarks.
- **Docker Build:** Builds the backend Docker image and scans it for container vulnerabilities.

### 4. 📱 Build Mobile App (`build-mobile`)
*Depends on: Lint and Test*
Builds the React Native mobile application.
- **Android Build:** Compiles the Android APK (`assembleRelease`).
- **Signing:** Signs the APK using the release keystore.
- **Artifacts:** Uploads the signed APK for testing.

### 5. 🤖 E2E Tests (`e2e-tests`)
*Depends on: Build API, Build Mobile*
Runs End-to-End tests on a real Android emulator.
- **Setup:** Spins up the API server (from the built Docker image) and an Android Emulator.
- **Install:** Installs the built APK onto the emulator.
- **Maestro:** Executes E2E test flows defined in `packages/app/maestro/` (e.g., login, navigation).

## 🚀 Deployment Stages

Deployments are automated based on the branch strategy:

### 🚧 Development (`deploy-dev`)
- **Trigger:** Push to `develop` branch.
- **Target:** AWS ECS (Dev Cluster).
- **Strategy:** Rolling update.
- **Environment:** Low-cost, debug-enabled.

### 🧪 Quality Assurance (`deploy-qa`)
- **Trigger:** Push to `release/*` branches.
- **Target:** AWS ECS (QA Cluster).
- **Strategy:** Rolling update.
- **Environment:** Production parity for validation.

### 🌍 Production (`deploy-prod`)
- **Trigger:** Push to `main` branch.
- **Target:** AWS ECS (Prod Cluster).
- **Strategy:** Blue/Green deployment for zero downtime.
- **Verification:** Post-deployment health checks.
- **Release:** Automatically creates a GitHub Release tag.

## 🛠️ Local Verification

You can run individual steps of the pipeline locally:

```bash
# Run unit tests
pnpm test:unit

# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Run E2E tests (requires Android Emulator)
maestro test packages/app/maestro/
```
