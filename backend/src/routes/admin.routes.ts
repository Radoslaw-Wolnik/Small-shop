// routes/adminRoutes.ts
import express, { Router } from 'express';
import { getAdmins, deleteAdmin, addAdmin, getAllUsers } from '../controllers/admin.controller';
import { authenticateJWT, isAdmin } from '../middleware/auth.middleware';

const router: Router = express.Router();

router.get('/get', authenticateJWT, isAdmin, getAdmins);
router.delete('/del/:id', authenticateJWT, isAdmin, deleteAdmin);
router.post('/add', authenticateJWT, isAdmin, addAdmin);

router.get('/allusers', authenticateJWT, isAdmin, getAllUsers);

export default router;