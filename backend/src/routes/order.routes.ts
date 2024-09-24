// src/routes/order.routes.ts
import express from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus } from '../controllers/order.controller';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticateJWT, createOrder);
router.get('/', authenticateJWT, isOwner, getOrders);
router.get('/:id', authenticateJWT, getOrderById);
router.put('/:id/status', authenticateJWT, isOwner, updateOrderStatus);

// Route for creating a dispute by logged in user
router.post('/dispute', authenticateJWT, createDispute);
// Then i want route to create dispiute to specific order by not logged in user using magic ling 
// (in link there will be a token or sth like that valid for 14days since recived)
// or valid until server switches it to invalid (based on shipment status automaticly or sth like that)
// router.post('/:orderID/:token/dispiute', createDispiute) or sth like that

// Route for updating dispute status (owner only)
router.put('/:orderId/dispute', authenticateJWT, isOwner, updateDisputeStatus);

// Route for generating shipping label (owner only)
router.post('/:orderId/shipping-label', authenticateJWT, isOwner, generateShippingLabel);

export default router;