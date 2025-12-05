import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { createOrder, getUserOrders, getOrderById } from '../controllers/order.controller';

const router = Router();

// POST /api/v1/orders - Create new order
router.post('/', authenticateToken, createOrder);

// GET /api/v1/orders - Get user's orders
router.get('/', authenticateToken, getUserOrders);

// GET /api/v1/orders/:id - Get order details
router.get('/:orderId', authenticateToken, getOrderById);

export { router as orderRoutes };
