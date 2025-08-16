# Development Environment Configuration
# Minimal configuration required - most settings are auto-configured

environment = "dev"
aws_region  = "us-east-1"

# Optional: Alert configuration (add your email to receive CloudWatch alerts)
alert_email = ""  # Example: "dev-team@company.com"

# All other settings are automatically configured based on environment:
# - VPC CIDR: 10.0.0.0/16 (auto-assigned)
# - Database: db.t3.micro (cost-optimized for dev)
# - Auto-scaling: 1-3 tasks (minimal for dev)
# - Backup retention: 7 days
# - Deletion protection: disabled (for easy cleanup)
tags = {
  Environment = "dev"
  Owner       = "development-team"
  CostCenter  = "engineering"
}
