// server/middleware/cors.js
const { corsOrigins } = require('../config/constants');

/**
 * CORS Middleware
 * Only allows:
 *   - https://nsems.edu (production)
 *   - https://localhost:5173 (Vite dev)
 *   - https://admin.nsems.edu (future admin subdomain)
 */
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://nsems.edu',
    'https://localhost:5173',
    'https://localhost:5000',
    'https://admin.nsems.edu'
  ];

if (!origin) {
  // Allow requests without Origin (browser direct, curl, health checks)
  return next();
}

if (!allowedOrigins.includes(origin)) {
  return res.status(403).json({ error: "Forbidden: Invalid origin" });
}

next();
};

module.exports = corsMiddleware;