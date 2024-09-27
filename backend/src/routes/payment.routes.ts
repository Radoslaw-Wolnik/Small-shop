// src/routes/payment.routes.ts
import express from 'express';
import { authenticateJWT, optionalAuthJWT } from '../middleware/auth.middleware';
import { verifyPaymentCallback } from '../middleware/payment-security.middleware';
import {
  initializePayment,
  handlePaymentCallback,
  getPaymentStatus,
  verifyPayment,
} from '../controllers/payment.controller';

const router = express.Router();

// Routes that require authentication
router.post('/initialize', authenticateJWT, initializePayment);
router.post('/verify/:orderId', authenticateJWT, verifyPayment);

// Routes that handle callbacks from payment gateways
router.post('/callback/:gateway', verifyPaymentCallback, handlePaymentCallback);

// Routes that can be accessed with or without authentication
router.get('/status/:orderId/:token?', optionalAuthJWT, getPaymentStatus);

export default router;