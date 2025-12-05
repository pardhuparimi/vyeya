import { Request, Response, NextFunction } from 'express';
import {
  authenticateUser,
  generateToken,
  createUser,
  hashPassword,
  findUserByEmail
} from '../services/authService';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken(user.id);

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        bio: user.bio,
        phone: user.phone,
        location: user.location
      }
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, role = 'buyer' } = req.body;

    if (!email || !password || !name) {
      throw new AppError('Email, password and name are required', 400);
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    const hashedPassword = await hashPassword(password);

    const user = await createUser({
      email,
      password: hashedPassword,
      name,
      role
    });

    const token = generateToken(user.id);

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        bio: user.bio,
        phone: user.phone,
        location: user.location
      }
    }, 201);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user?.id]);
    const user = result.rows[0];

    if (!user) {
      throw new AppError('User not found', 404);
    }

    sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        bio: user.bio,
        phone: user.phone,
        location: user.location
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, bio, phone, location } = req.body;

    if (!name || !name.trim()) {
      throw new AppError('Name is required', 400);
    }

    const result = await pool.query(
      'UPDATE users SET name = $1, bio = $2, phone = $3, location = $4 WHERE id = $5 RETURNING *',
      [name.trim(), bio, phone, location, req.user?.id]
    );

    const user = result.rows[0];

    if (!user) {
      throw new AppError('User not found', 404);
    }

    sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        bio: user.bio,
        phone: user.phone,
        location: user.location
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getGrowerProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      'SELECT id, name, bio, phone, location, role FROM users WHERE id = $1 AND role = $2',
      [req.params.id, 'grower']
    );

    const grower = result.rows[0];

    if (!grower) {
      throw new AppError('Grower not found', 404);
    }

    sendSuccess(res, { grower });
  } catch (error) {
    next(error);
  }
};
