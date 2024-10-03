import express from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { isOwner } from '../middleware/role.middleware';
import {
    validatePromotion,
    applyPromotion,

    createPromotion,
    updatePromotion,
    deletePromotion,
    listPromotions
  } from '../controllers/promotion.controller';

const router = express.Router();

router.get('/validate/:code', validatePromotion);
router.post('/apply', authenticateJWT, applyPromotion);

// Ensure all routes are protected and require owner privileges
router.use(authenticateJWT, isOwner);
// create-update-delete
router.post('/', createPromotion);
router.put('/:id', updatePromotion);
router.delete('/:id', deletePromotion);

router.get('/', listPromotions);

export default router;