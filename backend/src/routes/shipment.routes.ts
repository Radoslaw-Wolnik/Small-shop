// src/routes/shipping.routes.ts
import express from 'express';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';
import {
  generateShippingLabel,
  trackShipment,
  updateShippingStatus
} from '../controllers/shipment.controller';

const router = express.Router();

router.post('/generate-label/:orderId', authenticateJWT, isOwner, generateShippingLabel); // fix to use orderId
router.get('/track/:orderId', authenticateJWT, trackShipment);
router.put('/status/:orderId', authenticateJWT, isOwner, updateShippingStatus);

router.get('/:trackingNumber', getShipmentTracking); // ? idk if its better then the track/:orderid or just idf tracking is outside our website

export default router;
