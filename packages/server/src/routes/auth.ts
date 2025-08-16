import express from 'express';
// Note: bcrypt and jwt imports removed - functionality provided by authService
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { 
  generateToken, 
  authenticateUser, 
  findUserByEmail, 
  createUser, 
  hashPassword 
} from '../services/authService';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await authenticateUser(email, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id);
    
    res.json({
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
  } catch (_error) {
    // Log auth errors in development only
    if (process.env.NODE_ENV !== 'test') {
      console.error('Login error:', _error);
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'buyer' } = req.body;
    
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await hashPassword(password);
    
    const user = await createUser({
      email,
      password: hashedPassword,
      name,
      role
    });
    
    const token = generateToken(user.id);
    
    res.status(201).json({
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
  } catch (_error) {
    // Log registration errors in development only
    if (process.env.NODE_ENV !== 'test') {
      console.error('Registration error:', _error);
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user?.id]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
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
  } catch (_error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, bio, phone, location } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const result = await pool.query(
      'UPDATE users SET name = $1, bio = $2, phone = $3, location = $4 WHERE id = $5 RETURNING *',
      [name.trim(), bio, phone, location, req.user?.id]
    );
    
    const user = result.rows[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
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
  } catch (_error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/v1/auth/grower/:id - Get grower profile
router.get('/grower/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, bio, phone, location, role FROM users WHERE id = $1 AND role = $2',
      [req.params.id, 'grower']
    );
    
    const grower = result.rows[0];
    
    if (!grower) {
      return res.status(404).json({ error: 'Grower not found' });
    }
    
    res.json({ grower });
  } catch (_error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export { router as authRoutes };
export default router;