import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String
    },
    imgUrl: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    tags: {
        type: [String],
        default: []
    },
    likes: {
        type: [String],
        default: []
    },
    dislikes: {
        type: [String],
        default: []
    },
    transcript: {
        text: String,
        words: [{
            text: String,
            start: Number,
            end: Number,
            confidence: Number,
        }],
        chapters: [{
            summary: String,
            headline: String,
            start: Number,
            end: Number,
        }],
        highlights: [{
            text: String,
            count: Number,
            rank: Number,
            timestamps: [{
                start: Number,
                end: Number,
            }],
        }],
        language: String,
        generatedAt: Date,
    }
},
    { timestamps: true })

export default mongoose.model("Video", VideoSchema)