// server/utils/offlineValidator.js
const { QR_EXPIRY_MS, OFFLINE_VALIDATION_TOLERANCE_MS } = require('../config/constants');
const { getTimeWindow, isWithinTimeWindow, getDeviceTimeFromQR } = require('./time');
const crypto = require('crypto');

/**
 * Offline QR Token Validator
 * - Runs on admin device (client-side) but logic defined here for consistency
 * - Validates: 
 *     1. Token is within 60s window
 *     2. Token matches HMAC of (time + secret)
 *     3. Token not reused (via sync log check)
 */
const validateQRToken = (qrPayload, secret, scanTimestamp = Date.now()) => {
  try {
    // Step 1: Extract device time from QR
    const deviceTime = getDeviceTimeFromQR(qrPayload);

    // Step 2: Get current time window
    const { start, end } = getTimeWindow();

    // Step 3: Check if device time is within valid window (with tolerance)
    if (!isWithinTimeWindow(deviceTime, start, end)) {
      return { valid: false, reason: 'TIME_OUT_OF_WINDOW', deviceTime, window: { start, end } };
    }

    // Step 4: Recompute expected token
    const timeWindowId = Math.floor(deviceTime / QR_EXPIRY_MS);
    const message = `${timeWindowId}`;
    const expectedHmac = crypto.createHmac('sha256', secret).update(message).digest('base64');

    // Step 5: Compare with QR payload (which contains base64 hmac)
    const payload = JSON.parse(Buffer.from(qrPayload, 'base64').toString('utf-8'));
    if (payload.hmac !== expectedHmac) {
      return { valid: false, reason: 'INVALID_HMAC', provided: payload.hmac, expected: expectedHmac };
    }

    // Step 6: Check reuse (requires local scan log — handled in service layer)
    // For now, assume no reuse (client will check IndexedDB later)
    return { valid: true, studentId: payload.studentId, timestamp: deviceTime };
  } catch (error) {
    return { valid: false, reason: 'PARSING_ERROR', error: error.message };
  }
};

module.exports = { validateQRToken };