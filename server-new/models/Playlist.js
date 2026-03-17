import mongoose from 'mongoose';

const PlaylistSchema = new mongoose.Schema(
    {
        userId: {
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
        videos: [{
            type: String, // Video IDs
        }],
        thumbnail: {
            type: String,
            default: '',
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
        isWatchLater: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model('Playlist', PlaylistSchema);