import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { IdempotencyService } from '../services/idempotency.service';
import Order from '../models/order.model';
import { NotFoundError, PaymentError } from '../utils/custom-errors.util';
import { Redis } from 'ioredis';
import { SecureDataService } from '../services/secure-data.service';
import { BadRequestError, InternalServerError, CustomError } from '../utils/custom-errors.util';
import environment from '../config/environment';

// Initialize Redis Client (you might want to move this to an app-level config)
const redisClient = new Redis();
const idempotencyService = new IdempotencyService(redisClient);
const secureDataService = new SecureDataService(environment.app.MASTER_KEY);
const paymentService = new PaymentService(idempotencyService, secureDataService);


// Initialize Payment Route
export const initializePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, gateway } = req.body;
    let idempotencyKey = req.headers['x-idempotency-key']; // Ensure idempotency key is sent in headers

    if (!idempotencyKey) throw new BadRequestError('Missing Idempotency Key');

    // Handle the case where idempotencyKey might be an array
    if (Array.isArray(idempotencyKey)) {
      idempotencyKey = idempotencyKey[0];  // Use the first element if it's an array
    }

    const result = await paymentService.initializePayment(orderId, gateway, idempotencyKey);
    
    res.json(result);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error initializing payment'));
  }
};

// Handle Payment Callback
export const handlePaymentCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gateway } = req.params;
    const paymentData = req.body;

    const verificationResult = await paymentService.verifyPayment(gateway, paymentData);

    if (verificationResult.success) {
      // Update order status to 'paid'
      const order = await Order.findById(verificationResult.orderId);
      if (!order) throw new NotFoundError('Order not found');

      order.paymentStatus = 'paid';
      await order.save();
      res.json({ message: 'Payment verified successfully' });
    } else {
      throw new PaymentError('Payment verification failed');
    }
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error verifying payment'));
  }
};
