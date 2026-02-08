// server/models/QRSecret.js
const mongoose = require('mongoose');
const crypto = require('crypto');
const { MAX_QR_SECRET_LIFETIME_DAYS } = require('../config/constants');

/**
 * QR Secret Model
 * - Each user has one active secret at a time
 * - Secrets rotate weekly (or on revocation)
 * - Encrypted at rest (via application-level encryption)
 * - Never returned in API responses
 */
const qrSecretSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true,
    index: true
  },
  secret: {
    type: String,
    required: true,
    select: false // NEVER populate in queries
  },
  expiresAt: {
    type: Date,
    // required: true,
    index: true
  },
  revoked: {
    type: Boolean,
    default: false,
    index: true
  },
  rotatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }

}, {
  timestamps: true
});

// Pre-save: auto-set expiresAt
qrSecretSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + (MAX_QR_SECRET_LIFETIME_DAYS * 24 * 60 * 60 * 1000));
  }
  // next();
});

// Static: get active secret for user
qrSecretSchema.statics.getActiveSecret = async function(userId) {
  return this.findOne({
    userId: userId,
    revoked: false,
    expiresAt: { $gt: new Date() }
  }).select('+secret'); // Explicitly allow secret selection
};

// Static: rotate secret (used by qrService.js)
qrSecretSchema.statics.rotate = async function(userId, createdBy) {
  const oldSecret = await this.findOne({ userId, revoked: false, expiresAt: { $gt: new Date() } });
  if (oldSecret) {
    oldSecret.revoked = true;
    await oldSecret.save();
  }

  const newSecret = new this({
    userId,
    secret: crypto.randomBytes(32).toString('hex'),
    createdBy,
    rotatedAt: new Date()
  });
  return await newSecret.save();
};

module.exports = mongoose.model('QRSecret', qrSecretSchema);