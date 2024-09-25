// src/controllers/payment.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CustomError, NotFoundError, InternalServerError, BadRequestError, PaymentError, UnauthorizedError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';
import Order from '../models/order.model';
// Import payment gateway services (these would need to be implemented)
import { initializePayPalPayment, verifyPayPalPayment } from '../services/payment/paypal.service';
import { initializePrzelewy24Payment, verifyPrzelewy24Payment } from '../services/payment/przelewy24.service';
import { initializePayUPayment, verifyPayUPayment } from '../services/payment/payU.service';

export const initializePayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId, gateway } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    let paymentUrl;
    switch (gateway) {
      case 'paypal':
        paymentUrl = await initializePayPalPayment(order);
        break;
      case 'przelewy24':
        paymentUrl = await initializePrzelewy24Payment(order);
        break;
      case 'payu':
        paymentUrl = await initializePayUPayment(order);
        break;
      case 'stripe':
        // not yet implemented
      default:
        throw new BadRequestError('Invalid payment gateway');
    }

    logger.info('Payment initialized', { orderId, gateway, userId: req.user!.id });
    res.json({ paymentUrl });
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error initializing payment'));
  }
};

export const handlePaymentCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { gateway } = req.params;
    const paymentData = req.body;

    let verificationResult;
    switch (gateway) {
      case 'paypal':
        verificationResult = await verifyPayPalPayment(paymentData);
        break;
      case 'przelewy24':
        verificationResult = await verifyPrzelewy24Payment(paymentData);
        break;
      case 'payu':
        verificationResult = await verifyPayUPayment(paymentData);
        break;
      default:
        throw new BadRequestError('Invalid payment gateway');
    }

    if (verificationResult.success) {
      const order = await Order.findById(verificationResult.orderId);
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      order.paymentStatus = 'paid';
      await order.save();

      logger.info('Payment verified', { orderId: verificationResult.orderId, gateway });
      res.json({ message: 'Payment verified successfully' });
    } else {
      throw new BadRequestError('Payment verification failed');
    }
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error handling payment callback'));
  }
};

export const getPaymentStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (req.user && order.user && order.user.toString() !== req.user._id.toString()) {
      throw new UnauthorizedError('Not authorized to view this order');
    }

    res.json({ paymentStatus: order.paymentStatus });
  } catch (error) {
    next(error);
  }
};

export const processPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId, paymentMethod, paymentDetails } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Here you would typically integrate with a payment processor
    // This is a simplified example
    const paymentSuccessful = Math.random() > 0.1; // 90% success rate for demonstration

    if (paymentSuccessful) {
      order.paymentStatus = 'paid';
      order.paymentMethod = paymentMethod;
      await order.save();

      logger.info('Payment processed successfully', { orderId, paymentMethod });
      res.json({ message: 'Payment processed successfully' });
    } else {
      throw new PaymentError('Payment processing failed');
    }
  } catch (error) {
    next(error);
  }
};