import pool from '../config/database';

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

export class OrderModel {
  static async create(userId: string, items: { productId: string; quantity: number; price: number }[], totalAmount: number): Promise<Order> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const orderId = Date.now().toString();
      const orderResult = await client.query(
        `INSERT INTO orders (id, user_id, total_amount, status, created_at, updated_at) 
         VALUES ($1, $2, $3, 'pending', NOW(), NOW()) RETURNING *`,
        [orderId, userId, totalAmount]
      );

      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (id, order_id, product_id, quantity, price) 
           VALUES ($1, $2, $3, $4, $5)`,
          [Date.now().toString() + Math.random(), orderId, item.productId, item.quantity, item.price]
        );
      }

      await client.query('COMMIT');
      return orderResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByUserId(userId: string): Promise<Order[]> {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async findById(id: string): Promise<Order | null> {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const result = await pool.query(
      `SELECT oi.*, p.name as product_name 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
      [orderId]
    );
    return result.rows;
  }
}