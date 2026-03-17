import { ApiError } from '../utils/ApiError.js';

// 404 handler
export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found: ${req.originalUrl}`);
  next(error);
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose errors
  if (err.name === 'CastError') {
    error = new ApiError(400, 'Invalid ID format');
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message).join(', ');
    error = new ApiError(400, messages);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = new ApiError(400, `${field} already exists`);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Log errors in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      statusCode,
      message,
      stack: error.stack,
      errors: error.errors
    });
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};
