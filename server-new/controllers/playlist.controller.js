import Playlist from '../models/Playlist.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, isPublic } = req.body;

    const playlist = await Playlist.create({
        userId: req.user.id,
        name,
        description,
        isPublic,
    });

    res.status(201).json(new ApiResponse(201, playlist, 'Playlist created'));
});

export const getUserPlaylists = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user.id;

    // If viewing others' playlists, only show public ones
    const filter = userId === req.user.id
        ? { userId }
        : { userId, isPublic: true };

    const playlists = await Playlist.find(filter).sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, playlists));
});

export const getPlaylist = asyncHandler(async (req, res) => {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }

    // Check privacy
    if (!playlist.isPublic && playlist.userId !== req.user.id) {
        throw new ApiError(403, 'This playlist is private');
    }

    res.status(200).json(new ApiResponse(200, playlist));
});

export const updatePlaylist = asyncHandler(async (req, res) => {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }

    if (playlist.userId !== req.user.id) {
        throw new ApiError(403, 'You can only update your own playlists');
    }

    const updated = await Playlist.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
    );

    res.status(200).json(new ApiResponse(200, updated, 'Playlist updated'));
});

export const deletePlaylist = asyncHandler(async (req, res) => {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }

    if (playlist.userId !== req.user.id) {
        throw new ApiError(403, 'You can only delete your own playlists');
    }

    await Playlist.findByIdAndDelete(req.params.id);

    res.status(200).json(new ApiResponse(200, null, 'Playlist deleted'));
});

export const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { videoId } = req.body;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }

    if (playlist.userId !== req.user.id) {
        throw new ApiError(403, 'You can only modify your own playlists');
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, 'Video already in playlist');
    }

    playlist.videos.push(videoId);
    await playlist.save();

    res.status(200).json(new ApiResponse(200, playlist, 'Video added to playlist'));
});

export const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }

    if (playlist.userId !== req.user.id) {
        throw new ApiError(403, 'You can only modify your own playlists');
    }

    playlist.videos = playlist.videos.filter(id => id !== videoId);
    await playlist.save();

    res.status(200).json(new ApiResponse(200, playlist, 'Video removed from playlist'));
});

export const getWatchLater = asyncHandler(async (req, res) => {
    let watchLater = await Playlist.findOne({
        userId: req.user.id,
        isWatchLater: true,
    });

    // Create Watch Later playlist if it doesn't exist
    if (!watchLater) {
        watchLater = await Playlist.create({
            userId: req.user.id,
            name: 'Watch Later',
            isWatchLater: true,
            isPublic: false,
        });
    }

    res.status(200).json(new ApiResponse(200, watchLater));
});