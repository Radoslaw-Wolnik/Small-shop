// src/routes/payment.routes.ts
import express from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { verifyPaymentCallback } from '../middleware/payment-security.middleware';
import {
  initializePayment,
  handlePaymentCallback,
  getPaymentStatus,
  processPayment,
} from '../controllers/payment.controller';

const router = express.Router();

router.post('/initialize', authenticateJWT, initializePayment);
router.post('/callback/:gateway', verifyPaymentCallback, handlePaymentCallback);
router.get('/status/:orderId', authenticateJWT, getPaymentStatus);

// not logged in
router.post('/process', processPayment); 
router.get('/status/:orderId/:token', getPaymentStatus);

export default router;