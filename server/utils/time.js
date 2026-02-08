// server/utils/time.js
const { QR_EXPIRY_MS, OFFLINE_VALIDATION_TOLERANCE_MS } = require('../config/constants');

/**
 * Time Utilities for Offline-First Systems
 * - All times in milliseconds since Unix epoch
 * - Tolerance windows account for device clock skew
 */
const getTimeWindow = () => {
  const now = Date.now();
  const start = Math.floor(now / QR_EXPIRY_MS) * QR_EXPIRY_MS;
  const end = start + QR_EXPIRY_MS;
  return { start, end, now };
};

const isWithinTimeWindow = (timestamp, windowStart, windowEnd) => {
  // Allow tolerance for clock skew
  const lowerBound = windowStart - OFFLINE_VALIDATION_TOLERANCE_MS;
  const upperBound = windowEnd + OFFLINE_VALIDATION_TOLERANCE_MS;
  return timestamp >= lowerBound && timestamp <= upperBound;
};

const getDeviceTimeFromQR = (qrPayload) => {
  // QR contains base64-encoded { t: 1707214800 } (Unix timestamp in seconds)
  try {
    const decoded = Buffer.from(qrPayload, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    return parsed.t * 1000; // Convert seconds → ms
  } catch (e) {
    throw new Error('Invalid QR payload format');
  }
};

module.exports = {
  getTimeWindow,
  isWithinTimeWindow,
  getDeviceTimeFromQR
};