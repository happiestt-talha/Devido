import express from 'express';
import {
  addComment,
  deleteComment,
  getComments,
  updateComment,
  addReaction
} from '../controllers/comment.controller.js';
import { verifyUser } from '../middlewares/auth.js';
import { commentValidation, mongoIdValidation } from '../middlewares/validation.js';
import { param } from 'express-validator';
import { validate } from '../middlewares/validation.js';

const router = express.Router();

// Create custom validation for videoId
const videoIdValidation = [
  param('videoId').isMongoId().withMessage('Invalid ID format'),
  validate
];

router.post('/', verifyUser, commentValidation, addComment);
router.get('/:videoId', videoIdValidation, getComments);  // ← Fixed this line
router.put('/:id', verifyUser, mongoIdValidation, updateComment);
router.delete('/:id', verifyUser, mongoIdValidation, deleteComment);
router.post('/:id/react', verifyUser, addReaction)

export default router;