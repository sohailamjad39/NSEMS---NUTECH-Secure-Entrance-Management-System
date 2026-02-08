// server/middleware/errorHandler.js
const { LOG_LEVELS } = require('../utils/logger');

/**
 * Centralized Error Handler
 * - Logs errors with requestId
 * - Returns consistent JSON structure
 * - Masks internal details in prod
 */
const errorHandler = (err, req, res, next) => {
  const requestId = req.headers['x-request-id'] || 'unknown';
  const ip = req.ip || req.connection.remoteAddress;

  // Log error securely
  if (err.name === 'ValidationError') {
    console.warn(`Validation error [${requestId}]`, { ip, message: err.message });
  } else {
    console.error(`Error [${requestId}]`, { ip, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined });
  }

  // Send safe response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'An error occurred. Please try again.';

  res.status(statusCode).json({
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR',
      requestId
    }
  });
};

module.exports = errorHandler;