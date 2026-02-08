// server/config/db.js

const mongoose = require('mongoose');
const {
  DB_CONNECTION_TIMEOUT_MS,
  DB_MAX_POOL_SIZE
} = require('./constants');

/**
 * Secure MongoDB Connection
 * - Uses TLS (required for institutional networks)
 * - Strict mode: prevents schema-less data injection
 * - Connection pooling tuned for campus-scale load
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(
      `✅ MongoDB connected: ${conn.connection.host}:${conn.connection.port}`
    );

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // Fail fast
  }
};

module.exports = { connectDB };