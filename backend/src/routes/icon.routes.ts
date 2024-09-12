import express, { Router } from 'express';
import { authenticateAdmin, authenticateToken } from '../middleware/auth.middleware.js';
import { 
  saveIconToStorage,
  updateIcon
} from "../controllers/icon.controller.js";
import { uploadIcon } from '../middleware/upload.middleware.js';
import { multerErrorHandler } from '../middleware/multer.middleware.js';

const router: Router = express.Router();

router.post('/upload', authenticateToken, multerErrorHandler(uploadIcon), saveIconToStorage);
router.post('/upload-default', authenticateAdmin, multerErrorHandler(uploadIcon), saveIconToStorage);

router.patch('/update/:id', authenticateToken, multerErrorHandler(uploadIcon), updateIcon);
router.patch('/update-default/:id', authenticateAdmin, multerErrorHandler(uploadIcon), updateIcon);


export default router;