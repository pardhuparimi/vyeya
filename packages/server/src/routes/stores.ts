import { Router } from 'express';

const router = Router();

// Mock stores data
const mockStores = [
  {
    id: '1',
    user_id: '1',
    name: 'Local Farm Market',
    type: 'Casual',
    location: { lat: 40.7128, lng: -74.0060 },
    hours: { open: '8:00', close: '18:00' },
    verified: true
  }
];

// GET /api/v1/stores
router.get('/', (req, res) => {
  res.json({
    stores: mockStores,
    total: mockStores.length
  });
});

// GET /api/v1/stores/:id
router.get('/:id', (req, res) => {
  const store = mockStores.find(s => s.id === req.params.id);
  
  if (!store) {
    return res.status(404).json({ error: 'Store not found' });
  }
  
  res.json(store);
});

// POST /api/v1/stores
router.post('/', (req, res) => {
  const { user_id, name, type, location, hours } = req.body;
  
  const newStore = {
    id: Date.now().toString(),
    user_id,
    name,
    type,
    location,
    hours,
    verified: false
  };
  
  mockStores.push(newStore);
  res.status(201).json(newStore);
});

export { router as storeRoutes };