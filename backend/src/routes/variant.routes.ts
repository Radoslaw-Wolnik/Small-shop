// src/routes/variant.routes.ts
import express from 'express';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';
import {
  createVariant,
  getVariants,
  updateVariant,
  deleteVariant
} from '../controllers/variant.controller';

const router = express.Router();

router.get('/', getVariants);
router.use(authenticateJWT, isOwner);
router.post('/', createVariant);
router.put('/:id', updateVariant);
router.delete('/:id', deleteVariant);

export default router;