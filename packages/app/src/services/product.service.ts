import { IProduct } from '../../../shared/src';
import { Config } from '../config';

const { API_URL } = Config;

export const getProducts = async (): Promise<IProduct[]> => {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const result = await response.json();
  return result.data.products;
};

export const createProduct = async (product: Omit<IProduct, 'id'>): Promise<IProduct> => {
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    throw new Error('Failed to create product');
  }
  const result = await response.json();
  return result.data;
};

export const getProductById = async (id: number): Promise<IProduct> => {
  const response = await fetch(`${API_URL}/products/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  const result = await response.json();
  return result.data.product;
};

export const searchProducts = async (query: string): Promise<IProduct[]> => {
  const response = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search products');
  }
  const result = await response.json();
  return result.data.products;
};

export const getMyProducts = async (token: string): Promise<IProduct[]> => {
  const response = await fetch(`${API_URL}/products/my`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch my products');
  }
  const result = await response.json();
  return result.data.products;
};
