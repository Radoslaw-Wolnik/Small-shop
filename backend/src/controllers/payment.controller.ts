// src/controllers/payment.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CustomError, NotFoundError, InternalServerError, BadRequestError, PaymentError, UnauthorizedError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';
import Order, { IOrderDocument } from '../models/order.model';
import { initializePayPalPayment, verifyPayPalPayment } from '../services/payment/paypal.service';
import { initializePrzelewy24Payment, verifyPrzelewy24Payment } from '../services/payment/przelewy24.service';
import { initializePayUPayment, verifyPayUPayment } from '../services/payment/payU.service';
import { processStripePayment, verifyStripePayment } from '../services/payment/stripe.service';
import environment from '../config/environment';

export const initializePayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId, gateway } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.user.toString() !== req.user!._id.toString()) {
      throw new UnauthorizedError('Not authorized to pay for this order');
    }

    let paymentResult: PaymentInitializationResult;
    switch (gateway) {
      case 'paypal':
        paymentResult = await initializePayPalPayment(order);
        break;
      case 'przelewy24':
        paymentResult = await initializePrzelewy24Payment(order);
        break;
      case 'payu':
        paymentResult = await initializePayUPayment(order);
        break;
      case 'stripe':
        paymentResult = await processStripePayment(order);
        break;
      default:
        throw new BadRequestError('Invalid payment gateway');
    }

    order.paymentStatus = 'pending';
    order.paymentMethod = gateway;
    order.transactionId = paymentResult.transactionId;
    order.paymentUrl = paymentResult.paymentUrl;
    await order.save();

    logger.info('Payment initialized', { orderId, gateway, userId: req.user?._id });
    res.json({ paymentUrl: paymentResult.paymentUrl, transactionId: paymentResult.transactionId });
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error initializing payment'));
  }
};

export const handlePaymentCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { gateway } = req.params;
    const paymentData = req.body;

    let verificationResult: { success: boolean; orderId: string };
    switch (gateway) {
      case 'paypal':
        verificationResult = await verifyPayPalPayment(paymentData.transactionId);
        break;
      case 'przelewy24':
        verificationResult = await verifyPrzelewy24Payment(paymentData.sessionId, paymentData.orderId, paymentData.amount, paymentData.currency, paymentData.signature);
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
      throw new PaymentError('Payment verification failed');
    }
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error handling payment callback'));
  }
};

export const getPaymentStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId, token } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (req.user) {
      // Authenticated user
      if (order.user && order.user.toString() !== req.user.id) {
        throw new UnauthorizedError('Not authorized to view this order');
      }
    } else {
      // Non-authenticated user
      if (!token || token !== order.anonToken) {
        throw new UnauthorizedError('Invalid or missing token');
      }
    }

    res.json({ paymentStatus: order.paymentStatus });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (!order.transactionId) {
      throw new BadRequestError('No transaction ID found for this order');
    }

    if (order.user.toString() !== req.user!._id.toString()) {
      throw new UnauthorizedError('Not authorized to verify payment for this order');
    }

    let verificationResult: PaymentVerificationResult;
    switch (order.paymentMethod) {
      case 'paypal':
        verificationResult = await verifyPayPalPayment(order.transactionId);
        break;
      case 'przelewy24':
        verificationResult = await verifyPrzelewy24Payment(order.transactionId, orderId, order.totalAmount, 'PLN', req.body.signature);
        break;
      case 'payu':
        verificationResult = await verifyPayUPayment(req.body);
        break;
      case 'stripe':
        verificationResult = await verifyStripePayment(order.transactionId);
        break;
      default:
        throw new BadRequestError('Invalid payment method');
    }

    if (verificationResult.success) {
      order.paymentStatus = 'paid';
      await order.save();

      await environment.email.service.sendTemplatedEmail(
        order.userEmail,
        'paymentUpdate',
        {
          orderId: order._id,
          paymentStatus: order.paymentStatus,
          frontendUrl: environment.app.frontend,
          token: order.anonToken
        },
        { id: order.user.toString(), isAnonymous: order.isAnonymousOrder }
      );

      logger.info('Payment verified', { orderId, paymentMethod: order.paymentMethod });
      res.json({ message: 'Payment verified successfully' });
    } else {
      await environment.email.service.sendTemplatedEmail(
        order.userEmail,
        'paymentUpdate',
        {
          orderId: order._id,
          paymentStatus: order.paymentStatus, // or failed or sth like that
          frontendUrl: environment.app.frontend,
          token: order.anonToken
        },
        { id: order.user.toString(), isAnonymous: order.isAnonymousOrder }
      );
      throw new PaymentError('Payment verification failed');
    }
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error verifying payment'));
  }
};