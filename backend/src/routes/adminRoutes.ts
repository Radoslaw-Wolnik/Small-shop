// routes/adminRoutes.ts
import express, { Router } from 'express';
import { getAdmins, deleteAdmin, addAdmin } from '../controllers/adminController';
import { authenticateAdmin } from '../middleware/auth';

const router: Router = express.Router();

router.get('/users', authenticateAdmin, getAdmins);
router.delete('/users/:id', authenticateAdmin, deleteAdmin);
router.post('/users', authenticateAdmin, addAdmin);

export default router;