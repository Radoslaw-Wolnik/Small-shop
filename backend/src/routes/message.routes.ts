// src/routes/message.routes.ts
import express from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { isOwner } from '../middleware/role.middleware';
import { multerErrorHandler } from '../middleware/multer.middleware';
import { uploadMessagePhotos } from '../middleware/upload.middleware';
import { 
  createMessage, 
  getMessages, 
  markAsRead,
  addPhotosToMessage
 } from '../controllers/message.controller';


const router = express.Router();

router.post('/upload/', authenticateJWT, multerErrorHandler(uploadMessagePhotos), createMessage);
router.post('/upload/:id', authenticateJWT, multerErrorHandler(uploadMessagePhotos), addPhotosToMessage);


router.post('/', authenticateJWT, createMessage);
router.get('/', authenticateJWT, isOwner, getMessages);
router.put('/:id/read', authenticateJWT, isOwner, markAsRead);

export default router;