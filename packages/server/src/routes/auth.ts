import { Router } from 'express';
import { authenticateUser, generateToken, hashPassword, findUserByEmail, createUser } from '../services/authService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = await authenticateUser(email, password);
    
    if (user) {
      const token = generateToken(user.id);
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword, 
        token,
        expiresIn: '7d'
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name required' });
    }
    
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await hashPassword(password);
    
    const newUser = await createUser({
      email,
      password: hashedPassword,
      role: role || 'buyer',
      name
    });
    
    const token = generateToken(newUser.id);
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({ 
      user: userWithoutPassword, 
      token,
      expiresIn: '7d'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: (error as Error).message });
  }
});

// GET /api/v1/auth/me
router.get('/me', authenticateToken, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// POST /api/v1/auth/logout
router.post('/logout', authenticateToken, (req: AuthRequest, res) => {
  // In a real app, you might blacklist the token
  res.json({ message: 'Logged out successfully' });
});

export { router as authRoutes };