import { Request, Response, NextFunction } from 'express';
import { ProductModel } from '../models/Product';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

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

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await ProductModel.findAll();
    sendSuccess(res, {
      products,
      total: products.length
    });
  } catch (error) {
    console.error('Database error:', error);
    // Fallback to mock data if database fails
    // In a real scenario, we might want to throw an error, but keeping fallback for now as per original code
    sendSuccess(res, {
      products: mockProducts,
      total: mockProducts.length
    });
  }
};

export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    if (!q) {
      throw new AppError('Search query is required', 400);
    }

    const products = await ProductModel.search(q as string);
    sendSuccess(res, { products });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    sendSuccess(res, { product });
  } catch (error) {
    next(error);
  }
};

export const getMyProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const products = await ProductModel.findByUserId(req.user?.id || '');
    sendSuccess(res, { products }); // Consistent response format
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, price, stock, store_id, location, category_id } = req.body;

    if (!name || !price || !stock || !store_id || !category_id) {
      throw new AppError('Missing required fields', 400);
    }

    const product = await ProductModel.create({
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      store_id,
      location: location || { lat: 40.7128, lng: -74.0060 },
      category_id
    });

    sendSuccess(res, product, 201);
  } catch (error) {
    next(error);
  }
};
