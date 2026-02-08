// server/helpers/roleMapper.js
const { ROLES } = require('../config/constants');

/**
 * Role Permission Mapper
 * Defines what each role can do
 * Will be extended by permissionService.js later
 */
const rolePermissions = {
  [ROLES.STUDENT]: [
    'id:read',        // View own ID
    'qr:generate',    // Generate QR (every 60s)
    'profile:read'    // View own profile
  ],
  [ROLES.ADMIN]: [
    'students:list',
    'students:view',
    'scans:view',
    'qr:validate',
    'logs:read',
    'admin:manage'    // Create/edit admins
  ],
  [ROLES.SUPER_ADMIN]: [
    'students:*',
    'admins:*',
    'permissions:*',
    'config:manage',
    'audit:export'
  ]
};

const getPermissions = (role) => {
  if (!rolePermissions[role]) {
    throw new Error(`Unknown role: ${role}`);
  }
  return rolePermissions[role];
};

const hasPermission = (role, permission) => {
  const perms = getPermissions(role);
  return perms.includes(permission) || perms.includes('*') || perms.some(p => p.endsWith(':*') && permission.startsWith(p.slice(0, -2)));
};

module.exports = { getPermissions, hasPermission };