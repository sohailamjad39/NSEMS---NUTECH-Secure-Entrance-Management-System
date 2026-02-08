// server/middleware/secureHeaders.js
/**
 * Security Headers Middleware
 * Implements:
 *   - HSTS (HTTP Strict Transport Security)
 *   - CSP (Content Security Policy)
 *   - X-Content-Type-Options
 *   - X-Frame-Options
 *   - Referrer-Policy
 */
const { CSP_DIRECTIVES } = require('../config/constants');

const secureHeaders = (req, res, next) => {
  // HSTS: Force HTTPS for 1 year + subdomains
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // CSP: Block inline scripts except for trusted sources
  const csp = Object.entries(CSP_DIRECTIVES)
    .map(([key, value]) => `${key} ${Array.isArray(value) ? value.join(' ') : value}`)
    .join('; ');
  res.setHeader('Content-Security-Policy', csp);

  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Limit referrer leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable X-Powered-By
  res.removeHeader('X-Powered-By');

  next();
};

module.exports = secureHeaders;