// src/controllers/order.controller.ts
import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/order.model';
import { NotFoundError, InternalServerError, CustomError } from '../utils/custom-errors.util';


export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    next(new InternalServerError('Error creating order'));
  }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find().populate('user').populate('items.product');
    res.json(orders);
  } catch (error) {
    next(new InternalServerError('Error fetching orders'));
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id).populate('user').populate('items.product');
    if (!order) {
      throw new NotFoundError('Order');
    }
    res.json(order);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error fetching order'));
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) {
      throw new NotFoundError('Order');
    }
    res.json(order);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error updating order status'));
  }
};

