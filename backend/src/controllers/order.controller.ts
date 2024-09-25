import { Request, Response, NextFunction } from 'express';
import Order from '../models/order.model';
import User from '../models/user.model';
import Product from '../models/product.model';
import { NotFoundError, UnauthorizedError, BadRequestError, InternalServerError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';
import { generateMagicLink } from '../utils/auth.util';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { products, shippingAddress, shippingMethod, paymentMethod } = req.body;

    // Calculate total amount and check inventory
    let totalAmount = 0;
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new NotFoundError(`Product with id ${item.product}`);
      }
      if (product.inventory < item.quantity) {
        throw new BadRequestError(`Insufficient inventory for product ${product.name}`);
      }
      totalAmount += product.price * item.quantity;
      // Update inventory
      product.inventory -= item.quantity;
      await product.save();
    }

    const orderData = {
      user: req.user ? req.user._id : null,
      products,
      totalAmount,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      status: 'pending'
    };

    if (!req.user) {
      // For anonymous users, create a anon user account 
      const magicLink = await generateMagicLink();
      orderData.magicLink = magicLink.token;
      orderData.magicLinkExpires = magicLink.expires;
    }

    const order = new Order(orderData);
    await order.save();

    logger.info('Order created', { orderId: order._id, userId: req.user?._id });
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const getOrderDetails = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId, token } = req.params;
    let order;

    if (token) {
      // For anonymous users
      order = await Order.findOne({ _id: orderId, magicLink: token, magicLinkExpires: { $gt: new Date() } });
    } else if (req.user) {
      // For authenticated users
      order = await Order.findOne({ _id: orderId, user: req.user._id });
    }

    if (!order) {
      throw new NotFoundError('Order');
    }

    logger.info('Order details retrieved', { orderId, userId: req.user?._id });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const getUserOrderHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    logger.info('User order history retrieved', { userId: req.user._id, orderCount: orders.length });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (req.user?.role !== 'owner' && req.user?.role !== 'admin') {
      throw new UnauthorizedError('Not authorized to update order status');
    }

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) {
      throw new NotFoundError('Order');
    }

    logger.info('Order status updated', { orderId, status, updatedBy: req.user._id });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId, token } = req.params;
    let order;

    if (token) {
      // For anonymous users
      order = await Order.findOne({ _id: orderId, magicLink: token, magicLinkExpires: { $gt: new Date() } });
    } else if (req.user) {
      // For authenticated users
      order = await Order.findOne({ _id: orderId, user: req.user._id });
    }

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (order.status !== 'pending') {
      throw new BadRequestError('Order cannot be cancelled');
    }

    order.status = 'cancelled';
    await order.save();

    // Restore inventory
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, { $inc: { inventory: item.quantity } });
    }

    logger.info('Order cancelled', { orderId, userId: req.user?._id });
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

export const getOrderStatistics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role !== 'owner' && req.user?.role !== 'admin') {
      throw new UnauthorizedError('Not authorized to view order statistics');
    }

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    logger.info('Order statistics retrieved', { retrievedBy: req.user._id });
    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus: ordersByStatus.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {})
    });
  } catch (error) {
    next(error);
  }
};

export const searchOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role !== 'owner' && req.user?.role !== 'admin') {
      throw new UnauthorizedError('Not authorized to search orders');
    }

    const { query, page = 1, limit = 20 } = req.query;
    const searchRegex = new RegExp(query as string, 'i');

    const orders = await Order.find({
      $or: [
        { 'shippingAddress.name': searchRegex },
        { 'shippingAddress.email': searchRegex },
        { _id: searchRegex }
      ]
    })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments({
      $or: [
        { 'shippingAddress.name': searchRegex },
        { 'shippingAddress.email': searchRegex },
        { _id: searchRegex }
      ]
    });

    logger.info('Orders searched', { query, page, limit, resultCount: orders.length, searchedBy: req.user._id });
    res.json({
      orders,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    next(error);
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