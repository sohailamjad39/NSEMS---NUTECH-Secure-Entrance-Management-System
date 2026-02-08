const logger = require('./utils/logger');

logger.audit('User logged in', {
  userId: 'STU1234',
  action: 'login',
  ip: '192.168.1.100',
  requestId: 'req-123'
});