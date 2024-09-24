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


export default router;