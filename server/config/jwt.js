// server/config/jwt.js
const jwt = require('jsonwebtoken');
const { JWT_EXPIRES_IN, JWT_SECRET } = require('./constants');

/**
 * JWT Service
 * - HMAC-SHA256 (symmetric) for performance (offline validation doesn’t need PKI)
 * - Includes jti (JWT ID) for revocation tracking
 * - iat/exp for time-bound validity
 */
const signToken = (payload) => {
  if (!JWT_SECRET || JWT_SECRET.length < 8) {
    throw new Error('JWT_SECRET must be ≥8 chars for HMAC-S256 security');
  }

  return jwt.sign(
    {
      userId: payload.userId,
      role: payload.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
      jti: crypto.randomUUID() // Unique ID for revocation
    },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

// Export for use in middleware/controllers
module.exports = { signToken, verifyToken };