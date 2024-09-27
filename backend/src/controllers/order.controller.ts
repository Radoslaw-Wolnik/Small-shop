import { Request, Response, NextFunction } from 'express';
import Order, { IOrderDocument } from '../models/order.model';
import User, { IUserDocument } from '../models/user.model';
import Product from '../models/product.model';
import { NotFoundError, UnauthorizedError, BadRequestError, InternalServerError, PaymentError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';
import { formatOrderDetails } from '../utils/order.util';
import mongoose, { ClientSession } from 'mongoose';
import environment from '../config/environment';
import crypto from 'crypto';
import { generateAnonymousToken } from '../middleware/auth.middleware';


interface OrderData {
  user: string;
  userEmail: string;
  isAnonymousOrder: boolean;
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
    
    const variantKey = Object.entries(item.selectedVariants)
      .map(([key, value]) => `${key}:${value}`)
      .join('_');
    const inventoryItem = product.inventory.find(inv => inv.variantCombination === variantKey);
    
    if (!inventoryItem || inventoryItem.stock < item.quantity) {
      throw new BadRequestError(`Insufficient inventory for product ${product.name} with selected variants`);
    }
    
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
    
    inventoryItem.stock -= item.quantity;
    await product.save({ session });
  }

  orderData.totalAmount = totalAmount;
  const order = new Order(orderData);
  await order.save({ session });

  return order;
};

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { products, shippingAddress, shippingMethod, paymentMethod, email } = req.body;

    let user: IUserDocument | null = (req as AuthRequest).user || null; // req.user works too
    let isAnonymous = false;

    if (!user) {
      // Handle anonymous user
      user = await User.findOne({ email, isAnonymous: true }).session(session);
      if (!user) {
        user = new User({ email, isAnonymous: true });
        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 24hrs * 3
        user.oneTimeLoginToken = token;
        user.oneTimeLoginExpires = expires;
        await user.save({ session });

        await environment.email.service?.sendTemplatedEmail(
          email,
          'magicLink',
          { 
            verificationUrl: `${environment.app.frontend}/magic-login/${token}`,
            frontendUrl: environment.app.frontend
          },
          { id: user._id.toString(), isAnonymous: true }
        );
      }
      isAnonymous = true;
    }

    const orderData: OrderData = {
      user: user._id.toString(),
      userEmail: email,
      isAnonymousOrder: isAnonymous,
      products,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      status: 'pending'
    };

    if (isAnonymous) {
      orderData.anonToken = crypto.randomBytes(20).toString('hex');
      orderData.anonTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

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
        frontendUrl: environment.app.frontend,
      },
      { id: user._id.toString(), isAnonymous }
    );

    logger.info('Order created', { orderId: order._id, userId: user._id, isAnonymous });
    res.status(201).json({ 
      message: 'Order created successfully. Check your email for order details.',
      orderId: order._id,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};


export const getOrderDetails = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!req.user){
      throw new UnauthorizedError('No user attached to request');
    }

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (order.user.toString() !== req.user._id.toString()) {
      throw new UnauthorizedError('Not authorized to view this order');
    }

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
    const { id } = req.params;
    const { status } = req.body;

    if (req.user?.role !== 'owner' && req.user?.role !== 'admin') {
      throw new UnauthorizedError('Not authorized to update order status');
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      throw new NotFoundError('Order');
    }


    // Send order status update email
    await environment.email.service?.sendTemplatedEmail(
      order.userInfo.email,
      'orderStatusUpdate',
      {
        orderId: order._id,
        newStatus: status,
        frontendUrl: environment.app.frontend,
        token: order.anonToken
      },
      { id: order.user.toString(), isAnonymous: order.userInfo.isAnonymous }
    );

    logger.info('Order status updated', { id, status, updatedBy: req.user._id });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      throw new NotFoundError('Order');
    }

    const user = req.user;
    const anonymousToken = req.query.token as string;

    if (!user && (!anonymousToken || anonymousToken !== order.anonToken)) {
      throw new UnauthorizedError('Not authorized to cancel this order');
    }

    if (user && order.user.toString() !== user._id.toString()) {
      throw new UnauthorizedError('Not authorized to cancel this order');
    }

    if (!['pending', 'processing'].includes(order.status)) {
      throw new BadRequestError('Order cannot be cancelled');
    }

    // Release inventory
    for (const item of order.products) {
      const product = await Product.findById(item.product).session(session);
      if (product) {
        const variantKey = Object.entries(item.selectedVariants)
          .map(([key, value]) => `${key}:${value}`)
          .join('_');
        const inventoryItem = product.inventory.find(inv => inv.variantCombination === variantKey);
        if (inventoryItem) {
          inventoryItem.stock += item.quantity;
          await product.save({ session });
        }
      }
    }

    

    await session.commitTransaction();
    session.endSession();

    // Send order cancellation email
    await environment.email.service.sendTemplatedEmail(
      order.userInfo.email,
      'orderCancellation',
      {
        orderId: order._id,
        frontendUrl: environment.app.frontend,
        token: anonymousToken
      },
      { id: order.user.toString(), isAnonymous: order.userInfo.isAnonymous }
    );

    order.status = 'cancelled';
    await order.save();

    logger.info('Order cancelled', { id, userId: req.user!._id });
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


// import { refundPayment } from '../services/payment/payment.service'; // You'll need to implement this

export const markOrderAsReceived = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const anonymousToken = req.query.token as string;

    const order = await Order.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check authorization
    if (!req.user && (!anonymousToken || anonymousToken !== order.anonToken)) {
      throw new UnauthorizedError('Not authorized to mark this order as received');
    }

    if (req.user && order.user.toString() !== req.user._id.toString()) {
      throw new UnauthorizedError('Not authorized to mark this order as received');
    }

    if (order.status !== 'shipped') {
      throw new BadRequestError('Order must be in shipped status to be marked as received');
    }

    order.status = 'delivered';
    await order.save();

    // Send order received confirmation email
    await environment.email.service.sendTemplatedEmail(
      order.userInfo.email,
      'orderReceived',
      {
        orderId: order._id,
        frontendUrl: environment.app.frontend,
        token: order.anonToken
      },
      { id: order.user.toString(), isAnonymous: order.userInfo.isAnonymous }
    );

    logger.info('Order marked as received', { id, userId: req.user?._id || 'anonymous' });
    res.json({ message: 'Order marked as received successfully' });
  } catch (error) {
    next(error);
  }
};

export const denyOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (req.user?.role !== 'owner' && req.user?.role !== 'admin') {
      throw new UnauthorizedError('Not authorized to deny orders');
    }

    const order = await Order.findById(id).session(session);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status !== 'pending' && order.status !== 'processing') {
      throw new BadRequestError('Only pending or processing orders can be denied');
    }

    // Attempt to refund the payment
    if (order.paymentStatus === 'paid') {
      try {
        await refundPayment(order.transactionId);
      } catch (error) {
        throw new PaymentError('Failed to refund payment. Please handle this manually.');
      }
    }

    // Release inventory
    for (const item of order.products) {
      const product = await Product.findById(item.product).session(session);
      if (product) {
        const variantKey = Object.entries(item.selectedVariants)
          .map(([key, value]) => `${key}:${value}`)
          .join('_');
        const inventoryItem = product.inventory.find(inv => inv.variantCombination === variantKey);
        if (inventoryItem) {
          inventoryItem.stock += item.quantity;
          await product.save({ session });
        }
      }
    }

    order.status = 'denied';
    order.denialReason = reason;
    await order.save({ session });

    await session.commitTransaction();

    // Send order denial email
    await environment.email.service.sendTemplatedEmail(
      order.userInfo.email,
      'orderDenied',
      {
        orderId: order._id,
        reason: reason,
        frontendUrl: environment.app.frontend,
        token: order.anonToken
      },
      { id: order.user.toString(), isAnonymous: order.userInfo.isAnonymous }
    );

    logger.info('Order denied', { id, reason, deniedBy: req.user._id });
    res.json({ message: 'Order denied successfully' });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};