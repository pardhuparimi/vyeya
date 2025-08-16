import { Pool } from 'pg';

// Use test database configuration when in test environment
const isTest = process.env.NODE_ENV === 'test';

const pool = new Pool({
  user: isTest ? (process.env.POSTGRES_USER || 'test') : (process.env.DB_USER || 'postgres'),
  host: isTest ? (process.env.POSTGRES_HOST || 'localhost') : (process.env.DB_HOST || 'localhost'),
  database: isTest ? (process.env.POSTGRES_DB || 'vyeya_test') : (process.env.DB_NAME || 'vyeya'),
  password: isTest ? (process.env.POSTGRES_PASSWORD || 'test') : (process.env.DB_PASSWORD || 'password'),
  port: parseInt(isTest ? (process.env.POSTGRES_PORT || '5433') : (process.env.DB_PORT || '5432')),
});

export default pool;