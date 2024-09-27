import express, { Router } from 'express';
import { 
  getUserOwnProfile, 
  saveProfilePicture, 
  addToWishlist, 
  removeFromWishlist, 
  updateProfile,
  addShippingInfo,
  updateShippingInfo
} from '../controllers/user.controller.js';
import  { authenticateJWT } from '../middleware/auth.middleware';
import { uploadProfilePicture } from '../middleware/upload.middleware';
import { multerErrorHandler } from '../middleware/multer.middleware';

const router: Router = express.Router();

// only for logged-in users
router.use(authenticateJWT);

router.get('/me', getUserOwnProfile);
router.put('/upload-profile-picture', multerErrorHandler(uploadProfilePicture), saveProfilePicture);

router.put('/profile', updateProfile);
router.post('/wishlist', addToWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);

router.post('/shipping-info', addShippingInfo);
router.put('/shipping-info/:id', updateShippingInfo);

export default router;
