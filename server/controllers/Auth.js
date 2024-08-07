import mongoose from 'mongoose'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { createError } from '../error/error.js'
let success = false

const JWT_ACCESS_KEY = '1ffb1d01c12d993ad7afa2144d6af34ae2d6eeaa6f'
const authKey = 'qwedcsdbcidisjkcnb'

export const authTest = (req, res) => {
    res.send("Auth test")
    console.log('Auth test')
    console.log('Req body: ', req.body)
}

export const signup = async (req, res, next) => {
    try {

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(req.body.password, salt)
        const newUser = new User({ ...req.body, password: hash })
        await newUser.save()
        success = true
        const token = jwt.sign({ id: newUser._id }, authKey)
        res
            .cookie("accessToken", token, {
                httpOnly: true
            })
            .status(200)
            .json({ success, ...newUser._doc })
    } catch (err) {
        next(err)
    }
}

export const login = async (req, res, next) => {
    try {

        const user = await User.findOne({ name: req.body.name })
        if (!user) return next(createError(404, "User not found"))

        const isPasswordCorrect = bcrypt.compare(req.body.password, user.password)
        if (!isPasswordCorrect) return next(createError(401, "Illegal credentials"))

        // const token = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_KEY)
        // const token = jwt.sign({ id: user._id }, JWT_ACCESS_KEY)
        const token = jwt.sign({ id: user._id }, authKey)
        const { password, ...others } = user._doc
        success = true

        res
            .cookie("accessToken", token, {
                httpOnly: true
            })
            .status(200)
            .json({ success, ...others })
    } catch (err) {
        next(createError(401, err.message))
    }
}

export const googleAuth = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        console.log("user: ", user)
        if (user) {
            const token = jwt.sign({ id: user._id }, authKey);

            res
                .cookie("accessToken", token, {
                    httpOnly: true,
                })
                .status(200)
                .json(user._doc);
        } else {
            const newUser = new User({
                ...req.body,
                fromGoogle: true,
            });
            console.log("newUser: ", newUser)
            const savedUser = await newUser.save();
            console.log("savedUser: ", savedUser)
            const token = jwt.sign({ id: savedUser._id }, authKey);
            res
                .cookie("accessToken", token, {
                    httpOnly: true,
                })
                .status(200)
                .json(savedUser._doc);
        }
    } catch (err) {
        next(err);
    }
};