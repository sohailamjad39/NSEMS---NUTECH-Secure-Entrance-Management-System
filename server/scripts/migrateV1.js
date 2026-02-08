// server/scripts/migrateV1.js
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const User = require('../models/User');
const QRSecret = require('../models/QRSecret');
const { ROLES } = require('../config/constants');

/**
 * Migration V1: Add qrSecretId to all users
 * - Creates QRSecret for each user
 * - Sets qrSecretId reference
 * - Idempotent: safe to run multiple times
 */
const migrate = async () => {
  await connectDB();

  const users = await User.find({ qrSecretId: { $exists: false } });
  console.log(`Found ${users.length} users needing QR secret...`);

  for (const user of users) {
    try {
      const secret = new QRSecret({
        userId: user._id,
        secret: crypto.randomBytes(32).toString('hex'),
        createdBy: user._id
      });
      await secret.save();

      user.qrSecretId = secret._id;
      await user.save();
      console.log(`✅ Added QR secret for ${user.fullId}`);
    } catch (err) {
      console.error(`❌ Failed for ${user.fullId}:`, err.message);
    }
  }

  console.log('Migration complete.');
  process.exit(0);
};

migrate().catch(console.error);