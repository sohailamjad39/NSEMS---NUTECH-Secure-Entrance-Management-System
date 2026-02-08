// server/utils/encryption.js
/**
 * Encryption Utilities for Client-Side Secrets
 * - Uses AES-GCM (256-bit) for symmetric encryption
 * - Keys derived from master secret + user ID (HKDF)
 * - Never stores keys on server
 */
const { promisify } = require('util');
const crypto = require('crypto');
const { randomBytes } = crypto;
const { subtle } = globalThis;

const webCrypto = {
  // Polyfill for Node.js (since we're in server, but simulating client behavior)
  async encrypt(key, data) {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      // Browser context — use Web Crypto
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const iv = crypto.randomBytes(12);
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        dataBuffer
      );
      return Buffer.concat([iv, Buffer.from(encrypted)]);
    } else {
      // Node.js fallback (for testing)
      const iv = randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag();
      return Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]);
    }
  },

  async decrypt(key, encryptedData) {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const iv = encryptedData.slice(0, 12);
      const authTag = encryptedData.slice(12, 28);
      const ciphertext = encryptedData.slice(28);
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv, tagLength: 128 },
        key,
        ciphertext
      );
      return new TextDecoder().decode(decrypted);
    } else {
      const iv = encryptedData.slice(0, 12);
      const authTag = encryptedData.slice(12, 28);
      const ciphertext = encryptedData.slice(28);
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }
  },

  async deriveKey(masterSecret, userId) {
    // HKDF-like derivation: SHA-256(masterSecret + userId)
    const input = Buffer.concat([Buffer.from(masterSecret), Buffer.from(userId)]);
    return crypto.createHash('sha256').update(input).digest();
  }
};

module.exports = webCrypto;