import express from 'express';
import { getSiteSettings, updateSiteSettings, updateSEOSettings, updateSocialMediaLinks, updateLogo } from '../controllers/site-settings.controller';
import { authenticateJWT, isAdmin } from '../middleware/auth.middleware';


const router = express.Router();

router.get('/', getSiteSettings);
router.put('/', authenticateJWT, isAdmin, updateSiteSettings);
router.put('/seo', authenticateJWT, isAdmin, updateSEOSettings);
router.put('/social', authenticateJWT, isAdmin, updateSocialMediaLinks);
router.put('/logo', authenticateJWT, isAdmin, updateLogo);

export default router;