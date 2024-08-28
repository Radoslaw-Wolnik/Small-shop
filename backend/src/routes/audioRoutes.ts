//src/routes/audioRoutes.ts
import express, { Router } from 'express';
import { authenticateAdmin, authenticateToken } from '../middleware/auth.js';
import {
  getMainPageSamples,
  getUserSamples,
  
  saveAudioSampleWithIcon,
  saveAudioSample,
  updateAudioSample,
  deleteAudioSample
} from '../controllers/audioController.js';

import { uploadAudioAndIcon } from '../middleware/uploadCombined';
import { uploadAudio } from '../middleware/upload.js';

const router: Router = express.Router();

router.get('/main-samples', getMainPageSamples);
router.get('/my-samples', authenticateToken, getUserSamples);

router.post('/audio-sample-with-icon', authenticateToken, uploadAudioAndIcon, saveAudioSampleWithIcon);
router.post('/audio-sample', authenticateToken, uploadAudio, saveAudioSample);

router.put('/audio-sample/:id', authenticateToken, updateAudioSample);

router.delete('/audio-sample/:id', authenticateToken, deleteAudioSample);

// Admin routes
router.post('/default-audio-sample-with-icon', authenticateAdmin, uploadAudioAndIcon, saveAudioSampleWithIcon);
router.post('/default-audio-sample', authenticateAdmin, uploadAudio, saveAudioSample);
router.delete('/default-audio-sample/:id', authenticateAdmin, deleteAudioSample);

export default router;