// server/models/ScanLog.js
const mongoose = require('mongoose');
const { QR_EXPIRY_MS } = require('../config/constants');

/**
 * Scan Log Model
 * - Designed for offline-first: stores local device time + server time separately
 * - `synced: false` until uploaded to server
 * - `isValid` determined at validation time (not recalculated)
 * - Prevents replay attacks via `qrToken` uniqueness per window
 */
const scanLogSchema = new mongoose.Schema({
  // Who was scanned
  studentId: {
    type: String,
    required: true,
    maxlength: 7,
    validate: {
      validator: (v) => /^STU\d{4}$/.test(v),
      message: 'Student ID must be STU1234 format'
    }
  },
  studentName: {
    type: String,
    required: true,
    maxlength: 100
  },

  // Who did the scanning
  adminId: {
    type: String,
    required: true,
    maxlength: 7,
    validate: {
      validator: (v) => /^ADM\d{3}$/.test(v),
      message: 'Admin ID must be ADM001 format'
    }
  },
  adminName: {
    type: String,
    required: true,
    maxlength: 100
  },

  // QR validation data
  qrToken: {
    type: String,
    required: true,
    maxlength: 500,
    index: true // For deduplication check
  },
  deviceTime: {
    type: Date,
    required: true,
    index: true
  },
  serverTime: {
    type: Date,
    default: null // Populated only when synced
  },

  // Validation result
  isValid: {
    type: Boolean,
    required: true
  },
  validatedOffline: {
    type: Boolean,
    default: false // True if validated without server call
  },
  reason: {
    type: String,
    maxlength: 255,
    default: null
  },

  // Sync state
  synced: {
    type: Boolean,
    default: false,
    index: true
  },
  syncError: {
    type: String,
    maxlength: 1000,
    default: null
  },

  // Audit
  ip: {
    type: String,
    maxlength: 45 // IPv6 safe
  },
  userAgent: {
    type: String,
    maxlength: 500
  },
  location: {
    type: { type: String, enum: ['gate', 'exam-hall', 'hostel', 'library'] },
    // default: 'unknown'
  }

}, {
  timestamps: true,
  minimize: false // Preserve empty fields for sync clarity
});

// Compound index for deduplication (prevent same QR scanned twice in same window)
scanLogSchema.index(
  { studentId: 1, qrToken: 1, deviceTime: 1 },
  { unique: true, partialFilterExpression: { synced: false } }
);

// Pre-save: enforce time consistency
scanLogSchema.pre('save', function(next) {
  if (this.isNew && this.deviceTime) {
    const now = new Date();
    const diff = Math.abs(now - this.deviceTime);
    if (diff > 30 * 60 * 1000) { // >30 minutes skew
      return next(new Error('Device time too far from server time'));
    }
  }
  next();
});

// Static: find unsynced logs
scanLogSchema.statics.findUnsynced = function(limit = 100) {
  return this.find({ synced: false }).limit(limit).sort({ createdAt: 1 });
};

module.exports = mongoose.model('ScanLog', scanLogSchema);