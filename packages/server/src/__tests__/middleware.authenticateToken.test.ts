import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { verifyToken, findUserById } from '../services/authService';

// Mock the auth service
jest.mock('../services/authService');

const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;
const mockFindUserById = findUserById as jest.MockedFunction<typeof findUserById>;

describe('authenticateToken middleware', () => {
  let req: any;
  let res: any;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if no authorization header', async () => {
    await authenticateToken(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header has no token', async () => {
    req.headers.authorization = 'Bearer';
    
    await authenticateToken(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', async () => {
    req.headers.authorization = 'Bearer invalid-token';
    mockVerifyToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });
    
    await authenticateToken(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if user not found', async () => {
    req.headers.authorization = 'Bearer valid-token';
    mockVerifyToken.mockReturnValue({ userId: 'user123' });
    mockFindUserById.mockResolvedValue(null);
    
    await authenticateToken(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should set user and call next if token is valid', async () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      role: 'user',
      name: 'Test User',
      password: 'hashed-password'
    };
    
    req.headers.authorization = 'Bearer valid-token';
    mockVerifyToken.mockReturnValue({ userId: 'user123' });
    mockFindUserById.mockResolvedValue(mockUser);
    
    await authenticateToken(req, res, next);
    
    expect(req.user).toEqual({
      id: 'user123',
      email: 'test@example.com',
      role: 'user',
      name: 'Test User'
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should handle findUserById errors', async () => {
    req.headers.authorization = 'Bearer valid-token';
    mockVerifyToken.mockReturnValue({ userId: 'user123' });
    mockFindUserById.mockRejectedValue(new Error('Database error'));
    
    await authenticateToken(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });
});
