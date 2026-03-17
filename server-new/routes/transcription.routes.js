import express from 'express';
import {
    generateTranscript,
    getTranscript,
    searchTranscript,
} from '../controllers/transcription.controller.js';
import { verifyUser } from '../middlewares/auth.js';
import { mongoIdValidation } from '../middlewares/validation.js';

const router = express.Router();

router.post('/generate', verifyUser, generateTranscript);
router.get('/:videoId', getTranscript);
router.get('/:videoId/search', searchTranscript);

export default router;