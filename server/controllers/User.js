import { createError } from '../error/error.js'
import User from '../models/User.js'
import Video from '../models/Video.js'
let success = false
export const userTest = async (req, res, next) => {
    try {
        res.json({ msg: "User test", body: req.body })
        console.log('User test')
        console.log('Req body: ', req.body)
    }
    catch (err) {
        next(createError(404, "Test Failed"))
    }
}

export const updateUser = async (req, res, next) => {
    try {
        if (req.params.id === req.user.id) {

            const user = await User.findByIdAndUpdate(req.params.id,
                { $set: req.body },
                { new: true })
            success = true

            res.status(200).json({ success, ...user._doc })
        } else {
            next(createError(403, "You can update only your account"))
        }

    } catch (error) {
        next(createError(404, error.message))
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        if (req.params.id === req.user.id) {

            const user = await User.findByIdAndDelete(req.params.id)
            success = true

            res.status(200).json({ success, ...user._doc })
        } else {
            next(createError(403, "You can Delete only your account"))
        }

    } catch (error) {
        next(createError(404, error.message))
    }
}

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        success = true

        res.status(200).json({ success, ...user._doc })
    } catch (err) {
        next(createError(404, err.message))
    }
}

export const subscribeUser = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            $push: { subscribedUsers: req.params.id }
        })
        await User.findByIdAndUpdate(req.params.id, {
            $inc: { subscribers: 1 }
        })
        res.json("Subscription successful   s")
    } catch (err) {
        next(createError(404, err.message))
    }
}

export const unsubscribeUser = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { subscribedUsers: req.params.id }
        })
        await User.findByIdAndUpdate(req.params.id, {
            $inc: { subscribers: -1 }
        })
        res.json("Unsubscription successful")
    } catch (err) {
        next(createError(404, err.message))
    }
}

export const likeVideo = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const videoId = req.params.videoId;

        const user = await User.findById(userId);
        if (!user) {
            return next(createError(404, 'User not found'));
        }

        const video = await Video.findById(videoId);
        if (!video) {
            return next(createError(404, 'Video not found'));
        }

        await Video.findByIdAndUpdate(videoId, {
            $addToSet: { likes: userId },
            $pull: { dislikes: userId }
        })

        res.status(200).json("The video has been liked")
    } catch (err) {
        next(createError(403, err.message))
    }
}

export const dislikeVideo = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const videoId = req.params.videoId;

        const user = await User.findById(userId);
        if (!user) {
            return next(createError(404, 'User not found'));
        }

        const video = await Video.findById(videoId);
        if (!video) {
            return next(createError(404, 'Video not found'));
        }

        await Video.findByIdAndUpdate(videoId, {
            $addToSet: { dislikes: userId },
            $pull: { likes: userId }
        })

        res.status(200).json("The video has been disiked")
    } catch (err) {
        next(createError(403, err.message))
    }
}