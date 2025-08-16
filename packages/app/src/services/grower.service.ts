const API_URL = 'http://10.0.2.2:3000/api/v1';

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
  
  const data = await response.json();
  return data.grower;
};