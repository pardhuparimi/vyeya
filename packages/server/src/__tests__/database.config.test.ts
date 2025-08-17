import { Pool } from 'pg';

// Mock environment variables
const originalEnv = process.env;

describe('Database Configuration', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Test environment configuration', () => {
    it('should use CI postgres host when CI=true in test environment', async () => {
      process.env.NODE_ENV = 'test';
      process.env.CI = 'true';
      
      // Re-import to get fresh configuration
      const { default: pool } = await import('../config/database');
      
      // Verify the configuration includes CI host
      expect(pool.options.host).toBe('postgres-test');
      expect(pool.options.port).toBe(5432);
      
      await pool.end();
    });

    it('should use localhost when not in CI test environment', async () => {
      process.env.NODE_ENV = 'test';
      process.env.CI = 'false';
      delete process.env.POSTGRES_HOST;
      
      // Re-import to get fresh configuration
      const { default: pool } = await import('../config/database');
      
      // Verify the configuration uses localhost
      expect(pool.options.host).toBe('localhost');
      expect(pool.options.port).toBe(5433);
      
      await pool.end();
    });

    it('should use custom POSTGRES_HOST when provided in test environment', async () => {
      process.env.NODE_ENV = 'test';
      process.env.CI = 'false';
      process.env.POSTGRES_HOST = 'custom-host';
      process.env.POSTGRES_PORT = '5555';
      
      // Re-import to get fresh configuration
      const { default: pool } = await import('../config/database');
      
      expect(pool.options.host).toBe('custom-host');
      expect(pool.options.port).toBe(5555);
      
      await pool.end();
    });
  });

  describe('Production environment configuration', () => {
    it('should use production environment variables when not in test', async () => {
      process.env.NODE_ENV = 'production';
      process.env.DB_HOST = 'prod-host';
      process.env.DB_PORT = '5432';
      process.env.DB_USER = 'prod-user';
      process.env.DB_PASSWORD = 'prod-pass';
      process.env.DB_NAME = 'prod-db';
      
      // Re-import to get fresh configuration
      const { default: pool } = await import('../config/database');
      
      expect(pool.options.host).toBe('prod-host');
      expect(pool.options.port).toBe(5432);
      expect(pool.options.user).toBe('prod-user');
      expect(pool.options.password).toBe('prod-pass');
      expect(pool.options.database).toBe('prod-db');
      
      await pool.end();
    });

    it('should use default values when production env vars not set', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.DB_HOST;
      delete process.env.DB_PORT;
      delete process.env.DB_USER;
      delete process.env.DB_PASSWORD;
      delete process.env.DB_NAME;
      
      // Re-import to get fresh configuration
      const { default: pool } = await import('../config/database');
      
      expect(pool.options.host).toBe('localhost');
      expect(pool.options.port).toBe(5432);
      expect(pool.options.user).toBe('postgres');
      expect(pool.options.password).toBe('password');
      expect(pool.options.database).toBe('vyeya');
      
      await pool.end();
    });
  });
});
