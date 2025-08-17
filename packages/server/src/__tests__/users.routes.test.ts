// Mock the database and auth
jest.mock('../config/database');
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req: Record<string, unknown>, _res: unknown, next: unknown) => {
    if (typeof req === 'object' && req !== null) {
      (req as { user?: { id: string; name: string; email: string } }).user = { id: 'user123', name: 'Test User', email: 'test@example.com' };
    }
    if (typeof next === 'function') next();
  },
  AuthRequest: {}
}));

import request from 'supertest';
import app from '../index';
import pool from '../config/database';

const poolQuery = pool.query as jest.Mock;

describe('Users Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/users/profile', () => {
    const userProfile = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      bio: 'Test bio',
      phone: '+1234567890',
      location: 'Test City'
    };

    it('should return current user profile', async () => {
      poolQuery.mockResolvedValue({
        rows: [userProfile]
      });

      const res = await request(app)
        .get('/api/v1/users/profile');

      expect(res.status).toBe(200);
      expect(res.body.user).toEqual(userProfile);
      expect(poolQuery).toHaveBeenCalledWith(
        'SELECT id, email, name, role, bio, phone, location FROM users WHERE id = $1',
        ['user123']
      );
    });

    it('should return 404 if user not found', async () => {
      poolQuery.mockResolvedValue({
        rows: []
      });

      const res = await request(app)
        .get('/api/v1/users/profile');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('should handle database errors', async () => {
      poolQuery.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/users/profile');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Database connection failed');
      expect(res.body.message).toBe('Unable to fetch user profile');
    });
  });

  describe('GET /api/v1/users/:id', () => {
    const publicUserProfile = {
      id: 'user456',
      email: 'public@example.com',
      name: 'Public User',
      role: 'user',
      bio: 'Public bio',
      phone: '+0987654321',
      location: 'Public City'
    };

    it('should return user by ID', async () => {
      poolQuery.mockResolvedValue({
        rows: [publicUserProfile]
      });

      const res = await request(app)
        .get('/api/v1/users/user456');

      expect(res.status).toBe(200);
      expect(res.body.user).toEqual(publicUserProfile);
      expect(poolQuery).toHaveBeenCalledWith(
        'SELECT id, email, name, role, bio, phone, location FROM users WHERE id = $1',
        ['user456']
      );
    });

    it('should return 404 if user not found', async () => {
      poolQuery.mockResolvedValue({
        rows: []
      });

      const res = await request(app)
        .get('/api/v1/users/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('should handle database errors', async () => {
      poolQuery.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/users/user456');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Database connection failed');
      expect(res.body.message).toBe('Unable to fetch user');
    });
  });
});
