# Production Deployment Guide

This guide covers the complete production deployment setup for the Vyeya platform using AWS ECS, GitHub Actions CI/CD, and infrastructure as code with Terraform.

## Architecture Overview

The Vyeya platform is deployed using a three-tier architecture:

- **Development Environment**: `develop` branch → `vyeya-dev` ECS cluster
- **QA Environment**: `release/*` branches → `vyeya-qa` ECS cluster
- **Production Environment**: `main` branch → `vyeya-prod` ECS cluster

## Prerequisites

### 1. AWS Setup
- AWS Account with appropriate permissions
- ECR repositories created
- S3 bucket for Terraform state
- DynamoDB table for Terraform locks

### 2. GitHub Setup
- Repository with branch protection rules
- Required secrets and variables configured
- Environments configured (development, qa, production)

## Infrastructure Components

### AWS Services Used
- **ECS Fargate**: Container orchestration
- **RDS PostgreSQL**: Database
- **Application Load Balancer**: Traffic distribution
- **ECR**: Container registry
- **VPC**: Network isolation
- **CloudWatch**: Monitoring and logging
- **SNS**: Alerting
- **Application Insights**: APM

### Security Features
- VPC with public/private subnets
- Security groups with least privilege
- IAM roles with minimal permissions
- Container vulnerability scanning
- Dependency security auditing
- CodeQL static analysis

## Deployment Process

### 1. Code Quality Gates
- **Linting**: ESLint for code quality
- **Type Checking**: TypeScript compilation
- **Unit Tests**: Jest test suite
- **Coverage**: Code coverage reporting
- **Security Scanning**: Trivy and npm audit

### 2. Build Process
- **API Server**: Docker multi-stage build with Node 22
- **Mobile App**: Android APK build and signing
- **Performance Testing**: k6 load testing
- **Integration Testing**: Database and API tests

### 3. Deployment Strategy
- **Development**: Automatic deployment on `develop` branch
- **QA**: Automatic deployment on `release/*` branches
- **Production**: Automatic deployment on `main` branch with blue/green strategy

### 4. Testing Strategy
- **Unit Tests**: Component and service testing
- **Integration Tests**: Database and API integration
- **E2E Tests**: Maestro mobile app testing
- **Load Tests**: k6 performance validation
- **Security Tests**: Vulnerability scanning

## Environment Configuration

### Development Environment
```yaml
Environment: development
Branch: develop
AWS Cluster: vyeya-dev
Database: vyeya-dev RDS instance
Domain: dev-api.vyeya.com
```

### QA Environment
```yaml
Environment: qa
Branch: release/*
AWS Cluster: vyeya-qa
Database: vyeya-qa RDS instance
Domain: qa-api.vyeya.com
```

### Production Environment
```yaml
Environment: production
Branch: main
AWS Cluster: vyeya-prod
Database: vyeya-prod RDS instance
Domain: api.vyeya.com
```

## Required Secrets

### GitHub Secrets
```
AWS_ACCESS_KEY_ID: AWS access key
AWS_SECRET_ACCESS_KEY: AWS secret key
ANDROID_KEYSTORE: Base64 encoded keystore
ANDROID_STORE_PASSWORD: Keystore password
ANDROID_KEY_PASSWORD: Key password
CODECOV_TOKEN: Code coverage token
```

### Environment Variables (per environment)
```
DATABASE_URL: PostgreSQL connection string
REDIS_URL: Redis connection string (optional)
JWT_SECRET: JWT signing secret
API_URL: API base URL for mobile app
AWS_REGION: AWS region (default: us-east-1)
```

## Infrastructure Deployment

### 1. Initialize Terraform
```bash
cd infrastructure
terraform init
```

### 2. Plan Infrastructure
```bash
# Development
terraform plan -var-file=environments/dev.tfvars

# QA
terraform plan -var-file=environments/qa.tfvars

# Production
terraform plan -var-file=environments/prod.tfvars
```

### 3. Apply Infrastructure
```bash
# Development
terraform apply -var-file=environments/dev.tfvars

# QA
terraform apply -var-file=environments/qa.tfvars

# Production
terraform apply -var-file=environments/prod.tfvars
```

## Monitoring and Alerting

### CloudWatch Dashboards
- ECS service metrics (CPU, memory, tasks)
- Application Load Balancer metrics
- RDS database metrics
- Custom application metrics

### Alerts
- High CPU utilization (>80%)
- High memory utilization (>80%)
- High response time (>2s)
- 5XX error rate threshold
- Database connection issues

### Log Aggregation
- Application logs via CloudWatch Logs
- Container logs with structured logging
- Performance metrics collection
- Error tracking and alerting

## Performance Optimization

### Container Optimization
- Multi-stage Docker builds
- Alpine Linux base images
- Non-root user execution
- Health check endpoints
- Resource limits and requests

### Database Optimization
- Connection pooling
- Read replicas for production
- Automated backups
- Performance monitoring

### Caching Strategy
- Redis for session management
- CDN for static assets
- Database query optimization

## Security Best Practices

### Container Security
- Vulnerability scanning with Trivy
- Non-root user execution
- Minimal base images
- Security group restrictions

### Network Security
- VPC with private subnets
- Security groups with least privilege
- HTTPS/TLS termination at load balancer
- Database in private subnets

### Code Security
- Dependency vulnerability scanning
- Static code analysis with CodeQL
- Secrets management via AWS Secrets Manager
- Regular security updates

## Rollback Strategy

### Automatic Rollback
- Health check failures trigger rollback
- CloudWatch alarms can trigger rollback
- ECS service deployment circuit breaker

### Manual Rollback
```bash
# Rollback to previous task definition
aws ecs update-service \
  --cluster vyeya-prod \
  --service vyeya-api-prod \
  --task-definition vyeya-api-prod:PREVIOUS_REVISION
```

## Troubleshooting

### Common Issues
1. **Deployment Failures**: Check ECS service events and CloudWatch logs
2. **Health Check Failures**: Verify application health endpoints
3. **Database Connection Issues**: Check security groups and connection strings
4. **High Response Times**: Monitor database and application metrics

### Useful Commands
```bash
# Check ECS service status
aws ecs describe-services --cluster vyeya-prod --services vyeya-api-prod

# View CloudWatch logs
aws logs tail /aws/ecs/vyeya-api-prod --follow

# Check task definition
aws ecs describe-task-definition --task-definition vyeya-api-prod
```

## Scaling Configuration

### Auto Scaling
- CPU-based scaling (target 70%)
- Memory-based scaling (target 80%)
- Application Load Balancer target tracking

### Manual Scaling
```bash
# Scale ECS service
aws ecs update-service \
  --cluster vyeya-prod \
  --service vyeya-api-prod \
  --desired-count 5
```

## Backup and Recovery

### Database Backups
- Automated daily backups with 7-day retention
- Point-in-time recovery capability
- Cross-region backup replication for production

### Application State
- Stateless application design
- Configuration via environment variables
- Container image versioning and tagging

## Cost Optimization

### Resource Optimization
- Right-sizing ECS tasks
- Spot instances for development/QA
- Reserved instances for production
- Auto-scaling to match demand

### Monitoring Costs
- AWS Cost Explorer integration
- Budget alerts for cost thresholds
- Resource tagging for cost allocation

## Compliance and Governance

### Compliance Features
- Encryption at rest and in transit
- Audit logging via CloudTrail
- Access control via IAM
- Data retention policies

### Governance
- Infrastructure as Code (Terraform)
- Version control for all configurations
- Change management via pull requests
- Environment promotion process
