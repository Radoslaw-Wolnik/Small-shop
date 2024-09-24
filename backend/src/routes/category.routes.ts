// src/routes/category.routes.ts
import express from 'express';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller';

const router = express.Router();

router.get('/', getCategories);

// only for owner routes
router.use(authenticateJWT, isOwner);
// create-update-delete
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;