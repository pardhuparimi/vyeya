import { Router } from 'express';
import { OrderModel } from '../models/Order';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/v1/orders - Create new order
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { items, totalAmount } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ error: 'Valid total amount is required' });
    }

    const order = await OrderModel.create(req.user?.id || '', items, totalAmount);
    res.status(201).json({ order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/v1/orders - Get user's orders
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const orders = await OrderModel.findByUserId(req.user?.id || '');
    res.json({ orders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/v1/orders/:orderId - Get order details
router.get('/:orderId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const order = await OrderModel.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.user_id !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const items = await OrderModel.getOrderItems(req.params.orderId);
    res.json({ order: { ...order, items } });
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export { router as orderRoutes };