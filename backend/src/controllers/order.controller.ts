import { Request, Response, NextFunction } from 'express';
import Order, { IOrderDocument } from '../models/order.model';
import User from '../models/user.model';
import Product from '../models/product.model';
import { NotFoundError, UnauthorizedError, BadRequestError, InternalServerError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';
import { formatOrderDetails } from '../utils/order.util';
import mongoose, { ClientSession } from 'mongoose';
import environment from '../config/environment';
import crypto from 'crypto';

interface OrderData {
  user: string;
  products: Array<{
    product: string;
    quantity: number;
    selectedVariants: { [key: string]: string };
  }>;
  shippingAddress: string;
  shippingMethod: string;
  paymentMethod: string;
  status: string;
  anonToken?: string;
  anonTokenExpires?: Date;
  totalAmount?: number;
}

const createOrderCore = async (orderData: OrderData, session: ClientSession): Promise<IOrderDocument> => {
  let totalAmount = 0;
  for (const item of orderData.products) {
    const product = await Product.findById(item.product).session(session);
    if (!product) {
      throw new NotFoundError(`Product with id ${item.product}`);
    }
    
    // Check inventory for specific variant combination
    const variantKey = Object.entries(item.selectedVariants)
      .map(([key, value]) => `${key}:${value}`)
      .join('_');
    const inventoryItem = product.inventory.find(inv => inv.variantCombination === variantKey);
    
    if (!inventoryItem || inventoryItem.stock < item.quantity) {
      throw new BadRequestError(`Insufficient inventory for product ${product.name} with selected variants`);
    }
    
    // Calculate price based on base price and variant prices
    let itemPrice = product.basePrice;
    for (const [variantName, optionName] of Object.entries(item.selectedVariants)) {
      const variant = product.variants.find(v => v.variant.toString() === variantName);
      if (variant) {
        const option = variant.options.find(o => o.name === optionName);
        if (option && option.price) {
          itemPrice += option.price;
        }
      }
    }
    
    totalAmount += itemPrice * item.quantity;
    
    // Update inventory
    inventoryItem.stock -= item.quantity;
    await product.save({ session });
  }

  orderData.totalAmount = totalAmount;
  const order = new Order(orderData);
  await order.save({ session });

  return order;
};

export const createOrderLoggedIn = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { products, shippingAddress, shippingMethod, paymentMethod } = req.body;

    const orderData = {
      user: req.user!._id.toString(),
      products,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      status: 'pending'
    };

    const order = await createOrderCore(orderData, session);

    await session.commitTransaction();
    session.endSession();

    await environment.email.service?.sendTemplatedEmail(
      req.user!.email,
      'orderConfirmation',
      {
        orderId: order._id,
        totalAmount: order.totalAmount,
        orderDetails: formatOrderDetails(order)
      }
    );

    logger.info('Order created', { orderId: order._id, userId: req.user!._id });
    res.status(201).json(order);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const createOrderAnonymous = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { products, shippingAddress, shippingMethod, paymentMethod, email } = req.body;

    // Create or find anonymous user
    let user = await User.findOne({ email, isAnonymous: true }).session(session);
    if (!user) {
      user = new User({ email, isAnonymous: true });
      const token = crypto.randomBytes(20).toString('hex');
      const expires = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 24hrs * 3
      user.oneTimeLoginToken = token;
      user.oneTimeLoginExpires = expires;
      await user.save({ session });

      // Send magic link email
      await environment.email.service?.sendTemplatedEmail(
        email,
        'magicLink',
        { verificationUrl: `${environment.app.frontend}/magic-login/${token}` }
      );
    }

    const orderData = {
      user: user._id.toString(),
      products,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      status: 'pending',
      anonToken: crypto.randomBytes(20).toString('hex'),
      anonTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    const order = await createOrderCore(orderData, session);

    await session.commitTransaction();
    session.endSession();

    await environment.email.service?.sendTemplatedEmail(
      email,
      'orderConfirmation',
      {
        orderId: order._id,
        totalAmount: order.totalAmount,
        orderDetails: formatOrderDetails(order),
        anonToken: order.anonToken
      }
    );

    logger.info('Anonymous order created', { orderId: order._id, email });
    res.status(201).json({ 
      message: 'Order created successfully. Check your email for order details and login link.',
      orderId: order._id,
      anonToken: order.anonToken
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
  const session = await mongoose.startSession();
  session.startTransaction();
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

    if (!['pending', 'processing'].includes(order.status)) {
      throw new BadRequestError('Order cannot be cancelled');
    } else {
      // Restore inventory
      for (const item of order.products) {
        const product = await Product.findById(item.product);
        if (product) {
          const variantKey = Object.entries(item.selectedVariants)
            .map((key, value) => `${key}:${value}`)
            .join('_');
          await product.releaseInventory(variantKey, item.quantity);
        }
      }
    }

    

    await session.commitTransaction();
    session.endSession();

    order.status = 'cancelled';
    await order.save();

    logger.info('Order cancelled', { orderId, userId: req.user?._id });
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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