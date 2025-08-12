import { IProduct } from '../../../shared/src';

const API_URL = 'http://10.0.2.2:3000/api/v1';

export const getProducts = async (): Promise<IProduct[]> => {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const data = await response.json();
  return data.products;
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
  return response.json();
};
