import { makeRequest } from './test-helpers';

describe('API Integration Tests', () => {
  describe('Health Endpoints', () => {
    it('should return server health status', async () => {
      const response = await makeRequest('GET', '/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });

    it('should return deep health check', async () => {
      const response = await makeRequest('GET', '/health/deep');
      
      // Can be 200 (healthy) or 503 (degraded due to database issues)
      expect([200, 503]).toContain(response.status);
      expect(response.body.status).toMatch(/healthy|degraded|unhealthy/);
      expect(response.body.checks).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('API Routes', () => {
    it('should have auth routes available', async () => {
      // Test that auth routes exist (even if they return errors due to missing data)
      const response = await makeRequest('POST', '/api/v1/auth/login', {
        email: 'test@test.com',
        password: 'test'
      });
      
      // Should not be 404 (route exists), but can be 400/401/422
      expect(response.status).not.toBe(404);
      expect([400, 401, 422, 500]).toContain(response.status);
    });

    it('should have products routes available', async () => {
      const response = await makeRequest('GET', '/api/v1/products');
      
      // Should not be 404 (route exists)
      expect(response.status).not.toBe(404);
      expect([200, 401, 500]).toContain(response.status);
    });

    it('should have users routes available', async () => {
      const response = await makeRequest('GET', '/api/v1/users/profile');
      
      // Should not be 404 (route exists)
      expect(response.status).not.toBe(404);
      expect([200, 401, 500]).toContain(response.status);
    });
  });
});
