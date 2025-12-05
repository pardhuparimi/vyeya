import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/apiResponse';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  // Handle specific errors (e.g., body-parser errors)
  if (err.name === 'SyntaxError' && 'body' in err) {
    return sendError(res, 'Invalid JSON payload', 400);
  }

  return sendError(res, 'Internal Server Error', 500);
};
