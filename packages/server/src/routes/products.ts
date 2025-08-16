import { Router } from 'express';
import { ProductModel } from '../models/Product';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/v1/products
router.get('/', async (req, res) => {
  try {
    const products = await ProductModel.findAll();
    res.json({
      products,
      total: products.length
    });
  } catch (error) {
    // Log database connection errors in development only
    if (process.env.NODE_ENV !== 'test') {
      console.error('Database error:', error);
    }
    res.status(500).json({ 
      error: 'Database connection failed',
      message: 'Unable to fetch products from database'
    });
  }
});

// GET /api/v1/products/search
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const products = await ProductModel.search(q as string);
    res.json({ products });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/v1/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ product });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/products/my
router.get('/my', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const products = await ProductModel.findByUserId(req.user?.id || '');
    res.json(products);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch your products' });
  }
});

// POST /api/v1/products
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, price, stock, store_id, location, category_id } = req.body;
    
    if (!name || !price || !stock || !store_id || !category_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const product = await ProductModel.create({
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      store_id,
      location: location || { lat: 40.7128, lng: -74.0060 },
      category_id
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

export { router as productRoutes };