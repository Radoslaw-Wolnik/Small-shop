import express, { Router } from 'express';
import { getUserOwnProfile, saveProfilePicture, addToWishlist, removeFromWishlist, updateProfile} from '../controllers/user.controller.js';
import  { authenticateJWT } from '../middleware/auth.middleware.js';
import { uploadProfilePicture } from '../middleware/upload.middleware.js';
import { multerErrorHandler } from '../middleware/multer.middleware.js';

const router: Router = express.Router();

router.get('/me', authenticateJWT, getUserOwnProfile);
router.put('/upload-profile-picture', authenticateJWT, multerErrorHandler(uploadProfilePicture), saveProfilePicture);

router.put('/profile', authenticateJWT, updateProfile);
router.post('/wishlist', authenticateJWT, addToWishlist);
router.delete('/wishlist/:productId', authenticateJWT, removeFromWishlist);


export default router;
