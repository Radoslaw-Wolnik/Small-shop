import express from 'express';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';


const router = express.Router();

// Ensure all routes are protected and require owner privileges
router.use(authenticateJWT, isOwner);
// create-update-delete
router.post('/', createPromotion);
router.put('/:id', updatePromotion);
router.delete('/:id', deletePromotion);

router.get('/', listPromotions);

export default router;