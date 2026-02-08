// server/middleware/rateLimiter.js
const { MAX_LOGIN_ATTEMPTS, LOGIN_LOCK_TIME_MS } = require('../config/constants');

/**
 * Simple In-Memory Rate Limiter
 * - Tracks failed attempts per IP
 * - Locks IP for 15 minutes after 5 failures
 * - Not persistent (use Redis in prod), but sufficient for campus scale
 */
class RateLimiter {
  constructor() {
    this.attempts = new Map(); // ip -> { count, lockedUntil }
  }

  check(ip) {
    const now = Date.now();
    const record = this.attempts.get(ip);

    if (record && record.lockedUntil > now) {
      return { blocked: true, retryAfter: Math.ceil((record.lockedUntil - now) / 1000) };
    }

    if (record) {
      if (record.count >= MAX_LOGIN_ATTEMPTS) {
        this.attempts.set(ip, {
          count: record.count,
          lockedUntil: now + LOGIN_LOCK_TIME_MS
        });
        return { blocked: true, retryAfter: Math.ceil(LOGIN_LOCK_TIME_MS / 1000) };
      }
      this.attempts.set(ip, { ...record, count: record.count + 1 });
    } else {
      this.attempts.set(ip, { count: 1, lockedUntil: 0 });
    }

    return { blocked: false };
  }

  reset(ip) {
    this.attempts.delete(ip);
  }
}

const limiter = new RateLimiter();

const rateLimitMiddleware = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const { blocked, retryAfter } = limiter.check(ip);

  if (blocked) {
    return res.status(429).json({
      error: {
        message: `Too many requests. Try again in ${retryAfter} seconds.`,
        code: 'TOO_MANY_REQUESTS'
      }
    });
  }

  // Attach limiter to request for controllers to reset on success
  req.rateLimiter = { reset: () => limiter.reset(ip) };
  next();
};

module.exports = rateLimitMiddleware;