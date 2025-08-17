// Mock the database pool FIRST
jest.mock('../config/database', () => ({
	query: jest.fn(),
	connect: jest.fn(),
}));

import pool from '../config/database';
import { OrderModel } from '../models/Order';

describe('OrderModel', () => {
	let mockQuery = pool.query as jest.Mock;
	let mockConnect = pool.connect as jest.Mock;
	let mockClient: any;

	beforeEach(() => {
		jest.clearAllMocks();
		mockClient = {
			query: jest.fn(),
			release: jest.fn(),
		};
		mockConnect.mockResolvedValue(mockClient);
	});

	describe('create', () => {
		const userId = 'user123';
		const items = [
			{ productId: 'product1', quantity: 2, price: 15.99 },
			{ productId: 'product2', quantity: 1, price: 17.99 }
		];
		const totalAmount = 49.97;
		const fakeOrder = {
			id: 'order123',
			user_id: userId,
			total_amount: totalAmount,
			status: 'pending',
			created_at: new Date(),
			updated_at: new Date()
		};

		it('should create order with items successfully', async () => {
			mockClient.query
				.mockResolvedValueOnce({ rows: [] }) // BEGIN
				.mockResolvedValueOnce({ rows: [fakeOrder] }) // INSERT order
				.mockResolvedValueOnce({ rows: [] }) // INSERT item 1
				.mockResolvedValueOnce({ rows: [] }) // INSERT item 2
				.mockResolvedValueOnce({ rows: [] }); // COMMIT

			const result = await OrderModel.create(userId, items, totalAmount);
			expect(result).toEqual(fakeOrder);
			expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
			expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO orders'), expect.any(Array));
			expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO order_items'), expect.any(Array));
			expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
			expect(mockClient.release).toHaveBeenCalled();
		});

		it('should rollback transaction and throw on error', async () => {
			mockClient.query
				.mockResolvedValueOnce({ rows: [] }) // BEGIN
				.mockRejectedValueOnce(new Error('fail')); // INSERT order fails

			await expect(OrderModel.create(userId, items, totalAmount)).rejects.toThrow('fail');
			expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
			expect(mockClient.release).toHaveBeenCalled();
		});

		it('should handle empty items array', async () => {
			mockClient.query
				.mockResolvedValueOnce({ rows: [] }) // BEGIN
				.mockResolvedValueOnce({ rows: [fakeOrder] }) // INSERT order
				.mockResolvedValueOnce({ rows: [] }); // COMMIT

			const result = await OrderModel.create(userId, [], totalAmount);
			expect(result).toEqual(fakeOrder);
			expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
			expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO orders'), expect.any(Array));
			expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
			expect(mockClient.release).toHaveBeenCalled();
		});

		it('should always release client even if rollback fails', async () => {
			mockClient.query
				.mockResolvedValueOnce({ rows: [] }) // BEGIN
				.mockRejectedValueOnce(new Error('fail')) // INSERT order fails
				.mockRejectedValueOnce(new Error('rollback fail')); // ROLLBACK fails

			await expect(OrderModel.create(userId, items, totalAmount)).rejects.toThrow('fail');
			expect(mockClient.release).toHaveBeenCalled();
		});
	});

	describe('findByUserId', () => {
		const userId = 'user123';
		const mockOrders = [
			{
				id: 'order1',
				user_id: userId,
				total_amount: 29.99,
				status: 'confirmed',
				created_at: new Date('2024-01-15'),
				updated_at: new Date('2024-01-15')
			}
		];

		it('should return orders for user', async () => {
			mockQuery.mockResolvedValue({ rows: mockOrders });
			const result = await OrderModel.findByUserId(userId);
			expect(result).toEqual(mockOrders);
			expect(mockQuery).toHaveBeenCalledWith(
				'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
				[userId]
			);
		});

		it('should return empty array when user has no orders', async () => {
			mockQuery.mockResolvedValue({ rows: [] });
			const result = await OrderModel.findByUserId(userId);
			expect(result).toEqual([]);
		});
	});

	describe('findById', () => {
		const orderId = 'order123';
		const mockOrder = {
			id: orderId,
			user_id: 'user123',
			total_amount: 29.99,
			status: 'confirmed',
			created_at: new Date('2024-01-15'),
			updated_at: new Date('2024-01-15')
		};

		it('should return order when found', async () => {
			mockQuery.mockResolvedValue({ rows: [mockOrder] });
			const result = await OrderModel.findById(orderId);
			expect(result).toEqual(mockOrder);
		});

		it('should return null when order not found', async () => {
			mockQuery.mockResolvedValue({ rows: [] });
			const result = await OrderModel.findById(orderId);
			expect(result).toBeNull();
		});
	});

	describe('getOrderItems', () => {
		const orderId = 'order123';
		const mockOrderItems = [
			{
				id: 'item1',
				order_id: orderId,
				product_id: 'product1',
				quantity: 2,
				price: 15.99,
				product_name: 'Test Product 1'
			}
		];

		it('should return order items with product names', async () => {
			mockQuery.mockResolvedValue({ rows: mockOrderItems });
			const result = await OrderModel.getOrderItems(orderId);
			expect(result).toEqual(mockOrderItems);
		});

		it('should return empty array when order has no items', async () => {
			mockQuery.mockResolvedValue({ rows: [] });
			const result = await OrderModel.getOrderItems(orderId);
			expect(result).toEqual([]);
		});
	});
});

describe('OrderModel smoke test', () => {
	it('should run a basic test', () => {
		expect(1 + 1).toBe(2);
	});
});
