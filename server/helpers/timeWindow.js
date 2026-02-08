// server/helpers/timeWindow.js
const { QR_EXPIRY_MS, OFFLINE_VALIDATION_TOLERANCE_MS } = require('../config/constants');

/**
 * Time Window Utilities
 * Reusable across services for consistency
 */
const getTimeWindow = (timestamp = Date.now()) => {
  const start = Math.floor(timestamp / QR_EXPIRY_MS) * QR_EXPIRY_MS;
  const end = start + QR_EXPIRY_MS;
  return { start, end };
};

const isWithinWindow = (candidate, windowStart, windowEnd) => {
  const lower = windowStart - OFFLINE_VALIDATION_TOLERANCE_MS;
  const upper = windowEnd + OFFLINE_VALIDATION_TOLERANCE_MS;
  return candidate >= lower && candidate <= upper;
};

module.exports = { getTimeWindow, isWithinWindow };