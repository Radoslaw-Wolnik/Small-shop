// routes/adminRoutes.ts
import express, { Router } from 'express';
import { authenticateJWT, isAdmin } from '../middleware/auth.middleware';
import {
  getAdmins,
  getAllUsers,
  deleteAdmin,
  addAdmin,
  updateEmailTemplate,
  deleteProduct
} from '../controllers/admin.controller';

const router: Router = express.Router();

// Ensure all routes are protected and require admin privileges
router.use(authenticateJWT, isAdmin);

router.get('/admins', getAdmins);
router.get('/users', getAllUsers);

router.delete('/admin/:id', deleteAdmin);
router.post('/add', addAdmin);

router.put('/email-template/:id', updateEmailTemplate);
router.delete('/product/:id', deleteProduct);

export default router;