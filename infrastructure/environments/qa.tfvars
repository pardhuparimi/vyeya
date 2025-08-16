# QA Environment Configuration
# Production-like setup for testing - most settings are auto-configured

environment = "qa"
aws_region  = "us-east-1"

# Optional: Alert configuration (add your email to receive CloudWatch alerts)
alert_email = ""  # Example: "qa-team@company.com"

# All other settings are automatically configured based on environment:
# - VPC CIDR: 10.1.0.0/16 (auto-assigned, isolated from dev/prod)
# - Database: db.t3.small (production-like for testing)
# - Auto-scaling: 2-5 tasks (moderate capacity)
# - Backup retention: 14 days
# - Deletion protection: disabled (for testing flexibility)
