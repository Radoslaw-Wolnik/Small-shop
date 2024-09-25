
// src/routes/product-template.routes.ts
import express from 'express';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';
import {
  createProductTemplate,
  getProductTemplates,
  updateProductTemplate,
  deleteProductTemplate,
  getProductTemplateDetails,
  useProductTemplate,
} from '../controllers/product-template.controller';

const router = express.Router();



// only for owner
router.use(authenticateJWT, isOwner);
router.get('/', getProductTemplates);
// create-update-delete
router.post('/', createProductTemplate);
router.put('/:id', updateProductTemplate);
router.delete('/:id', deleteProductTemplate);

router.get('/:id', getProductTemplateDetails);
router.get('/use/:id', useProductTemplate);

export default router;