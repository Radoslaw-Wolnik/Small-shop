import express, { Router } from 'express';
import { authenticateAdmin, authenticateToken } from '../middleware/auth.js';
import { 
  saveIconToStorage,
  updateIcon
} from "../controllers/iconController.js";
import { uploadIcon } from '../middleware/upload.js';

const router: Router = express.Router();

router.post('/upload-icon', authenticateToken, uploadIcon, saveIconToStorage);
router.post('/upload-default-icon', authenticateAdmin, uploadIcon, saveIconToStorage);

router.patch('/update-icon/:id', authenticateToken, uploadIcon, updateIcon);
router.patch('/update-default-icon/:id', authenticateAdmin, uploadIcon, updateIcon);


export default router;