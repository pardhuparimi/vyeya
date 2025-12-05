import { Response, NextFunction } from 'express';
import { OrderModel } from '../models/Order';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('Order items are required', 400);
    }

    if (!totalAmount || totalAmount <= 0) {
      throw new AppError('Valid total amount is required', 400);
    }

    const order = await OrderModel.create(req.user?.id || '', items, totalAmount);
    sendSuccess(res, { order }, 201);
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await OrderModel.findByUserId(req.user?.id || '');
    sendSuccess(res, { orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await OrderModel.findById(req.params.orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.user_id !== req.user?.id) {
      throw new AppError('Access denied', 403);
    }

    const items = await OrderModel.getOrderItems(req.params.orderId);
    sendSuccess(res, { order: { ...order, items } });
  } catch (error) {
    next(error);
  }
};
