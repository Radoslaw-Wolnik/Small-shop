import express from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { isOwner } from '../middleware/role.middleware';
import {
    listTags,
    getTagById,
    getProductsByTag,
    createTag,
    updateTag,
    deleteTag
  } from '../controllers/tag.controller';

const router = express.Router();

router.get('/', listTags);
router.get('/:id', getTagById);
router.get('/:id/products', getProductsByTag);

// Ensure all routes are protected and require owner privileges
router.use(authenticateJWT, isOwner);
// create-update-delete
router.post('/', createTag);
router.put('/:id', updateTag);
router.delete('/:id', deleteTag);

export default router;