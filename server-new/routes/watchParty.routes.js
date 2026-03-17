import express from 'express';
import {
    createWatchParty,
    joinWatchParty,
    leaveWatchParty,
    getWatchParty,
    sendMessage,
    sendReaction,
    syncPlayback,
    getUserParties,
} from '../controllers/watchParty.controller.js';
import { verifyUser } from '../middlewares/auth.js';
import { mongoIdValidation } from '../middlewares/validation.js';

const router = express.Router();

router.post('/', verifyUser, createWatchParty);
router.post('/join', verifyUser, joinWatchParty);
router.post('/:id/leave', verifyUser, mongoIdValidation, leaveWatchParty);
router.get('/:id', verifyUser, mongoIdValidation, getWatchParty);
router.post('/:id/message', verifyUser, mongoIdValidation, sendMessage);
router.post('/:id/reaction', verifyUser, mongoIdValidation, sendReaction);
router.post('/:id/sync', verifyUser, mongoIdValidation, syncPlayback);
router.get('/user/active', verifyUser, getUserParties);

export default router;