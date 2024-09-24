
// src/routes/product-template.routes.ts
import express from 'express';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';
import {
  createProductTemplate,
  getProductTemplates,
  updateProductTemplate,
  deleteProductTemplate
} from '../controllers/product-template.controller';

const router = express.Router();

router.get('/', getProductTemplates);

// only for owner
router.use(authenticateJWT, isOwner);
router.post('/', createProductTemplate);
router.put('/:id', updateProductTemplate);
router.delete('/:id', deleteProductTemplate);

export default router;