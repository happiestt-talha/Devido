import WatchParty from '../models/WatchParty.js';
import Video from '../models/Video.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import crypto from 'crypto';

// Generate unique party code
const generateCode = () => {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Create watch party
export const createWatchParty = asyncHandler(async (req, res) => {
    const { videoId, name, description, maxParticipants } = req.body;

    // Verify video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    // Generate unique code
    let code = generateCode();
    while (await WatchParty.findOne({ code })) {
        code = generateCode();
    }

    const party = await WatchParty.create({
        hostId: req.user.id,
        videoId,
        name,
        description,
        code,
        maxParticipants: maxParticipants || 50,
        participants: [{
            userId: req.user.id,
            username: req.user.name,
            avatar: req.user.img,
        }],
    });

    res.status(201).json(new ApiResponse(201, party, 'Watch party created'));
});

// Join watch party
export const joinWatchParty = asyncHandler(async (req, res) => {
    const { code } = req.body;

    const party = await WatchParty.findOne({ code, isActive: true });

    if (!party) {
        throw new ApiError(404, 'Watch party not found');
    }

    if (party.participants.length >= party.maxParticipants) {
        throw new ApiError(400, 'Watch party is full');
    }

    // Check if already joined
    const alreadyJoined = party.participants.some(p => p.userId === req.user.id);

    if (!alreadyJoined) {
        party.participants.push({
            userId: req.user.id,
            username: req.user.name,
            avatar: req.user.img,
        });
        await party.save();
    }

    res.status(200).json(new ApiResponse(200, party, 'Joined watch party'));
});

// Leave watch party
export const leaveWatchParty = asyncHandler(async (req, res) => {
    const party = await WatchParty.findById(req.params.id);

    if (!party) {
        throw new ApiError(404, 'Watch party not found');
    }

    party.participants = party.participants.filter(p => p.userId !== req.user.id);

    // If host leaves, end party
    if (party.hostId === req.user.id) {
        party.isActive = false;
    }

    await party.save();

    res.status(200).json(new ApiResponse(200, null, 'Left watch party'));
});

// Get watch party
export const getWatchParty = asyncHandler(async (req, res) => {
    const party = await WatchParty.findById(req.params.id);

    if (!party) {
        throw new ApiError(404, 'Watch party not found');
    }

    res.status(200).json(new ApiResponse(200, party));
});

// Send chat message
export const sendMessage = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const party = await WatchParty.findById(req.params.id);

    if (!party) {
        throw new ApiError(404, 'Watch party not found');
    }

    party.messages.push({
        userId: req.user.id,
        username: req.user.name,
        message,
    });

    // Keep only last 100 messages
    if (party.messages.length > 100) {
        party.messages = party.messages.slice(-100);
    }

    await party.save();

    res.status(200).json(new ApiResponse(200, party.messages[party.messages.length - 1]));
});

// Send reaction
export const sendReaction = asyncHandler(async (req, res) => {
    const { emoji } = req.body;
    const party = await WatchParty.findById(req.params.id);

    if (!party) {
        throw new ApiError(404, 'Watch party not found');
    }

    party.reactions.push({
        userId: req.user.id,
        emoji,
    });

    // Keep only last 50 reactions
    if (party.reactions.length > 50) {
        party.reactions = party.reactions.slice(-50);
    }

    await party.save();

    res.status(200).json(new ApiResponse(200, party.reactions[party.reactions.length - 1]));
});

// Sync playback state
export const syncPlayback = asyncHandler(async (req, res) => {
    const { currentTime, isPlaying } = req.body;
    const party = await WatchParty.findById(req.params.id);

    if (!party) {
        throw new ApiError(404, 'Watch party not found');
    }

    // Only host can control playback
    if (party.hostId !== req.user.id) {
        throw new ApiError(403, 'Only host can control playback');
    }

    party.currentTime = currentTime;
    party.isPlaying = isPlaying;
    await party.save();

    res.status(200).json(new ApiResponse(200, { currentTime, isPlaying }));
});

// Get user's active parties
export const getUserParties = asyncHandler(async (req, res) => {
    const parties = await WatchParty.find({
        isActive: true,
        'participants.userId': req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, parties));
});