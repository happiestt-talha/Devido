import mongoose from 'mongoose';

const AchievementSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        points: {
            type: Number,
            default: 0,
        },
        level: {
            type: Number,
            default: 1,
        },
        badges: [{
            badgeId: String,
            name: String,
            description: String,
            icon: String,
            unlockedAt: {
                type: Date,
                default: Date.now,
            },
        }],
        stats: {
            videosWatched: { type: Number, default: 0 },
            videosUploaded: { type: Number, default: 0 },
            likesGiven: { type: Number, default: 0 },
            commentsPosted: { type: Number, default: 0 },
            subscribersGained: { type: Number, default: 0 },
            totalViews: { type: Number, default: 0 },
            consecutiveDays: { type: Number, default: 0 },
            lastActiveDate: Date,
        },
    },
    { timestamps: true }
);

export default mongoose.model('Achievement', AchievementSchema);