// src/middleware/payment-security.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/custom-errors.util';
import crypto from 'crypto';

export const verifyPaymentCallback = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['x-payment-signature'];
  const payload = JSON.stringify(req.body);
  const secretKey = process.env.PAYMENT_WEBHOOK_SECRET;

  if (!signature || !secretKey) {
    return next(new UnauthorizedError('Invalid payment callback'));
  }

  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return next(new UnauthorizedError('Invalid payment signature'));
  }

  next();
};