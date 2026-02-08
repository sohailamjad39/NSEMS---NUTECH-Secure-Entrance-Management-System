// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// === CONFIGURATION ===
const { connectDB } = require('./config/db');
const { signToken, verifyToken } = require('./config/jwt');

// === MIDDLEWARE ===
const secureHeaders = require('./middleware/secureHeaders');
const corsMiddleware = require('./middleware/cors');
const rateLimitMiddleware = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// === MODELS (required for schema validation) ===
require('./models/User');
require('./models/ScanLog');
require('./models/QRSecret');
require('./models/AdminActivity');
require('./models/Permission');

// === UTILS ===
const logger = require('./utils/logger');
const { QR_EXPIRY_MS } = require('./config/constants');
const { validateModels } = require('./utils/validateSchema');

// Initialize app
const app = express();

// Security headers first
app.use(secureHeaders);

// CORS after headers
app.use(corsMiddleware);

// Rate limiting
app.use(rateLimitMiddleware);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested', { ip: req.ip });
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'NSEMS Backend',
    qrExpiryMs: QR_EXPIRY_MS,
    env: process.env.NODE_ENV || 'development',
    db: 'connected',
    models: {
      users: mongoose.models.User.collection.name,
      scanLogs: mongoose.models.ScanLog.collection.name,
      qrSecrets: mongoose.models.QRSecret.collection.name
    },
    schemaValid: true
  });
});

// Test route to verify models
app.get('/test-models', async (req, res) => {
  try {
    // Validate schemas
    validateModels();
    
    // Count users
    const userCount = await mongoose.models.User.countDocuments();
    const scanCount = await mongoose.models.ScanLog.countDocuments();
    
    res.json({
      users: userCount,
      scanLogs: scanCount,
      message: 'Models loaded and validated'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();
    
    // Validate schemas on startup
    validateModels();
    
    app.listen(PORT, () => {
      logger.info(`✅ NSEMS Backend running on port ${PORT}`, {
        env: process.env.NODE_ENV,
        mongoUri: process.env.MONGODB_URI?.replace(/\/\/[^@]*@/, '//***:***@')
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

startServer();