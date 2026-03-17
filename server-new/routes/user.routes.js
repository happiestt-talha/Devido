import express from 'express';
import {
  getUser,
  updateUser,
  deleteUser,
  subscribe,
  unsubscribe,
  likeVideo,
  dislikeVideo,
  updateChannelTheme
} from '../controllers/user.controller.js';
import { verifyUser } from '../middlewares/auth.js';
import { mongoIdValidation, userUpdateValidation } from '../middlewares/validation.js';
import { param } from 'express-validator';
import { validate } from '../middlewares/validation.js';

const router = express.Router();

// Create videoId validation
const videoIdValidation = [
  param('videoId').isMongoId().withMessage('Invalid ID format'),
  validate
];

// User CRUD
router.get('/:id', mongoIdValidation, getUser);
router.put('/:id', verifyUser, mongoIdValidation, userUpdateValidation, updateUser);
router.delete('/:id', verifyUser, mongoIdValidation, deleteUser);

// Subscriptions
router.put('/subscribe/:id', verifyUser, mongoIdValidation, subscribe);
router.put('/unsubscribe/:id', verifyUser, mongoIdValidation, unsubscribe);

// Video interactions - FIXED
router.put('/like/:videoId', verifyUser, videoIdValidation, likeVideo);
router.put('/dislike/:videoId', verifyUser, videoIdValidation, dislikeVideo);

// Channel theme
router.put('/:id/theme', verifyUser, mongoIdValidation, updateChannelTheme)

export default router;