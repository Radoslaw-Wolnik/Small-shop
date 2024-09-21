// src/routes/newsletter.routes.ts
import express from 'express';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';
import {
  createNewsletter,
  updateNewsletter,
  scheduleNewsletter,
  sendNewsletter,
  getSubscribers
} from '../controllers/newsletter.controller';

const router = express.Router();

// Ensure all routes are protected and require owner privileges
router.use(authenticateJWT, isOwner);

router.post('/', createNewsletter);
router.put('/:id', updateNewsletter);
router.put('/:id/schedule', scheduleNewsletter);
router.post('/:id/send', sendNewsletter);
router.get('/subscribers', getSubscribers);

export default router;
