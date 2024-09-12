// src/routes/product-template.routes.ts
import express from 'express';
import { createTemplate, getTemplates, updateTemplate, deleteTemplate } from '../controllers/product-template.controller';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticateJWT, isOwner, createTemplate);
router.get('/', authenticateJWT, isOwner, getTemplates);
router.put('/:id', authenticateJWT, isOwner, updateTemplate);
router.delete('/:id', authenticateJWT, isOwner, deleteTemplate);

export default router;