import request from 'supertest';
import app from '../index';

export const makeRequest = (method: string, endpoint: string, data?: object) => {
  const requestAgent = request(app);
  
  switch (method.toUpperCase()) {
    case 'GET':
      return requestAgent.get(endpoint);
    case 'POST':
      return requestAgent.post(endpoint).send(data);
    case 'PUT':
      return requestAgent.put(endpoint).send(data);
    case 'DELETE':
      return requestAgent.delete(endpoint);
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
};
