import express, { Router } from 'express';
import { 
  getUserOwnProfile, 

  saveProfilePicture,
} from '../controllers/userController.js';
import  { authenticateToken } from '../middleware/auth.js';
import { uploadProfilePicture } from '../middleware/upload';


const router: Router = express.Router();

// it first executes authenticateToken then getUserProfile so in auth we decode the token to id of user
router.get('/me', authenticateToken, getUserOwnProfile);

//router.put('/upload-profile-picture', authenticateToken, upload.single('profilePicture'), saveProfilePicture);
router.put('/upload-profile-picture', authenticateToken, uploadProfilePicture, saveProfilePicture);



export default router;
