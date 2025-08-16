#!/bin/bash

# Simplified AWS Setup Script for Vyeya Platform
# This script configures AWS with minimal user input required

set -e

echo "🚀 Vyeya AWS Quick Setup"
echo "========================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if AWS CLI is configured
print_step "Checking AWS configuration..."
if aws sts get-caller-identity &>/dev/null; then
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    REGION=$(aws configure get region || echo "us-east-1")
    print_success "AWS configured - Account: $ACCOUNT_ID, Region: $REGION"
else
    print_error "AWS CLI not configured. Please run 'aws configure' first"
    echo ""
    echo "Required information:"
    echo "- AWS Access Key ID (from IAM user)"
    echo "- AWS Secret Access Key (from IAM user)"
    echo "- Default region (recommend: us-east-1)"
    echo "- Default output format (recommend: json)"
    exit 1
fi

# Create S3 bucket for Terraform state (if it doesn't exist)
print_step "Setting up Terraform state bucket..."
BUCKET_NAME="vyeya-terraform-state-${ACCOUNT_ID}"
if aws s3 ls "s3://${BUCKET_NAME}" &>/dev/null; then
    print_success "S3 bucket already exists: $BUCKET_NAME"
else
    print_warning "Creating S3 bucket for Terraform state..."
    aws s3 mb "s3://${BUCKET_NAME}" --region $REGION
    
    # Enable versioning
    aws s3api put-bucket-versioning \
        --bucket "$BUCKET_NAME" \
        --versioning-configuration Status=Enabled
    
    # Enable encryption
    aws s3api put-bucket-encryption \
        --bucket "$BUCKET_NAME" \
        --server-side-encryption-configuration '{
            "Rules": [{
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }]
        }'
    
    print_success "Created and configured S3 bucket: $BUCKET_NAME"
fi

# Create DynamoDB table for Terraform locking (if it doesn't exist)
print_step "Setting up Terraform lock table..."
TABLE_NAME="vyeya-terraform-locks"
if aws dynamodb describe-table --table-name $TABLE_NAME &>/dev/null; then
    print_success "DynamoDB table already exists: $TABLE_NAME"
else
    print_warning "Creating DynamoDB table for Terraform locking..."
    aws dynamodb create-table \
        --table-name $TABLE_NAME \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region $REGION &>/dev/null
    
    print_success "Created DynamoDB table: $TABLE_NAME"
fi

# Update Terraform backend configuration
print_step "Configuring Terraform backend..."
cat > infrastructure/backend.tf << EOF
terraform {
  backend "s3" {
    bucket = "$BUCKET_NAME"
    key    = "infrastructure/terraform.tfstate"
    region = "$REGION"
    
    dynamodb_table = "$TABLE_NAME"
    encrypt        = true
  }
}
EOF

print_success "Updated Terraform backend configuration"

# Create ECR repositories if they don't exist
print_step "Setting up ECR repositories..."
REPO_NAME="vyeya-api"
if aws ecr describe-repositories --repository-names $REPO_NAME &>/dev/null; then
    print_success "ECR repository already exists: $REPO_NAME"
else
    print_warning "Creating ECR repository..."
    aws ecr create-repository \
        --repository-name $REPO_NAME \
        --image-scanning-configuration scanOnPush=true \
        --region $REGION &>/dev/null
    
    # Set lifecycle policy to manage old images
    aws ecr put-lifecycle-policy \
        --repository-name $REPO_NAME \
        --lifecycle-policy-text '{
            "rules": [{
                "rulePriority": 1,
                "description": "Keep last 10 images",
                "selection": {
                    "tagStatus": "any",
                    "countType": "imageCountMoreThan",
                    "countNumber": 10
                },
                "action": {
                    "type": "expire"
                }
            }]
        }' &>/dev/null
    
    print_success "Created ECR repository: $REPO_NAME"
fi

# Get ECR repository URI
ECR_URI=$(aws ecr describe-repositories --repository-names $REPO_NAME --query 'repositories[0].repositoryUri' --output text)

# Prompt for alert email (optional)
echo ""
print_step "CloudWatch alerts configuration (optional)..."
echo "Enter your email for CloudWatch alerts (press Enter to skip):"
read -p "Email: " ALERT_EMAIL

if [ -n "$ALERT_EMAIL" ]; then
    # Update environment files with alert email
    sed -i.bak "s/alert_email = \"\"/alert_email = \"$ALERT_EMAIL\"/" infrastructure/environments/dev.tfvars
    sed -i.bak "s/alert_email = \"\"/alert_email = \"$ALERT_EMAIL\"/" infrastructure/environments/qa.tfvars  
    sed -i.bak "s/alert_email = \"\"/alert_email = \"$ALERT_EMAIL\"/" infrastructure/environments/prod.tfvars
    rm -f infrastructure/environments/*.bak
    print_success "Updated alert email in environment configurations"
else
    print_warning "Skipping alert email configuration (you can add it later)"
fi

# Generate GitHub secrets template
print_step "Generating GitHub Secrets template..."
cat > github-secrets-setup.md << EOF
# GitHub Secrets Configuration

Add these secrets to your GitHub repository:
Settings → Secrets and Variables → Actions → New repository secret

## Required AWS Secrets:
\`AWS_ACCESS_KEY_ID\`: $AWS_ACCESS_KEY_ID
\`AWS_SECRET_ACCESS_KEY\`: [Your AWS Secret Access Key]

## Auto-configured values:
\`ECR_REGISTRY\`: $ECR_URI
\`AWS_REGION\`: $REGION
\`S3_BUCKET\`: $BUCKET_NAME

## Optional (for mobile app deployment):
\`ANDROID_KEYSTORE\`: [Base64 encoded Android keystore]
\`ANDROID_STORE_PASSWORD\`: [Android keystore password]
\`ANDROID_KEY_PASSWORD\`: [Android key password]
\`CODECOV_TOKEN\`: [Code coverage token]

## Environment Variables (per environment):
Add these as Environment Variables in GitHub:
Settings → Environments → [environment-name] → Environment variables

### Development Environment:
\`DATABASE_URL\`: [Auto-configured by Terraform]
\`JWT_SECRET\`: [Generate a secure random string]
\`API_URL\`: https://dev-api.vyeya.com

### QA Environment:
\`DATABASE_URL\`: [Auto-configured by Terraform]
\`JWT_SECRET\`: [Generate a secure random string]
\`API_URL\`: https://qa-api.vyeya.com

### Production Environment:
\`DATABASE_URL\`: [Auto-configured by Terraform]
\`JWT_SECRET\`: [Generate a STRONG secure random string]
\`API_URL\`: https://api.vyeya.com
EOF

print_success "Generated GitHub secrets template: github-secrets-setup.md"

# Initialize Terraform
print_step "Initializing Terraform..."
cd infrastructure
terraform init
print_success "Terraform initialized successfully"

echo ""
echo "🎉 AWS Setup Complete!"
echo "======================"
echo ""
echo "✅ S3 bucket created: $BUCKET_NAME"
echo "✅ DynamoDB table created: $TABLE_NAME"  
echo "✅ ECR repository created: $ECR_URI"
echo "✅ Terraform backend configured"
echo "✅ Terraform initialized"
echo ""
echo "📋 Next Steps:"
echo "1. Configure GitHub Secrets (see github-secrets-setup.md)"
echo "2. Deploy infrastructure: pnpm infra:apply:dev"
echo "3. Test deployment: pnpm health:check"
echo ""
echo "🚀 Quick commands:"
echo "   pnpm infra:plan:dev     # Preview dev infrastructure"
echo "   pnpm infra:apply:dev    # Deploy dev infrastructure"
echo "   pnpm infra:plan:prod    # Preview prod infrastructure"
echo "   pnpm infra:apply:prod   # Deploy prod infrastructure"
echo ""
print_success "AWS infrastructure ready for deployment! 🎯"
