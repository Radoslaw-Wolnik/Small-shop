// src/routes/owner.routes.ts
import express from 'express';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';
import {
  createProductTemplate,
  createCategory,
  addTag,
  removeTag,
  getOrders,
  updateOrderStatus
} from '../controllers/owner.controller';

const router = express.Router();

// Ensure all routes are protected and require owner privileges
router.use(authenticateJWT, isOwner);

router.post('/product-template', createProductTemplate);
router.post('/category', createCategory);
router.post('/tag', addTag);
router.delete('/tag', removeTag);
router.get('/orders', getOrders);
router.put('/order/:orderId/status', updateOrderStatus);

// Add more owner routes as needed

export default router;