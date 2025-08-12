import pool from '../config/database';

export interface Product {
  id: string;
  store_id: string;
  name: string;
  price: number;
  stock: number;
  location: { lat: number; lng: number };
  category_id: string;
  created_at?: Date;
}

export class ProductModel {
  static async findAll(): Promise<Product[]> {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    return result.rows;
  }

  static async findById(id: string): Promise<Product | null> {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const id = Date.now().toString();
    const result = await pool.query(
      `INSERT INTO products (id, store_id, name, price, stock, location, category_id, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
      [id, product.store_id, product.name, product.price, product.stock, JSON.stringify(product.location), product.category_id]
    );
    return result.rows[0];
  }

  static async update(id: string, product: Partial<Product>): Promise<Product | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(product).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(key === 'location' ? JSON.stringify(value) : value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const result = await pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }
}