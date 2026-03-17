import express from 'express';
import {
    getAchievements,
    updateStats,
    getLeaderboard,
    getUserRank,
} from '../controllers/achievement.controller.js';
import { verifyUser } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', verifyUser, getAchievements);
router.post('/stats', verifyUser, updateStats);
router.get('/leaderboard', getLeaderboard);
router.get('/rank', verifyUser, getUserRank);

export default router;