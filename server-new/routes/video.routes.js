import express from 'express';
import {
  createVideo,
  updateVideo,
  deleteVideo,
  getVideo,
  addView,
  getTrending,
  getRandom,
  getSubscriptionVideos,
  getUserVideos,
  getByTags,
  search
} from '../controllers/video.controller.js';
import { verifyUser, optionalAuth } from '../middlewares/auth.js';
import { mongoIdValidation, videoValidation, searchValidation } from '../middlewares/validation.js';

const router = express.Router();

// Video CRUD
router.post('/', verifyUser, videoValidation, createVideo);
router.put('/:id', verifyUser, mongoIdValidation, videoValidation, updateVideo);
router.delete('/:id', verifyUser, mongoIdValidation, deleteVideo);
router.get('/:id', mongoIdValidation, getVideo);

// Video discovery
router.get('/feed/trending', getTrending);
router.get('/feed/random', getRandom);
router.get('/feed/subscriptions', verifyUser, getSubscriptionVideos);

// User videos
router.get('/user/:id', mongoIdValidation, getUserVideos);

// Search & filter
router.get('/search/query', searchValidation, search);
router.get('/search/tags', getByTags);

// Views
router.put('/view/:id', optionalAuth, mongoIdValidation, addView);

export default router;
