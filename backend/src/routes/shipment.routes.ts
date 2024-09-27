// src/routes/shipping.routes.ts
import express from 'express';
import { authenticateJWT, handleAnonymousAuth } from '../middleware/auth.middleware';
import { isOwner } from '../middleware/role.middleware';
import {
  generateShippingLabel,
  trackShipment,
  updateShippingStatus,
} from '../controllers/shipment.controller';

const router = express.Router();

router.get('/track/:orderId/:token', handleAnonymousAuth, trackShipment);

// Ensure all routes are protected and require login
router.use(authenticateJWT);
router.get('/track/:orderId', trackShipment);

// routes only for owner
router.use(isOwner);
router.post('/generate-label/:orderId', generateShippingLabel);
router.put('/status/:orderId', updateShippingStatus);

export default router;
