// Mock the database
jest.mock('../config/database');

import { ProductModel } from '../models/Product';
import pool from '../config/database';

const poolQuery = pool.query as jest.Mock;

describe('ProductModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Test Product',
        price: 10.99,
        stock: 50,
        category: 'vegetables',
        store_id: 'store1',
        created_at: new Date()
      }
    ];

    it('should return all products', async () => {
      poolQuery.mockResolvedValue({ rows: mockProducts });

      const result = await ProductModel.findAll();

      expect(poolQuery).toHaveBeenCalledWith(
        'SELECT id, name, price, stock, category_id as category, store_id, created_at FROM products ORDER BY created_at DESC'
      );
      expect(result).toEqual(mockProducts);
    });

    it('should handle database errors', async () => {
      poolQuery.mockRejectedValue(new Error('Database error'));

      await expect(ProductModel.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 10.99,
      stock: 50,
      category: 'vegetables',
      store_id: 'store1',
      created_at: new Date()
    };

    it('should return product by id', async () => {
      poolQuery.mockResolvedValue({ rows: [mockProduct] });

      const result = await ProductModel.findById('1');

      expect(poolQuery).toHaveBeenCalledWith(
        'SELECT id, name, price, stock, category_id as category, store_id, created_at FROM products WHERE id = $1',
        ['1']
      );
      expect(result).toEqual(mockProduct);
    });

    it('should return null if product not found', async () => {
      poolQuery.mockResolvedValue({ rows: [] });

      const result = await ProductModel.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    const mockProducts = [
      {
        id: '1',
        name: 'User Product',
        price: 15.99,
        stock: 30,
        store_id: 'store1',
        created_at: new Date()
      }
    ];

    it('should return products for user', async () => {
      poolQuery.mockResolvedValue({ rows: mockProducts });

      const result = await ProductModel.findByUserId('user123');

      expect(poolQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT p.* FROM products p'),
        ['user123']
      );
      expect(result).toEqual(mockProducts);
    });
  });

  describe('create', () => {
    const newProduct = {
      store_id: 'store1',
      name: 'New Product',
      price: 12.99,
      stock: 25,
      location: { lat: 40.7128, lng: -74.0060 },
      category_id: 'vegetables'
    };

    const createdProduct = {
      id: expect.any(String),
      ...newProduct,
      created_at: expect.any(Date)
    };

    it('should create a new product', async () => {
      poolQuery.mockResolvedValue({ rows: [createdProduct] });

      const result = await ProductModel.create(newProduct);

      expect(poolQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO products'),
        expect.arrayContaining([
          expect.any(String),
          newProduct.store_id,
          newProduct.name,
          newProduct.price,
          newProduct.stock,
          JSON.stringify(newProduct.location),
          newProduct.category_id
        ])
      );
      expect(result).toEqual(createdProduct);
    });
  });

  describe('update', () => {
    const updateData = { name: 'Updated Product', price: 15.99 };
    const updatedProduct = { id: '1', ...updateData };

    it('should update product with provided fields', async () => {
      poolQuery.mockResolvedValue({ rows: [updatedProduct] });

      const result = await ProductModel.update('1', updateData);

      expect(poolQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE products SET'),
        expect.arrayContaining(['Updated Product', 15.99, '1'])
      );
      expect(result).toEqual(updatedProduct);
    });

    it('should return null if no fields to update', async () => {
      const result = await ProductModel.update('1', {});
      expect(result).toBeNull();
    });

    it('should handle location updates with JSON stringify', async () => {
      const locationUpdate = { location: { lat: 41.8781, lng: -87.6298 } };
      poolQuery.mockResolvedValue({ rows: [{ id: '1', ...locationUpdate }] });

      const result = await ProductModel.update('1', locationUpdate);

      expect(poolQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE products SET'),
        expect.arrayContaining([JSON.stringify(locationUpdate.location), '1'])
      );
    });

    it('should return null if product not found', async () => {
      poolQuery.mockResolvedValue({ rows: [] });

      const result = await ProductModel.update('nonexistent', updateData);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should return true if product deleted successfully', async () => {
      poolQuery.mockResolvedValue({ rowCount: 1 });

      const result = await ProductModel.delete('1');

      expect(poolQuery).toHaveBeenCalledWith(
        'DELETE FROM products WHERE id = $1',
        ['1']
      );
      expect(result).toBe(true);
    });

    it('should return false if no product found to delete', async () => {
      poolQuery.mockResolvedValue({ rowCount: 0 });

      const result = await ProductModel.delete('nonexistent');

      expect(result).toBe(false);
    });

    it('should handle undefined rowCount', async () => {
      poolQuery.mockResolvedValue({ rowCount: undefined });

      const result = await ProductModel.delete('1');

      expect(result).toBe(false);
    });
  });

  describe('search', () => {
    const mockSearchResults = [
      {
        id: '1',
        name: 'Tomato',
        price: 5.99,
        stock: 100,
        category: 'vegetables',
        userId: 'user1',
        created_at: new Date()
      }
    ];

    it('should search products by name and category', async () => {
      poolQuery.mockResolvedValue({ rows: mockSearchResults });

      const result = await ProductModel.search('tomato');

      expect(poolQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE name ILIKE $1 OR category_id ILIKE $1'),
        ['%tomato%']
      );
      expect(result).toEqual(mockSearchResults);
    });

    it('should return empty array if no results found', async () => {
      poolQuery.mockResolvedValue({ rows: [] });

      const result = await ProductModel.search('nonexistent');

      expect(result).toEqual([]);
    });
  });
});
