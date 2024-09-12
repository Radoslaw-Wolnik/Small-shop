// src/routes/order.routes.ts
import express from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus } from '../controllers/order.controller';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticateJWT, createOrder);
router.get('/', authenticateJWT, isOwner, getOrders);
router.get('/:id', authenticateJWT, getOrderById);
router.put('/:id/status', authenticateJWT, isOwner, updateOrderStatus);

export default router;