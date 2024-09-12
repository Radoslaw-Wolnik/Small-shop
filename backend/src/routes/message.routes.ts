// src/routes/message.routes.ts
import express from 'express';
import { createMessage, getMessages, markAsRead } from '../controllers/message.controller';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticateJWT, createMessage);
router.get('/', authenticateJWT, isOwner, getMessages);
router.put('/:id/read', authenticateJWT, isOwner, markAsRead);

export default router;