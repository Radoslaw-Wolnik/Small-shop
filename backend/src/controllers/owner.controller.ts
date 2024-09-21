// src/controllers/owner.controller.ts
import { Request, Response, NextFunction } from 'express';
import { NotFoundError, InternalServerError, ValidationError, CustomError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';

import ProductTemplate from '../models/product-template.model';
import Category from '../models/category.model';
import Product from '../models/product.model';
import Order from '../models/order.model';


export const createProductTemplate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newTemplate = new ProductTemplate(req.body);
    await newTemplate.save();
    logger.info('New product template created', { templateId: newTemplate._id, createdBy: req.user?.id });
    res.status(201).json(newTemplate);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error creating product template'));
  }
};

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    logger.info('New category created', { categoryId: newCategory._id, createdBy: req.user?.id });
    res.status(201).json(newCategory);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error creating category'));
  }
};

export const addTag = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, tag } = req.body;
    const product = await Product.findByIdAndUpdate(
      productId,
      { $addToSet: { tags: tag } },
      { new: true }
    );
    if (!product) {
      throw new NotFoundError('Product');
    }
    logger.info('Tag added to product', { productId, tag, updatedBy: req.user?.id });
    res.json(product);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error adding tag'));
  }
};

export const removeTag = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, tag } = req.body;
    const product = await Product.findByIdAndUpdate(
      productId,
      { $pull: { tags: tag } },
      { new: true }
    );
    if (!product) {
      throw new NotFoundError('Product');
    }
    logger.info('Tag removed from product', { productId, tag, updatedBy: req.user?.id });
    res.json(product);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error removing tag'));
  }
};

export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = status ? { status } : {};
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('user', 'username email');
    
    const total = await Order.countDocuments(query);
    
    logger.info('Orders retrieved', { count: orders.length, status, page, limit });
    res.json({
      orders,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalOrders: total
    });
  } catch (error) {
    next(new InternalServerError('Error fetching orders'));
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, trackingNumber },
      { new: true }
    );
    if (!order) {
      throw new NotFoundError('Order');
    }
    logger.info('Order status updated', { orderId, status, updatedBy: req.user?.id });
    res.json(order);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error updating order status'));
  }
};

// Add more owner-specific functions as needed