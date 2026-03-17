import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

export const verifyUser = (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new ApiError(401, "Authentication required. Please login.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, "Invalid token. Please login again."));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, "Session expired. Please login again."));
    }
    next(error);
  }
};

// Optional auth - doesn't fail if no token
export const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id };
    }
    next();
  } catch (error) {
    // Silently continue without auth
    next();
  }
};
