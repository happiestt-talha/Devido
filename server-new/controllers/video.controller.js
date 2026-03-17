import Video from '../models/Video.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createVideo = asyncHandler(async (req, res) => {
  const newVideo = new Video({
    userId: req.user.id,
    ...req.body,
  });

  const savedVideo = await newVideo.save();

  // Update achievements
  const Achievement = (await import('../models/Achievement.js')).default;
  const { BADGES } = await import('../utils/badges.js');

  let achievements = await Achievement.findOne({ userId: req.user.id });

  if (!achievements) {
    achievements = await Achievement.create({ userId: req.user.id });
  }

  // Increment videos uploaded
  achievements.stats.videosUploaded += 1;

  // Check for new badges
  const newBadges = [];

  Object.values(BADGES).forEach((badge) => {
    const alreadyHas = achievements.badges.some(b => b.badgeId === badge.id);

    if (!alreadyHas && badge.requirement(achievements.stats)) {
      achievements.badges.push({
        badgeId: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
      });
      achievements.points += badge.points;
      newBadges.push(badge);
    }
  });

  // Update level
  const { calculateLevel } = await import('../utils/badges.js');
  achievements.level = calculateLevel(achievements.points);

  await achievements.save();

  res.status(201).json(new ApiResponse(
    201,
    { video: savedVideo, newBadges },
    'Video uploaded successfully'
  ));
});

export const updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  // Only allow owner to update
  if (video.userId !== req.user.id) {
    throw new ApiError(403, 'You can only update your own videos');
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json(new ApiResponse(200, updatedVideo, 'Video updated successfully'));
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  // Only allow owner to delete
  if (video.userId !== req.user.id) {
    throw new ApiError(403, 'You can only delete your own videos');
  }

  await Video.findByIdAndDelete(req.params.id);

  res.status(200).json(new ApiResponse(200, null, 'Video deleted successfully'));
});

export const getVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  res.status(200).json(new ApiResponse(200, video));
});

export const addView = asyncHandler(async (req, res) => {
  const videoId = req.params.id;
  const userId = req.user?.id;

  // Create a unique identifier for this view
  // Could be userId (if logged in) or IP address
  const viewIdentifier = userId || req.ip;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  // Initialize viewedBy array if it doesn't exist
  if (!video.viewedBy) {
    video.viewedBy = [];
  }

  // Check if this user/IP already viewed in last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentView = video.viewedBy.find(
    view => view.identifier === viewIdentifier && view.timestamp > oneDayAgo
  );

  if (!recentView) {
    // Add new view
    video.viewedBy.push({
      identifier: viewIdentifier,
      timestamp: new Date(),
    });
    video.views = (video.views || 0) + 1;
    await video.save();

    // Update user achievement stats
    if (userId) {
      const Achievement = (await import('../models/Achievement.js')).default;
      await Achievement.findOneAndUpdate(
        { userId },
        { $inc: { 'stats.videosWatched': 1 } },
        { upsert: true }
      );
    }
  }

  res.status(200).json(new ApiResponse(200, { views: video.views }));
});

export const getTrending = asyncHandler(async (req, res) => {
  const videos = await Video.find()
    .sort({ views: -1 })
    .limit(40);

  res.status(200).json(new ApiResponse(200, videos));
});

export const getRandom = asyncHandler(async (req, res) => {
  const videos = await Video.aggregate([
    { $sample: { size: 40 } }
  ]);

  res.status(200).json(new ApiResponse(200, videos));
});

export const getSubscriptionVideos = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!user.subscribedUsers || user.subscribedUsers.length === 0) {
    return res.status(200).json(new ApiResponse(200, []));
  }

  const videos = await Video.find({
    userId: { $in: user.subscribedUsers }
  }).sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, videos));
});

export const getUserVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ userId: req.params.id })
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, videos));
});

export const getByTags = asyncHandler(async (req, res) => {
  const tags = req.query.tags.split(',');

  const videos = await Video.find({
    tags: { $in: tags }
  }).limit(20);

  res.status(200).json(new ApiResponse(200, videos));
});

export const search = asyncHandler(async (req, res) => {
  const query = req.query.q;

  const videos = await Video.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { desc: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } }
    ]
  }).limit(40);

  res.status(200).json(new ApiResponse(200, videos));
});
