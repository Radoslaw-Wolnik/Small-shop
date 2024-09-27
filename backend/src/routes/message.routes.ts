// src/routes/message.routes.ts
import express from 'express';
import { 
  createMessage, 
  getMessages, 
  markAsRead,
  addPhotosToMessage
 } from '../controllers/message.controller';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';
import { multerErrorHandler } from '../middleware/multer.middleware';
import { uploadMessagePhotos } from '../middleware/upload.middleware';

const router = express.Router();

router.post('/upload/', authenticateJWT, multerErrorHandler(uploadMessagePhotos), createMessage);
router.post('/upload/:id', authenticateJWT, multerErrorHandler(uploadMessagePhotos), addPhotosToMessage);


router.post('/', authenticateJWT, createMessage);
router.get('/', authenticateJWT, isOwner, getMessages);
router.put('/:id/read', authenticateJWT, isOwner, markAsRead);

export default router;