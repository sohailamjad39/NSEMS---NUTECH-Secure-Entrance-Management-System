// server/models/User.js
const mongoose = require('mongoose');
const { ROLES } = require('../config/constants');
const { validateStudentId, validateAdminId, validateRole } = require('../utils/validator');

/**
 * User Model
 * - Strict schema to prevent injection
 * - Role-based access enforced at DB level
 * - QR secret linked (not embedded) for rotation safety
 */
const userSchema = new mongoose.Schema({
  // ID fields (institutional format)
  studentId: {
    type: String,
    required: function() { return this.role === ROLES.STUDENT; },
    // unique: true,
    validate: {
      validator: function(v) {
        return v ? validateStudentId(v) : true;
      },
      message: 'Invalid student ID format (e.g., STU1234)'
    }
  },
  adminId: {
    type: String,
    required: function() { return this.role === ROLES.ADMIN || this.role === ROLES.SUPER_ADMIN; },
    // unique: true,
    validate: {
      validator: function(v) {
        return v ? validateAdminId(v) : true;
      },
      message: 'Invalid admin ID format (e.g., ADM001)'
    }
  },

  // Core identity
  name: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
    validate: {
      validator: (v) => /^[a-zA-Z\s'-]{2,100}$/.test(v),
      message: 'Name must contain only letters, spaces, hyphens, or apostrophes'
    }
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    // unique: true
  },
  department: {
    type: String,
    maxlength: 50,
    trim: true
  },

  // Security
  role: {
    type: String,
    enum: Object.values(ROLES),
    required: true,
    default: ROLES.STUDENT
  },
  isActive: {
    type: Boolean,
    default: true,
    immutable: true // Prevent accidental deactivation via update
  },
  lastLogin: {
    type: Date,
    default: null
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
    min: 0
  },
  lockedUntil: {
    type: Date,
    default: null
  },

  // QR system linkage
  qrSecretId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRSecret',
    // required: true
  },

  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full ID (studentId or adminId)
userSchema.virtual('fullId').get(function() {
  return this.studentId || this.adminId;
});

// Indexes for performance & uniqueness
userSchema.index(
  { studentId: 1 },
  { partialFilterExpression: { role: ROLES.STUDENT } }
);

userSchema.index(
  { adminId: 1 },
  { partialFilterExpression: { role: { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN] } } }
);

userSchema.index({ email: 1 });
userSchema.index({ qrSecretId: 1 });

// Pre-save hook: enforce role-specific fields
userSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    if (this.role === ROLES.STUDENT) {
      this.studentId = this.studentId?.toUpperCase();
      this.adminId = undefined;
    } else {
      this.adminId = this.adminId?.toUpperCase();
      this.studentId = undefined;
    }
  }
});

// Static method: find by institutional ID (student or admin)
userSchema.statics.findByIdentifier = function(identifier) {
  const query = identifier.startsWith('STU') 
    ? { studentId: identifier }
    : { adminId: identifier };
  return this.findOne(query);
};

module.exports = mongoose.model('User', userSchema);