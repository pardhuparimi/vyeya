import { Config } from '../config';

const { API_URL } = Config;

export interface Grower {
  id: string;
  name: string;
  bio?: string;
  phone?: string;
  location?: string;
  role: string;
}

export const getGrowerProfile = async (growerId: string): Promise<Grower> => {
  const response = await fetch(`${API_URL}/auth/grower/${growerId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch grower profile');
  }
  
  const result = await response.json();
  return result.data.grower;
};