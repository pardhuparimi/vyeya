export interface IUser {
  id: string;
  email: string;
  phone: string;
  role: 'Buyer' | 'Seller' | 'Delivery' | 'Admin';
  address: any; // Consider a more specific address interface
  created_at: Date;
}

export interface IStore {
  id: string;
  user_id: string;
  name: string;
  type: 'Casual' | 'Business';
  location: any; // Consider a more specific location interface
  hours: any; // Consider a more specific hours interface
  verified: boolean;
}

export interface IProduct {
  id: string;
  store_id: string;
  name: string;
  price: number;
  stock: number;
  location: any; // Consider a more specific location interface
  category_id: string;
}

export interface IOrder {
  id: string;
  user_id: string;
  store_id: string;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered';
  created_at: Date;
}

export interface IReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
}

export interface ICategory {
  id: string;
  name: string;
  parent_id?: string;
}

export interface IDelivery {
  id: string;
  order_id: string;
  status: string; // Define specific delivery statuses
  eta: Date;
}

export interface IPayment {
  id: string;
  order_id: string;
  amount: number;
  status: string; // Define specific payment statuses
  stripe_id: string;
}