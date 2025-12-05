import { Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200, message?: string) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message
  };
  return res.status(statusCode).json(response);
};

export const sendError = (res: Response, error: string, statusCode = 500) => {
  const response: ApiResponse<null> = {
    success: false,
    error
  };
  return res.status(statusCode).json(response);
};
