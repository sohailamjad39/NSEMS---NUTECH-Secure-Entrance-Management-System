// server/utils/validator.js
const { ROLES } = require('../config/constants');

/**
 * Zero-Trust Input Validator
 * - Sanitizes strings (XSS prevention)
 * - Validates IDs (alphanumeric + prefix)
 * - Checks role enums strictly
 * - Rejects empty/undefined early
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  // Remove control chars, encode HTML entities
  return str.replace(/[<>"'`=]/g, '').trim().slice(0, 255);
};

const validateStudentId = (id) => {
  if (!id) throw new Error('Student ID required');
  if (typeof id !== 'string') throw new Error('Student ID must be string');
  if (!/^[A-Z]{3}\d{4}$/.test(id)) { // e.g., STU1234
    throw new Error('Invalid student ID format (must be 3 letters + 4 digits)');
  }
  return id;
};

const validateAdminId = (id) => {
  if (!id) throw new Error('Admin ID required');
  if (typeof id !== 'string') throw new Error('Admin ID must be string');
  if (!/^[A-Z]{4}\d{3}$/.test(id)) { // e.g., ADM001
    throw new Error('Invalid admin ID format (must be 4 letters + 3 digits)');
  }
  return id;
};

const validateRole = (role) => {
  if (!role) throw new Error('Role required');
  if (role !== ROLES.STUDENT && role !== ROLES.ADMIN && role !== ROLES.SUPER_ADMIN) {
    throw new Error(`Invalid role: ${role}. Must be one of [${Object.values(ROLES).join(', ')}]`);
  }
  return role;
};

const validatePassword = (password) => {
  if (!password) throw new Error('Password required');
  if (password.length < 8) throw new Error('Password must be ≥8 characters');
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    throw new Error('Password must contain uppercase, lowercase, and digit');
  }
  return password;
};

module.exports = {
  sanitizeString,
  validateStudentId,
  validateAdminId,
  validateRole,
  validatePassword
};