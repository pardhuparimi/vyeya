import { Router } from 'express';
import { ProductModel } from '../models/Product';

const router = Router();

// Fallback mock data
const mockProducts = [
  {
    id: '1',
    store_id: '1',
    name: 'Fresh Mangoes',
    price: 5.99,
    stock: 50,
    location: { lat: 40.7128, lng: -74.0060 },
    category_id: '1'
  },
  {
    id: '2',
    store_id: '1',
    name: 'Organic Tomatoes',
    price: 3.49,
    stock: 25,
    location: { lat: 40.7128, lng: -74.0060 },
    category_id: '1'
  }
];

// GET /api/v1/products
router.get('/', async (req, res) => {
  try {
    const products = await ProductModel.findAll();
    res.json({
      products,
      total: products.length
    });
  } catch (error) {
    console.error('Database error:', error);
    // Fallback to mock data if database fails
    res.json({
      products: mockProducts,
      total: mockProducts.length
    });
  }
});

// GET /api/v1/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/products
router.post('/', async (req, res) => {
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