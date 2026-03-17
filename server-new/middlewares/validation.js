import { body, param, query, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    throw new ApiError(400, errorMessages);
  }
  next();
};

// Auth validations
export const signupValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Name must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Name can only contain letters, numbers and underscores'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email required')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  validate
];

export const loginValidation = [
  body('name').trim().notEmpty().withMessage('Username required'),
  body('password').notEmpty().withMessage('Password required'),
  validate
];

// Video validations
export const videoValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be 3-100 characters'),
  
  body('desc')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description too long'),
  
  body('imgUrl')
    .optional()
    .isURL()
    .withMessage('Valid thumbnail URL required'),
  
  body('videoUrl')
    .optional()
    .isURL()
    .withMessage('Valid video URL required'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  validate
];

// Comment validation
export const commentValidation = [
  body('desc')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be 1-1000 characters'),
  
  body('videoId')
    .isMongoId()
    .withMessage('Valid video ID required'),
  
  validate
];

// User update validation
export const userUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Name must be 3-30 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email required'),
  
  body('img')
    .optional()
    .isURL()
    .withMessage('Valid image URL required'),
  
  validate
];

// MongoDB ID validation
export const mongoIdValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate
];

// Search validation
export const searchValidation = [
  query('q')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be 1-100 characters'),
  validate
];
