import express, { Router } from 'express';
import { getUserOwnProfile, saveProfilePicture, addToWishlist, removeFromWishlist, updateProfile} from '../controllers/user.controller.js';
import  { authenticateJWT } from '../middleware/auth.middleware.js';
import { uploadProfilePicture } from '../middleware/upload.middleware.js';
import { multerErrorHandler } from '../middleware/multer.middleware.js';

const router: Router = express.Router();

// only for logged-in users
router.use(authenticateJWT);

router.get('/me', getUserOwnProfile);
router.put('/upload-profile-picture', multerErrorHandler(uploadProfilePicture), saveProfilePicture);

router.put('/profile', updateProfile);
router.post('/wishlist', addToWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);

router.post('/shipping-info', ddShippingInfo);
router.put('/shipping-info/:id', updateShippingInfo);

router.delete('/me/:token', dactivateMyAccount)
// im not sure if to generate token to make sure if user really wants to delete his profile or not
// or better to deactivate and after a week the users profile will be deleted

export default router;
