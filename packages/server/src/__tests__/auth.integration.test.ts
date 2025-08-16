import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
async function makeRequest(method: string, url: string, body?: any, headers?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${url}`, options);
  const data = await response.json();
  
  return {
    status: response.status,
    ok: response.ok,
    data,
  };
}

describe('Authentication API Integration Tests', () => {
  let testUserToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Wait a moment for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('Health Check', () => {
    it('should return server status', async () => {
      const response = await makeRequest('GET', '/health');
      
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('OK');
      expect(response.data.database).toBe('connected');
    });
  });

  describe('Login', () => {
    it('should login with valid credentials', async () => {
      const response = await makeRequest('POST', '/api/v1/auth/login', {
        email: 'seller@vyeya.com',
        password: 'password'
      });

      expect(response.status).toBe(200);
      expect(response.data.token).toBeDefined();
      expect(response.data.user).toBeDefined();
      expect(response.data.user.email).toBe('seller@vyeya.com');
      expect(response.data.user.role).toBe('grower');
      
      // Store for later tests
      testUserToken = response.data.token;
      testUserId = response.data.user.id;
    });

    it('should fail with invalid credentials', async () => {
      const response = await makeRequest('POST', '/api/v1/auth/login', {
        email: 'seller@vyeya.com',
        password: 'wrongpassword'
      });

      expect(response.status).toBe(401);
      expect(response.data.error).toBe('Invalid credentials');
    });

    it('should fail with non-existent user', async () => {
      const response = await makeRequest('POST', '/api/v1/auth/login', {
        email: 'nonexistent@vyeya.com',
        password: 'password'
      });

      expect(response.status).toBe(401);
      expect(response.data.error).toBe('Invalid credentials');
    });
  });

  describe('Registration', () => {
    const uniqueEmail = `testuser${Date.now()}@example.com`;

    it('should register a new user', async () => {
      const response = await makeRequest('POST', '/api/v1/auth/register', {
        email: uniqueEmail,
        password: 'testpassword123',
        name: 'Test User',
        role: 'buyer'
      });

      expect(response.status).toBe(201);
      expect(response.data.token).toBeDefined();
      expect(response.data.user).toBeDefined();
      expect(response.data.user.email).toBe(uniqueEmail);
      expect(response.data.user.name).toBe('Test User');
      expect(response.data.user.role).toBe('buyer');
    });

    it('should fail when registering with existing email', async () => {
      const response = await makeRequest('POST', '/api/v1/auth/register', {
        email: 'seller@vyeya.com', // This user already exists
        password: 'testpassword123',
        name: 'Test User',
        role: 'buyer'
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toBe('User already exists');
    });
  });

  describe('Protected Routes', () => {
    it('should get user profile with valid token', async () => {
      const response = await makeRequest('GET', '/api/v1/auth/me', null, {
        'Authorization': `Bearer ${testUserToken}`
      });

      expect(response.status).toBe(200);
      expect(response.data.user).toBeDefined();
      expect(response.data.user.id).toBe(testUserId);
      expect(response.data.user.email).toBe('seller@vyeya.com');
    });

    it('should fail without token', async () => {
      const response = await makeRequest('GET', '/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.data.error).toBe('Access token required');
    });

    it('should fail with invalid token', async () => {
      const response = await makeRequest('GET', '/api/v1/auth/me', null, {
        'Authorization': 'Bearer invalid-token'
      });

      expect(response.status).toBe(403);
      expect(response.data.error).toBe('Invalid or expired token');
    });
  });
});
