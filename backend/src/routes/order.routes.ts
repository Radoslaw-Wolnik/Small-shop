// src/routes/order.routes.ts
import express from 'express';
import { authenticateJWT, handleAnonymousAuth } from '../middleware/auth.middleware';
import { isOwner } from '../middleware/role.middleware';
import { 
  createOrder, 
  getOrders, 
  getOrderDetails, 
  updateOrderStatus,
  cancelOrder,
  markOrderAsReceived,
  getUserOrderHistory,
  denyOrder,
  getOrderStatistics,
  searchOrders,
 } from '../controllers/order.controller';


const router = express.Router();

// not logged in new order
router.post('/', createOrder);
// token from email for not logged in
router.get('/:id/:token', handleAnonymousAuth, getOrderDetails);
router.put('/:id/cancel/:token', handleAnonymousAuth, cancelOrder);
router.put('/:id/recived/:token', handleAnonymousAuth, markOrderAsReceived);


// Ensure all routes are protected and require user privileges
router.use(authenticateJWT);
router.post('/', createOrder);
router.get('/:id', getOrderDetails);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/received', markOrderAsReceived);
router.get('/', getUserOrderHistory);


// Ensure all routes are protected and require owner privileges
router.use(isOwner);
router.get('/', getOrders);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/deny', denyOrder);
router.get('/statistics', getOrderStatistics);
router.get('/search', searchOrders);


export default router;