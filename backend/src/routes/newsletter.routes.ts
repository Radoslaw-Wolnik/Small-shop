// src/routes/newsletter.routes.ts
import express from 'express';
import { createNewsletter, getNewsletters, updateNewsletter, deleteNewsletter } from '../controllers/newsletter.controller';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticateJWT, isOwner, createNewsletter);
router.get('/', authenticateJWT, isOwner, getNewsletters);
router.put('/:id', authenticateJWT, isOwner, updateNewsletter);
router.delete('/:id', authenticateJWT, isOwner, deleteNewsletter);

export default router;