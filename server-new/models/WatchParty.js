import mongoose from 'mongoose';

const WatchPartySchema = new mongoose.Schema(
    {
        hostId: {
            type: String,
            required: true,
        },
        videoId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        code: {
            type: String,
            required: true,
            unique: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        participants: [{
            userId: String,
            username: String,
            avatar: String,
            joinedAt: {
                type: Date,
                default: Date.now,
            },
        }],
        messages: [{
            userId: String,
            username: String,
            message: String,
            timestamp: {
                type: Date,
                default: Date.now,
            },
        }],
        reactions: [{
            userId: String,
            emoji: String,
            timestamp: {
                type: Date,
                default: Date.now,
            },
        }],
        currentTime: {
            type: Number,
            default: 0,
        },
        isPlaying: {
            type: Boolean,
            default: false,
        },
        maxParticipants: {
            type: Number,
            default: 50,
        },
    },
    { timestamps: true }
);

export default mongoose.model('WatchParty', WatchPartySchema);