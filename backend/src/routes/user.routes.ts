import express, { Router } from 'express';
import { 
  getUserOwnProfile, 
  saveProfilePicture, 
  addToWishlist, 
  removeFromWishlist, 
  updateProfile,
  addShippingInfo,
  updateShippingInfo,
  deactivateMyAccount,
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

router.delete('/me/:token', deactivateMyAccount)
// im not sure if to generate token to make sure if user really wants to delete his profile or not
// or better to deactivate and after a week the users profile will be deleted

export default router;
