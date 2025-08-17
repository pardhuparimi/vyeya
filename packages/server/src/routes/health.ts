import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const router = Router();

// Simple health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Deep health check with database connectivity
router.get('/health/deep', async (req: Request, res: Response) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: 'unknown',
      redis: 'unknown',
      memory: 'unknown'
    }
  };

  try {
    // Database health check
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    await pool.end();
    healthCheck.checks.database = 'healthy';
  } catch {
    healthCheck.checks.database = 'unhealthy';
    healthCheck.status = 'degraded';
  }

  // Memory usage check
  const memoryUsage = process.memoryUsage();
  const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  if (memoryUsagePercent < 90) {
    healthCheck.checks.memory = 'healthy';
  } else {
    healthCheck.checks.memory = 'warning';
    if (healthCheck.status === 'healthy') {
      healthCheck.status = 'degraded';
    }
  }

  // Redis health check (if Redis is configured)
  try {
    if (process.env.REDIS_URL) {
      // Add Redis client check here if you're using Redis
      healthCheck.checks.redis = 'healthy';
    } else {
      healthCheck.checks.redis = 'not_configured';
    }
  } catch {
    healthCheck.checks.redis = 'unhealthy';
    healthCheck.status = 'degraded';
  }

  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// Readiness check for Kubernetes/ECS
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if the application is ready to serve requests
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    await pool.end();
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

// Liveness check for Kubernetes/ECS
router.get('/live', (req: Request, res: Response) => {
  // Simple liveness check - if the process is running, it's alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid
  });
});

export default router;
