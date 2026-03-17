import User from '../models/User.js';
import Video from '../models/Video.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(new ApiResponse(200, user));
});

export const updateUser = asyncHandler(async (req, res) => {
  // Only allow user to update their own profile
  if (req.params.id !== req.user.id) {
    throw new ApiError(403, 'You can only update your own profile');
  }

  // Don't allow password updates through this endpoint
  const { password, ...updateData } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id !== req.user.id) {
    throw new ApiError(403, 'You can only delete your own account');
  }

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Also delete all user's videos
  await Video.deleteMany({ userId: req.params.id });

  // Clear cookie
  res.clearCookie('accessToken');

  res.status(200).json(new ApiResponse(200, null, 'Account deleted successfully'));
});

export const subscribe = asyncHandler(async (req, res) => {
  const channelId = req.params.id;
  const userId = req.user.id;

  // Prevent self-subscription
  if (channelId === userId) {
    throw new ApiError(400, 'You cannot subscribe to yourself');
  }

  // Check if already subscribed
  const currentUser = await User.findById(userId);

  if (currentUser.subscribedUsers.includes(channelId)) {
    throw new ApiError(400, 'Already subscribed to this channel');
  }

  // Add to subscriber's subscribedUsers array
  await User.findByIdAndUpdate(userId, {
    $addToSet: { subscribedUsers: channelId },
  });

  // Increment channel's subscriber count
  await User.findByIdAndUpdate(channelId, {
    $inc: { subscribers: 1 },
  });

  res.status(200).json(new ApiResponse(200, null, 'Subscribed successfully'));
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const channelId = req.params.id;
  const userId = req.user.id;

  // Check if actually subscribed
  const currentUser = await User.findById(userId);

  if (!currentUser.subscribedUsers.includes(channelId)) {
    throw new ApiError(400, 'Not subscribed to this channel');
  }

  // Remove from subscriber's subscribedUsers array
  await User.findByIdAndUpdate(userId, {
    $pull: { subscribedUsers: channelId },
  });

  // Decrement channel's subscriber count
  await User.findByIdAndUpdate(channelId, {
    $inc: { subscribers: -1 },
  });

  res.status(200).json(new ApiResponse(200, null, 'Unsubscribed successfully'));
});

export const likeVideo = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  const userId = req.user.id;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  const isLiked = video.likes.includes(userId);

  if (isLiked) {
    // Unlike
    await Video.findByIdAndUpdate(videoId, {
      $pull: { likes: userId },
    });
  } else {
    // Like
    await Video.findByIdAndUpdate(videoId, {
      $addToSet: { likes: userId },
      $pull: { dislikes: userId },
    });

    // Update achievements
    const Achievement = (await import('../models/Achievement.js')).default;

    await Achievement.findOneAndUpdate(
      { userId },
      { $inc: { 'stats.likesGiven': 1 } },
      { upsert: true }
    );
  }

  res.status(200).json(new ApiResponse(200, null, isLiked ? 'Unliked' : 'Liked'));
});

export const dislikeVideo = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const videoId = req.params.videoId;

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $addToSet: { dislikes: userId },
      $pull: { likes: userId }
    },
    { new: true }
  );

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  res.status(200).json(new ApiResponse(200, {
    liked: false,
    likeCount: video.likes.length,
    dislikeCount: video.dislikes.length
  }, 'Video disliked'));
});

export const updateChannelTheme = asyncHandler(async (req, res) => {
  if (req.params.id !== req.user.id) {
    throw new ApiError(403, 'You can only update your own channel')
  }

  const { channelBanner, channelDescription, channelTheme, socialLinks } = req.body

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        channelBanner,
        channelDescription,
        channelTheme,
        socialLinks,
      },
    },
    { new: true, runValidators: true }
  ).select('-password')

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  res.status(200).json(new ApiResponse(200, user, 'Channel theme updated'))
})