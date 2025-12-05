import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  login,
  register,
  getMe,
  updateProfile,
  getGrowerProfile
} from '../controllers/auth.controller';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.get('/grower/:id', getGrowerProfile);

export { router as authRoutes };
export default router;
