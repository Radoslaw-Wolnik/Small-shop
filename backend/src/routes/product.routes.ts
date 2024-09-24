
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
router.get('/tags', getProductsByTags);
router.get('/category', getProductsByCategory);
router.get('/category/tags', getProductsByTagsAndCategory);
router.get('/:id', getProductDetails); // prev getProductById

// Protected routes (owner only)
router.use(authenticateJWT, isOwner);
// create - update - delete
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// variants
router.post('/:productId/variants', addVariant);
router.put('/:productId/inventory', updateInventory);
router.put('/:productId/shipping', updateShippingDetails);
router.put('/:productId/variant-photos', updateVariantPhotos);
// photos
router.post('/products/:productId/photos', upload.array('photos'), uploadProductPhotos);

// tags
router.post('/:productId/add', addTag);
router.delete('/:productId/remove', removeTag);

export default router;