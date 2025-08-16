# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "vyeya_api" {
  name              = "/aws/ecs/vyeya-api-${var.environment}"
  retention_in_days = var.environment == "prod" ? 90 : 30

  tags = {
    Environment = var.environment
    Application = "vyeya"
  }
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "vyeya_dashboard" {
  dashboard_name = "vyeya-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", "vyeya-api-${var.environment}", "ClusterName", "vyeya-${var.environment}"],
            [".", "MemoryUtilization", ".", ".", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "ECS Service Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.main.arn_suffix],
            [".", "TargetResponseTime", ".", "."],
            [".", "HTTPCode_Target_2XX_Count", ".", "."],
            [".", "HTTPCode_Target_4XX_Count", ".", "."],
            [".", "HTTPCode_Target_5XX_Count", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Application Load Balancer Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", aws_db_instance.main.id],
            [".", "DatabaseConnections", ".", "."],
            [".", "ReadLatency", ".", "."],
            [".", "WriteLatency", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "RDS Metrics"
          period  = 300
        }
      }
    ]
  })
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "vyeya-${var.environment}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ECS CPU utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ServiceName = "vyeya-api-${var.environment}"
    ClusterName = "vyeya-${var.environment}"
  }

  tags = {
    Environment = var.environment
    Application = "vyeya"
  }
}

resource "aws_cloudwatch_metric_alarm" "high_memory" {
  alarm_name          = "vyeya-${var.environment}-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ECS memory utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ServiceName = "vyeya-api-${var.environment}"
    ClusterName = "vyeya-${var.environment}"
  }

  tags = {
    Environment = var.environment
    Application = "vyeya"
  }
}

resource "aws_cloudwatch_metric_alarm" "elb_response_time" {
  alarm_name          = "vyeya-${var.environment}-high-response-time"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Average"
  threshold           = "2"
  alarm_description   = "This metric monitors ELB response time"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }

  tags = {
    Environment = var.environment
    Application = "vyeya"
  }
}

resource "aws_cloudwatch_metric_alarm" "elb_5xx_errors" {
  alarm_name          = "vyeya-${var.environment}-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "This metric monitors 5XX errors"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }

  tags = {
    Environment = var.environment
    Application = "vyeya"
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "vyeya-${var.environment}-rds-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors RDS CPU utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }

  tags = {
    Environment = var.environment
    Application = "vyeya"
  }
}

# SNS Topic for alerts
resource "aws_sns_topic" "alerts" {
  name = "vyeya-${var.environment}-alerts"

  tags = {
    Environment = var.environment
    Application = "vyeya"
  }
}

# SNS Topic Subscription (you'll need to confirm this manually)
resource "aws_sns_topic_subscription" "email_alerts" {
  count     = var.alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# Application Insights
resource "aws_applicationinsights_application" "vyeya" {
  resource_group_name = aws_resourcegroups_group.vyeya.name
  auto_config_enabled = true

  tags = {
    Environment = var.environment
    Application = "vyeya"
  }
}

# Resource Group for Application Insights
resource "aws_resourcegroups_group" "vyeya" {
  name = "vyeya-${var.environment}-resources"

  resource_query {
    query = jsonencode({
      ResourceTypeFilters = ["AWS::AllSupported"]
      TagFilters = [
        {
          Key    = "Environment"
          Values = [var.environment]
        },
        {
          Key    = "Application"
          Values = ["vyeya"]
        }
      ]
    })
  }

  tags = {
    Environment = var.environment
    Application = "vyeya"
  }
}
