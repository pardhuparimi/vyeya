import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import pool from '../config/database';

const router = Router();

// GET /api/v1/users/profile - Get current user profile (requires auth)
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, role, bio, phone, location FROM users WHERE id = $1', [req.user?.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      message: 'Unable to fetch user profile'
    });
  }
});

// GET /api/v1/users/:id - Get user by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, email, name, role, bio, phone, location FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      message: 'Unable to fetch user'
    });
  }
});

export { router as userRoutes };