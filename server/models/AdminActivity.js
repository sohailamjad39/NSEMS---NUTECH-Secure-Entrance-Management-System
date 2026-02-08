// server/models/AdminActivity.js
const mongoose = require('mongoose');

/**
 * Admin Activity Log
 * - GDPR-compliant: minimal PII
 * - Required for ISO 27001 audits
 * - Tracks: who, what, when, from where
 */
const adminActivitySchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true,
    maxlength: 7
  },
  adminName: {
    type: String,
    required: true,
    maxlength: 100
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login', 'logout',
      'student:create', 'student:edit', 'student:revoke',
      'admin:create', 'admin:edit', 'admin:revoke',
      'qr:rotate', 'permission:update',
      'scan:validate', 'log:export'
    ]
  },
  targetId: {
    type: String,
    maxlength: 100,
    default: null
  },
  targetName: {
    type: String,
    maxlength: 100,
    default: null
  },
  ip: {
    type: String,
    maxlength: 45
  },
  userAgent: {
    type: String,
    maxlength: 500
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    maxlength: 2000,
    default: {}
  }

}, {
  timestamps: true,
  minimize: false
});

// Index for fast audit queries
adminActivitySchema.index({ adminId: 1, createdAt: -1 });
adminActivitySchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AdminActivity', adminActivitySchema);