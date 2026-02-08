// server/config/constants.js
/**
 * NSEMS Institutional Constants
 * ⚠️ NEVER hardcode these in controllers/services
 * All values must be reviewed by security team before prod deployment
 */

// === QR SYSTEM ===
exports.QR_EXPIRY_MS = 60 * 1000;           // 60 seconds (critical for anti-screenshot)
exports.QR_RENEWAL_WINDOW_MS = 5 * 1000;   // 5s grace window (to handle clock skew)
exports.MAX_QR_SECRET_LIFETIME_DAYS = 7;   // Rotate QR secrets weekly

// === AUTH SYSTEM ===
exports.JWT_EXPIRES_IN = '365d';      
exports.JWT_SECRET='sohail123';
exports.BCRYPT_SALT_ROUNDS = 12; // Brute-force resistant (2026 standard)
exports.MAX_LOGIN_ATTEMPTS = 5;            // Lock after 5 failed logins
exports.LOGIN_LOCK_TIME_MS = 5 * 60 * 1000; // 5 minutes lock

// === OFFLINE SYSTEM ===
exports.MAX_OFFLINE_SCAN_LOGS = 50_000;    // Prevent IndexedDB overflow
exports.SYNC_BATCH_SIZE = 100;             // Sync logs in chunks to avoid timeouts
exports.OFFLINE_VALIDATION_TOLERANCE_MS = 2_000; // 2s device time skew allowance

// === ROLES & PERMISSIONS ===
exports.ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super-admin' // Only created via dbSeed
};

// === DATABASE ===
exports.DB_CONNECTION_TIMEOUT_MS = 5_000;
exports.DB_MAX_POOL_SIZE = 10;

// === SECURITY ===
exports.CSP_DIRECTIVES = {
  defaultSrc: "'self'",
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  fontSrc: ["'self'", "https://fonts.googleapis.com"],
  imgSrc: ["'self'", "data:"],
  connectSrc: ["'self'", "https://nsems.edu"]
};

// === LOGGING ===
exports.LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  AUDIT: 'audit' // Special level for GDPR/ISO logs
};