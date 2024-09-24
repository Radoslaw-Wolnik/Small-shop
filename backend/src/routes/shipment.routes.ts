// src/routes/shipping.routes.ts
import express from 'express';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';
import {
  generateShippingLabel,
  trackShipment,
  updateShippingStatus
} from '../controllers/shipment.controller';

const router = express.Router();

router.post('/generate-label', authenticateJWT, isOwner, generateShippingLabel);
router.get('/track/:orderId', authenticateJWT, trackShipment);
router.put('/status/:orderId', authenticateJWT, isOwner, updateShippingStatus);

export default router;
