# Production Environment Configuration  
# High-availability setup - most settings are auto-configured

environment = "prod"
aws_region  = "us-east-1"

# IMPORTANT: Alert configuration (strongly recommended for production)
alert_email = ""  # Example: "prod-alerts@company.com" - REPLACE WITH YOUR EMAIL

# All other settings are automatically configured based on environment:
# - VPC CIDR: 10.2.0.0/16 (auto-assigned, isolated from dev/qa)  
# - Database: db.r6g.large (high-performance for production)
# - Auto-scaling: 3-20 tasks (scales with traffic)
# - Backup retention: 30 days
# - Deletion protection: enabled (prevents accidental deletion)
# - Multi-AZ deployment: enabled (high availability)
# - Enhanced monitoring: enabled
