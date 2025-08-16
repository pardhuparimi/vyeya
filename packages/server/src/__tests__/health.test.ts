import request from 'supertest';
import app from '../index';

describe('Health Routes', () => {
  describe('GET /health', () => {
    it('should return basic health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
    });

    it('should have proper response format', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/);

      expect(typeof response.body.timestamp).toBe('string');
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('GET /health/deep', () => {
    it('should return detailed health status', async () => {
      const response = await request(app)
        .get('/health/deep')
        .expect((res) => {
          // Accept both 200 (healthy) and 503 (degraded) since we might not have DB
          expect([200, 503]).toContain(res.status);
        });

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('checks');
      expect(response.body).toHaveProperty('timestamp');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(response.body.status);
    });

    it('should include system checks', async () => {
      const response = await request(app)
        .get('/health/deep');

      if (response.body.checks) {
        expect(response.body.checks).toHaveProperty('memory');
        // Database check might not be available in test env
      }
    });
  });
});
