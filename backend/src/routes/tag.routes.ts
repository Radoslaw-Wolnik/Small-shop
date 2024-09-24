import express from 'express';
import { authenticateJWT, isOwner } from '../middleware/auth.middleware';


const router = express.Router();

router.get('/', listTags);

// Ensure all routes are protected and require owner privileges
router.use(authenticateJWT, isOwner);
// create-update-delete
router.post('/', createTag);
router.put('/:id', updateTag);
router.delete('/:id', deleteTag);

export default router;