// src/routes/shipping.routes.ts
import express from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { isOwner } from '../middleware/role.middleware';
import {
  generateShippingLabel,
  trackShipment,
  updateShippingStatus,
  getShipmentTracking,
} from '../controllers/shipment.controller';

const router = express.Router();

router.get('/:token/:trackingNumber', getShipmentTracking);

// Ensure all routes are protected and require login
router.use(authenticateJWT);
router.get('/track/:orderId', trackShipment);
router.get('/:trackingNumber', getShipmentTracking);

router.post('/generate-label/:orderId', isOwner, generateShippingLabel); // fix to use orderId
router.put('/status/:orderId', isOwner, updateShippingStatus);

export default router;
