import Comment from '../models/Comments.js';
import Video from '../models/Video.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const addComment = asyncHandler(async (req, res) => {
  const { desc, videoId } = req.body;

  // Verify video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  const comment = await Comment.create({
    userId: req.user.id,
    videoId,
    desc
  });

  // Populate user info before sending response
  await comment.populate('userId', 'name img');

  // Update achievements
  const Achievement = (await import('../models/Achievement.js')).default;

  await Achievement.findOneAndUpdate(
    { userId: req.user.id },
    { $inc: { 'stats.commentsPosted': 1 } },
    { upsert: true }
  );

  res.status(201).json(new ApiResponse(201, comment, 'Comment added successfully'));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  // Allow deletion if: user is comment owner OR video owner
  const video = await Video.findById(comment.videoId);

  if (comment.userId !== req.user.id && video.userId !== req.user.id) {
    throw new ApiError(403, 'You can only delete your own comments');
  }

  await Comment.findByIdAndDelete(req.params.id);

  res.status(200).json(new ApiResponse(200, null, 'Comment deleted successfully'));
});

export const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ videoId: req.params.videoId })
    .populate('userId', 'name img')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, comments));
});

export const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  // Only allow owner to update
  if (comment.userId !== req.user.id) {
    throw new ApiError(403, 'You can only update your own comments');
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    req.params.id,
    { $set: { desc: req.body.desc } },
    { new: true }
  ).populate('userId', 'name img');

  res.status(200).json(new ApiResponse(200, updatedComment, 'Comment updated successfully'));
});

export const addReaction = asyncHandler(async (req, res) => {
  const { emoji } = req.body
  const comment = await Comment.findById(req.params.id)

  if (!comment) {
    throw new ApiError(404, 'Comment not found')
  }

  // Initialize reactions object if it doesn't exist
  if (!comment.reactions) {
    comment.reactions = new Map()
  }

  // Convert to plain object for manipulation
  const reactions = comment.reactions instanceof Map
    ? Object.fromEntries(comment.reactions)
    : comment.reactions || {}

  // Increment reaction count
  reactions[emoji] = (reactions[emoji] || 0) + 1

  comment.reactions = reactions
  await comment.save()

  res.status(200).json(new ApiResponse(200, comment))
})