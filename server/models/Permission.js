// server/models/Permission.js
const mongoose = require('mongoose');
const { ROLES } = require('../config/constants');

/**
 * Permission Model
 * - Resource-action pairs (e.g., students:create)
 * - Assigned to roles dynamically
 * - Supports wildcards (students:*)
 */
const permissionSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: Object.values(ROLES),
    required: true
  },
  resource: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  action: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 255,
    default: null
  },
  enabled: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

// Compound index for fast lookup
permissionSchema.index({ role: 1, resource: 1, action: 1 }, { unique: true });

// Virtual for full permission string
permissionSchema.virtual('permissionString').get(function() {
  return `${this.resource}:${this.action}`;
});

// Static: get permissions for role
permissionSchema.statics.forRole = function(role) {
  return this.find({ role, enabled: true }).select('resource action');
};

module.exports = mongoose.model('Permission', permissionSchema);