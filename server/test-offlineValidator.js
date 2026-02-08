const { validateQRToken } = require('./utils/offlineValidator');
const crypto = require('crypto');

// Simulate secret (in real system, this is per-user)
const secret = crypto.randomBytes(32).toString('hex');

// Generate valid QR payload
const timeWindowId = Math.floor(Date.now() / 60000);
const message = `${timeWindowId}`;
const hmac = crypto.createHmac('sha256', secret).update(message).digest('base64');
const qrPayload = Buffer.from(JSON.stringify({
  studentId: 'STU1234',
  hmac,
  t: Math.floor(Date.now() / 1000)
})).toString('base64');

console.log('QR Payload:', qrPayload);

const result = validateQRToken(qrPayload, secret);
console.log('Validation result:', result);
// Expected: { valid: true, studentId: 'STU1234', timestamp: ... }