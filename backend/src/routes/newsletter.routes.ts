// src/routes/newsletter.routes.ts
import express from 'express';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';
import {
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
  scheduleNewsletter,
  sendNewsletter,
  getSubscribers
} from '../controllers/newsletter.controller';

const router = express.Router();

// Ensure all routes are protected and require owner privileges
router.use(authenticateJWT, isOwner);

// create-update-delete
router.post('/', createNewsletter);
router.put('/:id', updateNewsletter);
router.delete('/:id', deleteNewsletter);

router.put('/:id/schedule', scheduleNewsletter);
router.post('/:id/send', sendNewsletter);
router.get('/subscribers', getSubscribers);

export default router;
