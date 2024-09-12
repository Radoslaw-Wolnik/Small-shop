// src/routes/product.routes.ts
import express from 'express';
import { createProduct, updateProduct, deleteProduct, getProductById, getProducts } from '../controllers/product.controller';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticateJWT, isOwner, createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', authenticateJWT, isOwner, updateProduct);
router.delete('/:id', authenticateJWT, isOwner, deleteProduct);

export default router;