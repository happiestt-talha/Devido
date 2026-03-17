import Achievement from '../models/Achievement.js';
import User from '../models/User.js';
import Video from '../models/Video.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BADGES, calculateLevel, getPointsForNextLevel } from '../utils/badges.js';

// Get or create user achievements
export const getAchievements = asyncHandler(async (req, res) => {
    let achievements = await Achievement.findOne({ userId: req.user.id });

    if (!achievements) {
        achievements = await Achievement.create({ userId: req.user.id });
    }

    res.status(200).json(new ApiResponse(200, achievements));
});

// Update stats and check for new badges
export const updateStats = asyncHandler(async (req, res) => {
    const { action, value = 1 } = req.body;

    let achievements = await Achievement.findOne({ userId: req.user.id });

    if (!achievements) {
        achievements = await Achievement.create({ userId: req.user.id });
    }

    // Update stats based on action
    switch (action) {
        case 'video_watched':
            achievements.stats.videosWatched += value;
            break;
        case 'video_uploaded':
            achievements.stats.videosUploaded += value;
            break;
        case 'like_given':
            achievements.stats.likesGiven += value;
            break;
        case 'comment_posted':
            achievements.stats.commentsPosted += value;
            break;
        case 'subscriber_gained':
            achievements.stats.subscribersGained += value;
            break;
        case 'view_gained':
            achievements.stats.totalViews += value;
            break;
        case 'daily_login':
            // Check consecutive days
            const today = new Date().toDateString();
            const lastActive = achievements.stats.lastActiveDate?.toDateString();

            if (lastActive !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                if (lastActive === yesterday.toDateString()) {
                    achievements.stats.consecutiveDays += 1;
                } else {
                    achievements.stats.consecutiveDays = 1;
                }

                achievements.stats.lastActiveDate = new Date();
            }
            break;
    }

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
    achievements.level = calculateLevel(achievements.points);

    await achievements.save();

    res.status(200).json(new ApiResponse(200, {
        achievements,
        newBadges,
    }));
});

// Get leaderboard
export const getLeaderboard = asyncHandler(async (req, res) => {
    const { type = 'points', limit = 50 } = req.query;

    let sortField = 'points';
    if (type === 'level') sortField = 'level';
    if (type === 'badges') sortField = 'badges';

    const leaderboard = await Achievement.find()
        .sort({ [sortField]: -1 })
        .limit(parseInt(limit));

    // Populate user info
    const enriched = await Promise.all(
        leaderboard.map(async (achievement) => {
            const user = await User.findById(achievement.userId).select('name img');
            return {
                ...achievement.toObject(),
                user,
            };
        })
    );

    res.status(200).json(new ApiResponse(200, enriched));
});

// Get user rank
export const getUserRank = asyncHandler(async (req, res) => {
    const achievements = await Achievement.findOne({ userId: req.user.id });

    if (!achievements) {
        return res.status(200).json(new ApiResponse(200, { rank: null }));
    }

    const rank = await Achievement.countDocuments({
        points: { $gt: achievements.points },
    }) + 1;

    res.status(200).json(new ApiResponse(200, {
        rank,
        totalUsers: await Achievement.countDocuments(),
    }));
});