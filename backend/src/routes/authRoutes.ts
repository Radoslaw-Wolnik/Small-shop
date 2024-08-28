// src/routes/authRoutes.ts
import express, { Router } from 'express';
import { 
    register, 
    login, 
    postRegistrationLogin,
    logout, 
    refreshToken, 
    
    sendVerificationEmail, 
    verifyEmail, 
    
    changePassword,
    requestPasswordReset,
    resetPassword
} from '../controllers/authController.js';
import { authenticateToken, handlePostRegistrationAuth } from '../middleware/auth.js';

const router: Router = express.Router();

router.post('/register', register);

router.post('/login', login);
// Post-registration login route
router.post('/reg-login', handlePostRegistrationAuth, postRegistrationLogin);

router.post('/logout', authenticateToken, logout);

router.post('/refresh-token', authenticateToken, refreshToken);

router.post('/send-verification', authenticateToken, sendVerificationEmail);
router.get('/verify-email/:token', verifyEmail);

router.put('/change-password', authenticateToken, changePassword);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);

export default router;