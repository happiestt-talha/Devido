import express from 'express';
import {
  signup,
  login,
  logout,
  getCurrentUser,
  googleAuth
} from '../controllers/auth.controller.js';
import { verifyUser } from '../middlewares/auth.js';
import { signupValidation, loginValidation } from '../middlewares/validation.js';

const router = express.Router();

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.get('/me', verifyUser, getCurrentUser);
router.post('/google', googleAuth);

export default router;
