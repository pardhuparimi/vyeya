const API_URL = 'http://10.0.2.2:3000/api/v1';

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export const createOrder = async (token: string, items: any[], totalAmount: number): Promise<Order> => {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ items, totalAmount }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create order');
  }
  
  const data = await response.json();
  return data.order;
};

export const getOrders = async (token: string): Promise<Order[]> => {
  const response = await fetch(`${API_URL}/orders`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  
  const data = await response.json();
  return data.orders;
};

export const getOrderById = async (token: string, orderId: string): Promise<Order> => {
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch order');
  }
  
  const data = await response.json();
  return data.order;
};