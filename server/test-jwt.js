require('dotenv').config();

const { signToken, verifyToken } = require('./config/jwt');

const token = signToken({ userId: 'STU1234', role: 'student' });
console.log('Generated token:', token);

try {
  const decoded = verifyToken(token);
  console.log('Verified:', decoded.userId, decoded.role);
} catch (e) {
  console.error('Verification failed:', e.message);
}