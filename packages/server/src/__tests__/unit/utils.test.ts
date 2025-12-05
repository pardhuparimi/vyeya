import { AppError } from '../../utils/AppError';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { errorHandler } from '../../middleware/error';
import { Request, Response, NextFunction } from 'express';

describe('Utils', () => {
  describe('AppError', () => {
    it('should create an error with status code and operational flag', () => {
      const error = new AppError('Test error', 400);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('apiResponse', () => {
    let mockRes: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
      jsonMock = jest.fn();
      statusMock = jest.fn().mockReturnValue({ json: jsonMock });
      mockRes = {
        status: statusMock,
      };
    });

    it('sendSuccess should send formatted success response', () => {
      const data = { id: 1 };
      sendSuccess(mockRes as Response, data);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
        message: undefined
      });
    });

    it('sendError should send formatted error response', () => {
      sendError(mockRes as Response, 'Something went wrong', 500);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Something went wrong'
      });
    });
  });
});

describe('Middleware', () => {
  describe('errorHandler', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
      mockReq = {};
      jsonMock = jest.fn();
      statusMock = jest.fn().mockReturnValue({ json: jsonMock });
      mockRes = {
        status: statusMock,
      };
      mockNext = jest.fn();
    });

    it('should handle AppError correctly', () => {
      const error = new AppError('Custom error', 400);
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Custom error'
      });
    });

    it('should handle unknown errors as 500', () => {
      const error = new Error('Unknown error');
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Internal Server Error'
      });
    });
  });
});
