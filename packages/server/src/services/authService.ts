const jwt = require('jsonwebtoken');
import bcrypt from 'bcryptjs';
import pool from '../config/database';

const JWT_SECRET: string = process.env.JWT_SECRET || 'vyeya-dev-secret-key';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

export interface User {
  id: string;
  email: string;
  password: string;
  role: string;
  name: string;
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const { email, password, name, role } = userData;
  const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  const userId = String(Date.now());
  
  console.log('Creating user:', { userId, email, name, role: capitalizedRole });
  
  const result = await pool.query(
    'INSERT INTO users (id, email, password, name, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, email, password, name, capitalizedRole]
  );
  
  console.log('User created:', result.rows[0]);
  return result.rows[0];
};

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  const user = await findUserByEmail(email);
  if (!user) return null;
  
  const isValid = await comparePassword(password, user.password);
  return isValid ? user : null;
};