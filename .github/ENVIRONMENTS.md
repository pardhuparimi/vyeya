# Environment-specific configurations for GitHub Actions

## Development Environment
- **Branch**: `develop`
- **AWS Account**: Development AWS Account
- **ECR Repository**: `vyeya-api`
- **ECS Cluster**: `vyeya-dev`
- **ECS Service**: `vyeya-api-dev`
- **Domain**: `dev-api.vyeya.com`

## QA Environment
- **Branch**: `release/*`
- **AWS Account**: QA AWS Account (or same as dev with different resources)
- **ECR Repository**: `vyeya-api`
- **ECS Cluster**: `vyeya-qa`
- **ECS Service**: `vyeya-api-qa`
- **Domain**: `qa-api.vyeya.com`

## Production Environment
- **Branch**: `main`
- **AWS Account**: Production AWS Account
- **ECR Repository**: `vyeya-api`
- **ECS Cluster**: `vyeya-prod`
- **ECS Service**: `vyeya-api-prod`
- **Domain**: `api.vyeya.com`

## Required GitHub Secrets

### AWS Configuration
- `AWS_ACCESS_KEY_ID`: AWS Access Key for all environments
- `AWS_SECRET_ACCESS_KEY`: AWS Secret Key for all environments

### Mobile App Signing
- `ANDROID_KEYSTORE`: Base64 encoded Android keystore file
- `ANDROID_STORE_PASSWORD`: Android keystore password
- `ANDROID_KEY_PASSWORD`: Android key password

### Code Coverage
- `CODECOV_TOKEN`: Token for uploading coverage reports

### GitHub Token
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

## Required GitHub Variables (per environment)
- `AWS_REGION`: AWS region (default: us-east-1)
- `ECR_REGISTRY`: ECR registry URL
- `DATABASE_URL`: Database connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: JWT signing secret
- `API_URL`: API base URL for mobile app

## Security Best Practices
1. Use environment-specific secrets
2. Rotate secrets regularly
3. Use least privilege AWS IAM policies
4. Enable branch protection rules
5. Require pull request reviews
6. Enable vulnerability scanning
