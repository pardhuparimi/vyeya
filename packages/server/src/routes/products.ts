import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllProducts,
  searchProducts,
  getProductById,
  getMyProducts,
  createProduct
} from '../controllers/product.controller';

const router = Router();

// GET /api/v1/products
router.get('/', getAllProducts);

// GET /api/v1/products/search
router.get('/search', searchProducts);

// GET /api/v1/products/my
router.get('/my', authenticateToken, getMyProducts);

// GET /api/v1/products/:id
router.get('/:id', getProductById);

// POST /api/v1/products
router.post('/', authenticateToken, createProduct);

export { router as productRoutes };
