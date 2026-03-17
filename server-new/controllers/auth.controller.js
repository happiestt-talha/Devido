import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d' // Token expires in 7 days
  });
};

// Set cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { name }] });
  if (existingUser) {
    throw new ApiError(400, 'Username or email already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  // Generate token
  const token = generateToken(user._id);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res
    .cookie('accessToken', token, cookieOptions)
    .status(201)
    .json(new ApiResponse(201, userResponse, 'Account created successfully'));
});

export const login = asyncHandler(async (req, res) => {
  const { name, password } = req.body;

  // Find user
  const user = await User.findOne({ name }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Generate token
  const token = generateToken(user._id);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res
    .cookie('accessToken', token, cookieOptions)
    .status(200)
    .json(new ApiResponse(200, userResponse, 'Login successful'));
});

export const logout = asyncHandler(async (req, res) => {
  res
    .clearCookie('accessToken')
    .status(200)
    .json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(new ApiResponse(200, user));
});

// Google OAuth (if you want to keep it)
export const googleAuth = asyncHandler(async (req, res) => {
  const { email, name, img } = req.body;

  let user = await User.findOne({ email });

  if (!user) {
    // Create new user from Google
    user = await User.create({
      name,
      email,
      img,
      fromGoogle: true
    });
  }

  const token = generateToken(user._id);

  const userResponse = user.toObject();
  delete userResponse.password;

  res
    .cookie('accessToken', token, cookieOptions)
    .status(200)
    .json(new ApiResponse(200, userResponse, 'Google authentication successful'));
});
