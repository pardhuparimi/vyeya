import request from 'supertest';
import app from '../index';
import { OrderModel } from '../models/Order';

// Mock the models and services
jest.mock('../models/Order');

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { id: 'user123', name: 'Test User', email: 'test@example.com' };
    next();
  },
  AuthRequest: {}
}));

const mockOrderModel = OrderModel as jest.Mocked<typeof OrderModel>;

describe('Orders Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/orders', () => {
    const validOrderData = {
      items: [
        { productId: 'prod1', quantity: 2, price: 10.99 },
        { productId: 'prod2', quantity: 1, price: 5.50 }
      ],
      totalAmount: 27.48
    };

    const createdOrder = {
      id: 'order123',
      user_id: 'user123',
      total_amount: 27.48,
      status: 'pending' as const,
      created_at: new Date(),
      updated_at: new Date()
    };

    it('should create order successfully', async () => {
      mockOrderModel.create.mockResolvedValue(createdOrder);

      const res = await request(app)
        .post('/api/v1/orders')
        .send(validOrderData);

      expect(res.status).toBe(201);
      expect(res.body.order).toMatchObject({
        id: 'order123',
        user_id: 'user123',
        total_amount: 27.48,
        status: 'pending'
      });
      expect(res.body.order.created_at).toBeDefined();
      expect(res.body.order.updated_at).toBeDefined();
      expect(mockOrderModel.create).toHaveBeenCalledWith(
        'user123',
        validOrderData.items,
        validOrderData.totalAmount
      );
    });

    it('should return 400 if items array is missing', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .send({ totalAmount: 27.48 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Order items are required');
    });

    it('should return 400 if items array is empty', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .send({ items: [], totalAmount: 27.48 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Order items are required');
    });

    it('should return 400 if totalAmount is missing', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .send({ items: validOrderData.items });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Valid total amount is required');
    });

    it('should return 400 if totalAmount is zero or negative', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .send({ items: validOrderData.items, totalAmount: 0 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Valid total amount is required');
    });

    it('should handle order creation errors', async () => {
      mockOrderModel.create.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/v1/orders')
        .send(validOrderData);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to create order');
    });
  });

  describe('GET /api/v1/orders', () => {
    const userOrders = [
      {
        id: 'order1',
        user_id: 'user123',
        total_amount: 27.48,
        status: 'pending' as const,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'order2',
        user_id: 'user123',
        total_amount: 15.99,
        status: 'delivered' as const,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    it('should return user orders', async () => {
      mockOrderModel.findByUserId.mockResolvedValue(userOrders);

      const res = await request(app)
        .get('/api/v1/orders');

      expect(res.status).toBe(200);
      expect(res.body.orders).toHaveLength(2);
      expect(res.body.orders[0]).toMatchObject({
        id: 'order1',
        user_id: 'user123',
        total_amount: 27.48,
        status: 'pending'
      });
      expect(res.body.orders[1]).toMatchObject({
        id: 'order2',
        user_id: 'user123',
        total_amount: 15.99,
        status: 'delivered'
      });
      expect(mockOrderModel.findByUserId).toHaveBeenCalledWith('user123');
    });

    it('should handle database errors', async () => {
      mockOrderModel.findByUserId.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/orders');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to fetch orders');
    });
  });

  describe('GET /api/v1/orders/:orderId', () => {
    const orderDetails = {
      id: 'order123',
      user_id: 'user123',
      total_amount: 27.48,
      status: 'pending' as const,
      created_at: new Date(),
      updated_at: new Date()
    };

    const orderItems = [
      { 
        id: 'item1', 
        order_id: 'order123', 
        product_id: 'prod1', 
        quantity: 2, 
        price: 10.99 
      },
      { 
        id: 'item2', 
        order_id: 'order123', 
        product_id: 'prod2', 
        quantity: 1, 
        price: 5.50 
      }
    ];

    it('should return order details with items', async () => {
      mockOrderModel.findById.mockResolvedValue(orderDetails);
      mockOrderModel.getOrderItems.mockResolvedValue(orderItems);

      const res = await request(app)
        .get('/api/v1/orders/order123');

      expect(res.status).toBe(200);
      expect(res.body.order).toMatchObject({
        id: 'order123',
        user_id: 'user123',
        total_amount: 27.48,
        status: 'pending'
      });
      expect(res.body.order.items).toEqual(orderItems);
      expect(res.body.order.created_at).toBeDefined();
      expect(res.body.order.updated_at).toBeDefined();
      expect(mockOrderModel.findById).toHaveBeenCalledWith('order123');
      expect(mockOrderModel.getOrderItems).toHaveBeenCalledWith('order123');
    });

    it('should return 404 if order not found', async () => {
      mockOrderModel.findById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/orders/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Order not found');
    });

    it('should return 403 if order belongs to different user', async () => {
      const otherUserOrder = { ...orderDetails, user_id: 'other_user' };
      mockOrderModel.findById.mockResolvedValue(otherUserOrder);

      const res = await request(app)
        .get('/api/v1/orders/order123');

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Access denied');
    });

    it('should handle database errors', async () => {
      mockOrderModel.findById.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/orders/order123');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to fetch order');
    });
  });
});
