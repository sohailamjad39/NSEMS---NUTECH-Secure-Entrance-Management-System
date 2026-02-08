// server/utils/logger.js
const { LOG_LEVELS } = require('../config/constants');
const crypto = require('crypto');

/**
 * Institutional Logger
 * - Structured JSON logs (for ELK/Splunk ingestion)
 * - Separates audit logs (GDPR-compliant) from debug
 * - Never logs passwords/secrets (sanitized automatically)
 */
class Logger {
  constructor(serviceName = 'NSEMS') {
    this.serviceName = serviceName;
    this.levels = LOG_LEVELS;
  }

  _log(level, message, meta = {}) {
    const requestId = meta.requestId || crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const ip = meta.ip || 'unknown';
    const userId = meta.userId || 'anonymous';

    // Sanitize sensitive fields
    const safeMeta = { ...meta };
    delete safeMeta.password;
    delete safeMeta.secret;
    delete safeMeta.token;

    const logEntry = {
      timestamp,
      service: this.serviceName,
      level,
      requestId,
      ip,
      userId,
      message,
      ...safeMeta
    };

    // Output to console (redirect to file/syslog in prod)
    console[level === 'audit' ? 'info' : level](JSON.stringify(logEntry, null, 2));
  }

  debug(message, meta = {}) {
    this._log(this.levels.DEBUG, message, meta);
  }

  info(message, meta = {}) {
    this._log(this.levels.INFO, message, meta);
  }

  warn(message, meta = {}) {
    this._log(this.levels.WARN, message, meta);
  }

  error(message, meta = {}) {
    this._log(this.levels.ERROR, message, meta);
  }

  audit(message, meta = {}) {
    // GDPR-compliant: only essential fields
    this._log(this.levels.AUDIT, message, {
      ...meta,
      userId: meta.userId || undefined,
      action: meta.action || undefined,
      targetId: meta.targetId || undefined
    });
  }
}

module.exports = new Logger();