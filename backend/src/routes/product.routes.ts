
// src/routes/product.routes.ts (update only the relevant part)
import express from 'express';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  addVariant,
  updateInventory,
  updateShippingDetails,
  getProducts,
  getProductById,
  updateVariantPhotos
} from '../controllers/product.controller';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes (owner only)
router.use(authenticateJWT, isOwner);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

router.post('/:productId/variants', addVariant);
router.put('/:productId/inventory', updateInventory);
router.put('/:productId/shipping', updateShippingDetails);
router.put('/:productId/variant-photos', updateVariantPhotos);


export default router;