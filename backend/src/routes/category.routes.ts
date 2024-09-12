// src/routes/category.routes.ts
import express from 'express';
import { createCategory, updateCategory, deleteCategory, getCategories } from '../controllers/category.controller';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticateJWT, isOwner, createCategory);
router.get('/', getCategories);
router.put('/:id', authenticateJWT, isOwner, updateCategory);
router.delete('/:id', authenticateJWT, isOwner, deleteCategory);

export default router;