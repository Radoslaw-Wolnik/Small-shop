
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
  getProductDetails,
  getProductsByTags,
  getProductsByCategory,
  getProductsByTagsAndCategory,

  addTag,
  removeTag,

  updateVariantPhotos,
  saveProductPhotos
} from '../controllers/product.controller';
import { uploadProductPhotos, } from '../middleware/upload.middleware';
import { multerErrorHandler } from '../middleware/multer.middleware';

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
router.put('/:productId/variant-photos', updateVariantPhotos); // idk
// photos
router.post('/products/:productId/photos', multerErrorHandler(uploadProductPhotos), saveProductPhotos);

// tags
router.post('/:productId/add', addTag);
router.delete('/:productId/remove', removeTag);

export default router;