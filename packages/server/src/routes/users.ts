import { Router } from 'express';

const router = Router();

// Mock users data
const mockUsers = [
  {
    id: '1',
    email: 'farmer@example.com',
    phone: '+1234567890',
    role: 'Seller',
    address: { street: '123 Farm St', city: 'Brooklyn', state: 'NY' },
    created_at: new Date()
  }
];

// GET /api/v1/users/profile
router.get('/profile', (req, res) => {
  // TODO: Get user from JWT token
  const user = mockUsers[0];
  res.json(user);
});

// POST /api/v1/users/register
router.post('/register', (req, res) => {
  const { email, phone, role, address } = req.body;
  
  const newUser = {
    id: Date.now().toString(),
    email,
    phone,
    role,
    address,
    created_at: new Date()
  };
  
  mockUsers.push(newUser);
  res.status(201).json(newUser);
});

export { router as userRoutes };