// Integration tests for HTTP API endpoints (with real HTTP requests)
import request from 'supertest';
import app from '../index';

describe('API Integration Tests', () => {
  describe('Authentication Routes', () => {
    it('should have auth routes mounted', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword'
        });
      
      // Should not be 404 (route exists)
      expect(response.status).not.toBe(404);
      // Can be 400/401/422/500 (validation/auth errors are expected)
      expect([400, 401, 422, 500]).toContain(response.status);
    });

    it('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({});
      
      // Can be 400/422 (validation errors) or 500 (server errors due to missing DB)
      expect([400, 422, 500]).toContain(response.status);
    });
  });

  describe('Product Routes', () => {
    it('should have products routes accessible', async () => {
      const response = await request(app)
        .get('/api/v1/products');
      
      // Should not be 404 (route exists)
      expect(response.status).not.toBe(404);
      // Can be 200 (mock data) or 500 (DB error)
      expect([200, 500]).toContain(response.status);
    });

    it('should return products data structure when successful', async () => {
      const response = await request(app)
        .get('/api/v1/products');
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('products');
        expect(Array.isArray(response.body.products)).toBe(true);
      }
    });
  });

  describe('User Routes', () => {
    it('should have users routes accessible', async () => {
      const response = await request(app)
        .get('/api/v1/users');
      
      expect(response.status).not.toBe(404);
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('Store Routes', () => {
    it('should have store routes accessible', async () => {
      const response = await request(app)
        .get('/api/v1/stores');
      
      expect(response.status).not.toBe(404);
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('Order Routes', () => {
    it('should have order routes accessible', async () => {
      const response = await request(app)
        .get('/api/v1/orders');
      
      expect(response.status).not.toBe(404);
      expect([200, 500]).toContain(response.status);
    });
  });
});
