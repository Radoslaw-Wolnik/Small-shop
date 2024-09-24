// src/routes/order.routes.ts
import express from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus } from '../controllers/order.controller';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';

const router = express.Router();

// not logged in new order
router.post('/anon/', createOrder);
// token from email for not logged in
router.get('/:orderId/:token', getOrderdetails);
router.put('/cancel/:orderId/:token', cancelOrder);
router.put('/received/:orderId/:token', authenticateJWT, markOrderAsReceived);


// Ensure all routes are protected and require user privileges
router.use(authenticateJWT);
router.post('/', createOrder);
router.get('/:id', getOrderDetails);
router.put('/:orderId/cancel', cancelOrder);
router.put('/:orderId/received', markOrderAsReceived);
router.get('/', getUserOrderHistory);


// Ensure all routes are protected and require owner privileges
router.use(isOwner);
router.get('/', getOrders);
router.put('/:id/status', updateOrderStatus);
router.put('/:orderId/deny', denyOrder);
router.get('/statistics', getOrderStatistics);
router.get('/search', searchOrders);


export default router;