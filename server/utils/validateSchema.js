const User = require('../models/User');
const ScanLog = require('../models/ScanLog');
const QRSecret = require('../models/QRSecret');
const AdminActivity = require('../models/AdminActivity');
const Permission = require('../models/Permission');

/**
 * Schema Validator
 * - Runs on startup to ensure models are correctly defined
 * - Checks for critical missing indexes, enums, and validations
 */
const validateModels = () => {
  console.log('🔍 Validating Mongoose schemas...');

  // User validation
  const userIndexes = User.schema.indexes();
  const hasStudentIdIndex = userIndexes.some(
    idx => idx[0].studentId && idx[1].unique
  );
  const hasAdminIdIndex = userIndexes.some(
    idx => idx[0].adminId && idx[1].unique
  );
  if (!hasStudentIdIndex || !hasAdminIdIndex) {
    throw new Error('User schema missing partial indexes for studentId/adminId');
  }

  // ScanLog deduplication index
  const scanIndexes = ScanLog.schema.indexes();
  const hasDedupeIndex = scanIndexes.some(
    idx => idx[0].studentId && idx[0].qrToken && idx[0].deviceTime && idx[1].unique
  );
  if (!hasDedupeIndex) {
    throw new Error('ScanLog missing deduplication index');
  }

  // QRSecret select: false
  if (QRSecret.schema.path('secret').options.select !== false) {
    throw new Error('QRSecret.secret must have select: false');
  }

  console.log('✅ All schemas validated');
};

module.exports = { validateModels };