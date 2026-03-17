import express from 'express';
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylist,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getWatchLater,
} from '../controllers/playlist.controller.js';
import { verifyUser } from '../middlewares/auth.js';
import { mongoIdValidation } from '../middlewares/validation.js';

const router = express.Router();

router.post('/', verifyUser, createPlaylist);
router.get('/user/:userId', verifyUser, getUserPlaylists);
router.get('/watch-later', verifyUser, getWatchLater);
router.get('/:id', verifyUser, mongoIdValidation, getPlaylist);
router.put('/:id', verifyUser, mongoIdValidation, updatePlaylist);
router.delete('/:id', verifyUser, mongoIdValidation, deletePlaylist);
router.post('/:id/videos', verifyUser, mongoIdValidation, addVideoToPlaylist);
router.delete('/:id/videos/:videoId', verifyUser, mongoIdValidation, removeVideoFromPlaylist);

export default router;