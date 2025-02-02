// src/routes/variant.routes.ts
import express from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { isOwner } from '../middleware/role.middleware';
import {
  getVariantDetails,
  createVariant,
  getVariants,
  updateVariant,
  deleteVariant
} from '../controllers/variant.controller';

const router = express.Router();

router.get('/:id', getVariantDetails); // for product mby not here tbh idk if needed 

router.use(authenticateJWT, isOwner);
// create-update-delete
router.post('/', createVariant);
router.put('/:id', updateVariant);
router.delete('/:id', deleteVariant);

router.get('/', getVariants);

export default router;