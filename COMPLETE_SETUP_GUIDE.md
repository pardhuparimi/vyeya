# 📱 Vyeya Platform - Complete Setup & Deployment Guide

## 🎯 Overview

Vyeya is a production-ready e-commerce platform with React Native mobile app and Node.js backend, featuring automated CI/CD, AWS infrastructure, and mobile app store deployment capabilities.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DEVELOPMENT   │    │       QA        │    │   PRODUCTION    │
│                 │    │                 │    │                 │
│ • develop branch│    │ • release/*     │    │ • main branch   │
│ • vyeya-dev     │    │ • vyeya-qa      │    │ • vyeya-prod    │
│ • Quick testing │    │ • UAT & staging │    │ • Live users    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────────────┐
                    │      AWS SERVICES       │
                    │                         │
                    │ • ECS Fargate          │
                    │ • RDS PostgreSQL       │
                    │ • Application LB       │
                    │ • ECR Registry         │
                    │ • CloudWatch Monitor   │
                    │ • VPC & Security       │
                    └─────────────────────────┘
```

## 🚀 Quick Start (5 Minutes)

### Prerequisites
```bash
# Required software
node --version    # Should be 22+ (you have 23.6.0 ✓)
pnpm --version    # Should be 9+ (you have 9.15.0 ✓)
docker --version  # For containerization
aws --version     # For infrastructure
```

### 1. Clone & Setup
```bash
git clone https://github.com/pardhuparimi/vyeya.git
cd vyeya

# Run automated setup
./scripts/production-setup.sh

# Check environment consistency
pnpm env:check
```

### 2. Configure AWS (One-time)
```bash
# Configure AWS credentials
aws configure
# AWS Access Key ID: [your-key]
# AWS Secret Access Key: [your-secret]
# Default region: us-east-1
# Default output format: json
```

### 3. Deploy Infrastructure
```bash
# Initialize Terraform (one-time)
pnpm infra:init

# Deploy to development
pnpm infra:plan:dev
pnpm infra:apply:dev

# Deploy to production (when ready)
pnpm infra:plan:prod
pnpm infra:apply:prod
```

## 🌍 Environment Detailed Guide

### 🔧 Development Environment
**Purpose**: Rapid development and immediate testing
- **Branch**: `develop`
- **Auto-deploy**: Every push to develop branch
- **Infrastructure**: Minimal resources (cost-effective)
- **Database**: Small RDS instance (db.t3.micro)
- **Monitoring**: Basic CloudWatch
- **Access**: Open for developers

```bash
# Development workflow
git checkout develop
git push origin develop
# → Automatic deployment to vyeya-dev
# → Available at: https://dev-api.vyeya.com
```

**Development Features**:
- Fast deployment (2-3 minutes)
- Debug logging enabled
- Development database with test data
- Relaxed security for easier debugging
- Hot reloading and fast iteration

### 🧪 QA Environment  
**Purpose**: User acceptance testing and release validation
- **Branch**: `release/*` (e.g., `release/v1.2.0`)
- **Auto-deploy**: Release branches only
- **Infrastructure**: Production-like setup
- **Database**: Medium RDS instance (db.t3.small)
- **Monitoring**: Full monitoring with alerts
- **Access**: QA team and stakeholders

```bash
# QA workflow
git checkout -b release/v1.2.0
git push origin release/v1.2.0
# → Automatic deployment to vyeya-qa
# → Available at: https://qa-api.vyeya.com
```

**QA Features**:
- Full E2E test suite execution
- Production-like data volumes
- Performance testing
- Security scanning
- Mobile app builds for testing

### 🚀 Production Environment
**Purpose**: Live user traffic and revenue generation
- **Branch**: `main`
- **Auto-deploy**: After QA approval and merge
- **Infrastructure**: High availability, auto-scaling
- **Database**: Production RDS (db.r6g.large) with backups
- **Monitoring**: Comprehensive monitoring, alerting, and logging
- **Access**: Production support team only

```bash
# Production workflow
git checkout main
git merge release/v1.2.0
git push origin main
# → Automatic deployment to vyeya-prod
# → Available at: https://api.vyeya.com
```

**Production Features**:
- Blue/green deployments (zero downtime)
- Automatic rollback on health check failures
- Real-time monitoring and alerting
- Database backups and point-in-time recovery
- Production-signed mobile apps
- CDN and caching optimizations

## 📱 Mobile App Store Deployment

### 🤖 Android - Google Play Store

#### Automatic Build Process
```yaml
# In CI/CD pipeline, Android APK is built with:
- Release configuration
- Production signing keys
- Optimized bundles
- Security scanning
```

#### Manual Store Upload (After CI/CD Build)
```bash
# 1. Download signed APK from GitHub Actions artifacts
# 2. Upload to Google Play Console

# Or build locally for testing:
cd packages/app/android
./gradlew bundleRelease  # Creates AAB file for Play Store
```

#### Google Play Store Setup
1. **Create Google Play Developer Account** ($25 one-time fee)
2. **App Signing Setup**:
   ```bash
   # Generate keystore (done once)
   keytool -genkey -v -keystore release.keystore -alias release-key \
     -keyalg RSA -keysize 2048 -validity 10000
   
   # Convert to base64 for GitHub Secrets
   base64 -i release.keystore -o keystore.txt
   ```

3. **Required GitHub Secrets**:
   ```
   ANDROID_KEYSTORE: [base64 encoded keystore file]
   ANDROID_STORE_PASSWORD: [keystore password]
   ANDROID_KEY_PASSWORD: [key password]
   ```

4. **Upload Process**:
   - CI/CD builds signed APK/AAB
   - Download from GitHub Actions artifacts
   - Upload to Google Play Console
   - Submit for review (2-3 days)

#### Production Android Deployment
```bash
# The CI/CD pipeline automatically:
# 1. Builds release APK with production config
# 2. Signs with production keystore
# 3. Optimizes and minifies
# 4. Uploads as GitHub artifact

# Download artifact and upload to Play Store
# Or set up automated upload with Google Play API
```

### 🍎 iOS - Apple App Store

#### Automatic Build Process
```yaml
# In CI/CD pipeline (requires macOS runner):
- Xcode build configuration
- iOS certificates and provisioning profiles
- App Store Connect API integration
- Automatic TestFlight upload
```

#### iOS Setup Requirements
1. **Apple Developer Account** ($99/year)
2. **Certificates & Provisioning**:
   ```bash
   # Required certificates:
   - iOS Distribution Certificate
   - App Store Provisioning Profile
   - Push Notification Certificate (if using)
   ```

3. **Required GitHub Secrets**:
   ```
   IOS_CERTIFICATE_P12: [base64 encoded certificate]
   IOS_CERTIFICATE_PASSWORD: [certificate password]
   IOS_PROVISIONING_PROFILE: [base64 encoded profile]
   APP_STORE_CONNECT_API_KEY: [API key for automation]
   ```

4. **Xcode Configuration**:
   ```bash
   # Update bundle identifier
   # Set version and build numbers
   # Configure App Store Connect metadata
   ```

#### Production iOS Deployment
```bash
# The CI/CD pipeline automatically:
# 1. Builds iOS archive with release configuration
# 2. Signs with distribution certificate
# 3. Uploads to TestFlight
# 4. Submits for App Store review

# Manual process:
cd packages/app/ios
xcodebuild -workspace Vyeya.xcworkspace -scheme Vyeya \
  -configuration Release -archivePath build/Vyeya.xcarchive archive
```

## ⚙️ AWS Configuration (Simplified)

### Minimal Required Variables
To minimize configuration overhead, most AWS settings are auto-configured:

```bash
# Only these variables need configuration per environment:

# .env (local development)
DATABASE_URL=postgresql://postgres:password@localhost:5432/vyeya_dev
JWT_SECRET=your-local-jwt-secret

# AWS Variables (set once)
AWS_REGION=us-east-1  # Default, can be changed
ALERT_EMAIL=your-email@company.com  # For CloudWatch alerts
```

### Auto-Configured AWS Resources
The Terraform configuration automatically sets up:

```hcl
# Networking
- VPC with public/private subnets
- Internet Gateway and NAT Gateways
- Security Groups with minimal required access
- Application Load Balancer with health checks

# Compute
- ECS Fargate clusters (auto-scaling)
- ECR repositories with lifecycle policies
- Task definitions with resource optimization

# Database
- RDS PostgreSQL with automated backups
- Parameter groups optimized for workload
- Security groups with database-only access

# Monitoring
- CloudWatch log groups with retention
- CloudWatch dashboards for all metrics
- CloudWatch alarms with SNS notifications
- Application Insights for APM

# Security
- IAM roles with minimal required permissions
- VPC endpoints for secure AWS service access
- Encryption at rest and in transit
```

### Environment-Specific Scaling
```bash
# Development (cost-optimized)
ECS Tasks: 1-2 instances
RDS: db.t3.micro (burstable)
Monitoring: Basic metrics

# QA (production-like)
ECS Tasks: 2-4 instances  
RDS: db.t3.small
Monitoring: Full metrics + alerts

# Production (high-availability)
ECS Tasks: 3-10 instances (auto-scaling)
RDS: db.r6g.large (dedicated)
Monitoring: Real-time + advanced insights
```

## 🔒 Security & Secrets Management

### GitHub Secrets Setup
```bash
# Navigate to: GitHub Repository → Settings → Secrets and Variables → Actions

# Required Secrets:
AWS_ACCESS_KEY_ID: [IAM user with ECS/ECR/CloudWatch permissions]
AWS_SECRET_ACCESS_KEY: [corresponding secret key]

# Mobile App Secrets:
ANDROID_KEYSTORE: [base64 encoded Android keystore]
ANDROID_STORE_PASSWORD: [keystore password]
ANDROID_KEY_PASSWORD: [key alias password]

# Optional (for enhanced features):
CODECOV_TOKEN: [for code coverage reporting]
SLACK_WEBHOOK: [for deployment notifications]
```

### Environment Variables per Environment
```bash
# GitHub Repository → Settings → Environments

# Development Environment Variables:
DATABASE_URL: [dev database connection string]
JWT_SECRET: [development JWT secret]
API_URL: https://dev-api.vyeya.com

# QA Environment Variables:
DATABASE_URL: [qa database connection string]
JWT_SECRET: [qa JWT secret]
API_URL: https://qa-api.vyeya.com

# Production Environment Variables:
DATABASE_URL: [prod database connection string]
JWT_SECRET: [production JWT secret - strong!]
API_URL: https://api.vyeya.com
```

## 🔄 Deployment Workflows

### Development Deployment
```bash
# Every push to develop branch triggers:
1. Code quality checks (linting, testing)
2. Security scanning (dependencies, code)
3. Docker build and push to ECR
4. Deploy to ECS development cluster
5. Health checks and notifications

# Timeline: ~5-8 minutes
```

### QA Deployment  
```bash
# Every push to release/* branch triggers:
1. Full test suite (unit, integration, E2E)
2. Performance testing with k6
3. Mobile app builds (Android APK)
4. Security and vulnerability scanning
5. Deploy to ECS QA cluster
6. Automated QA test execution

# Timeline: ~15-20 minutes
```

### Production Deployment
```bash
# Every push to main branch triggers:
1. Complete validation suite
2. Blue/green deployment strategy
3. Database migration (if needed)
4. Health check validation
5. Automatic rollback on failure
6. Mobile app store artifacts
7. Performance monitoring activation

# Timeline: ~10-15 minutes with zero downtime
```

## 📊 Monitoring & Observability

### CloudWatch Dashboards
- **API Performance**: Response times, throughput, error rates
- **Infrastructure**: CPU, memory, network, disk usage  
- **Database**: Connections, query performance, locks
- **Mobile App**: Crash reports, user sessions, API calls

### Automated Alerts
```bash
# Production alerts trigger when:
- API response time > 2 seconds
- Error rate > 5%
- CPU utilization > 80%
- Memory utilization > 85%
- Database connections > 80% of limit
- Disk space < 20%

# Alert destinations:
- Email notifications
- Slack channels (if configured)
- AWS SNS topics
```

### Log Aggregation
```bash
# Centralized logging for:
- Application logs (structured JSON)
- Access logs (nginx/ALB format)
- Database logs (slow queries, errors)
- Container logs (Docker/ECS)

# Log retention:
- Development: 7 days
- QA: 30 days  
- Production: 90 days
```

## 🛠️ Local Development Setup

### Complete Local Environment
```bash
# 1. Clone and setup
git clone https://github.com/pardhuparimi/vyeya.git
cd vyeya
pnpm install

# 2. Start local database (Docker)
docker run --name postgres-local \
  -e POSTGRES_DB=vyeya_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 -d postgres:16

# 3. Setup environment
cp packages/server/.env.example packages/server/.env
# Edit .env with your local database settings

# 4. Run migrations and seed data
pnpm db:migrate
pnpm db:seed

# 5. Start development servers
pnpm dev  # Starts both API server and React Native metro

# 6. Start mobile app
cd packages/app
pnpm android  # For Android
pnpm ios      # For iOS
```

### Development Commands
```bash
# Server development
pnpm dev                    # Start API server
pnpm test                   # Run all tests
pnpm test:watch            # Watch mode testing
pnpm lint                  # Code linting
pnpm type-check           # TypeScript checking

# Mobile development  
pnpm android              # Run Android app
pnpm ios                  # Run iOS app
pnpm test:e2e            # E2E tests with Maestro

# Infrastructure
pnpm infra:plan:dev       # Plan dev infrastructure
pnpm infra:apply:dev      # Deploy dev infrastructure
pnpm env:check           # Check environment consistency

# Quality assurance
pnpm security:audit      # Security audit
pnpm load:test          # Performance testing
pnpm health:check       # API health check
```

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. Mobile App Build Failures
```bash
# Android issues:
cd packages/app/android
./gradlew clean
./gradlew assembleDebug

# iOS issues:
cd packages/app/ios
pod install
xcodebuild clean
```

#### 2. Database Connection Issues
```bash
# Check database status
pnpm health:check

# Reset database
docker restart postgres-local
pnpm db:migrate
```

#### 3. AWS Deployment Issues
```bash
# Check ECS service status
aws ecs describe-services --cluster vyeya-prod --services vyeya-api-prod

# View logs
aws logs tail /aws/ecs/vyeya-api-prod --follow

# Check health
curl https://api.vyeya.com/health
```

#### 4. CI/CD Pipeline Failures
```bash
# Common fixes:
- Check GitHub Secrets are properly set
- Verify AWS permissions
- Review CloudWatch logs
- Check ECR repository permissions
```

## 📈 Scaling & Performance

### Auto-Scaling Configuration
```yaml
# ECS Service Auto Scaling:
Min Capacity: 2 tasks
Max Capacity: 20 tasks
Target CPU: 70%
Target Memory: 80%
Scale Out Cooldown: 300s
Scale In Cooldown: 300s
```

### Database Scaling
```bash
# Development: db.t3.micro (2 vCPU, 1GB RAM)
# QA: db.t3.small (2 vCPU, 2GB RAM)  
# Production: db.r6g.large (2 vCPU, 16GB RAM)

# Production can scale to:
- Read replicas for read-heavy workloads
- Multi-AZ for high availability
- Automated backups with point-in-time recovery
```

### Performance Optimization
```bash
# Built-in optimizations:
- Docker multi-stage builds
- CDN for static assets (CloudFront)
- Database connection pooling
- Redis caching (optional)
- Image optimization for mobile
- Code splitting and lazy loading
```

## 🎯 Next Steps

### Immediate Actions (First Week)
1. ✅ **Environment Setup**: Run `./scripts/production-setup.sh`
2. ✅ **AWS Configuration**: Configure credentials and deploy dev environment
3. ✅ **GitHub Secrets**: Add required secrets for CI/CD
4. ✅ **Mobile Setup**: Configure Android/iOS signing
5. ✅ **Domain Setup**: Configure custom domains (optional)

### Short Term (First Month)
1. **SSL Certificates**: Set up ACM certificates for HTTPS
2. **Custom Domains**: Configure Route 53 for production domains
3. **Monitoring Setup**: Configure alerting email/Slack
4. **Backup Strategy**: Verify automated backup policies
5. **Team Access**: Set up IAM users for team members

### Long Term (First Quarter)
1. **Multi-Region**: Consider multi-region deployment
2. **CDN Setup**: CloudFront for global content delivery
3. **Advanced Monitoring**: APM and user analytics
4. **Compliance**: SOC2, GDPR considerations
5. **Disaster Recovery**: Cross-region backup strategy

## 🎉 Success Metrics

Your platform is ready for production when:
- ✅ All three environments (dev/qa/prod) are operational
- ✅ CI/CD pipeline passes all quality gates
- ✅ Mobile apps build and deploy successfully
- ✅ Monitoring and alerting are active
- ✅ Security scans pass without critical issues
- ✅ Load tests meet performance requirements
- ✅ Database backups and recovery tested

**You now have an enterprise-grade, scalable platform ready for real users! 🚀**
