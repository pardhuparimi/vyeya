import { Pool } from 'pg';

// Use test database configuration when in test environment
const isTest = process.env.NODE_ENV === 'test';
const isCI = process.env.CI === 'true';

// In CI Docker environment, use service names; locally use localhost
const getDbHost = () => {
  if (isTest) {
    return isCI ? 'postgres-test' : (process.env.POSTGRES_HOST || 'localhost');
  }
  return process.env.DB_HOST || 'localhost';
};

const getDbPort = () => {
  if (isTest) {
    return parseInt(isCI ? '5432' : (process.env.POSTGRES_PORT || '5433'));
  }
  return parseInt(process.env.DB_PORT || '5432');
};

const pool = new Pool({
  user: isTest ? (process.env.POSTGRES_USER || 'test') : (process.env.DB_USER || 'postgres'),
  host: getDbHost(),
  database: isTest ? (process.env.POSTGRES_DB || 'vyeya_test') : (process.env.DB_NAME || 'vyeya'),
  password: isTest ? (process.env.POSTGRES_PASSWORD || 'test') : (process.env.DB_PASSWORD || 'password'),
  port: getDbPort(),
});

export default pool;