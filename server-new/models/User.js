import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    img: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
    },
    subscribers: {
        type: Number,
        default: 0
    },
    subscribedUsers: {
        type: [String]
    },

    fromGoogle: {
        type: Boolean,
        default: false
    },
    // NEW: Channel customization
    channelBanner: {
        type: String,
        default: '',
    },
    channelDescription: {
        type: String,
        default: '',
    },
    channelTheme: {
        primaryColor: {
            type: String,
            default: '#FF0000',
        },
        bannerPosition: {
            type: String,
            default: 'center',
        },
    },
    socialLinks: {
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' },
        website: { type: String, default: '' },
    },

},
    { timestamps: true })

export default mongoose.model("User", UserSchema)