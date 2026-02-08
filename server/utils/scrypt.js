// server/utils/scrypt.js
/**
 * Pure JavaScript scrypt implementation for offline password verification
 * ⚠️ NEVER use for server-side hashing — only for client-side cache validation
 * Based on https://github.com/dchest/scrypt-js (v3.0.0, MIT licensed)
 */
const scrypt = require('scrypt-js');
const crypto = require('crypto'); 

/**
 * Verify password against stored hash (used in offline login flow)
 * @param {string} password - User-provided password
 * @param {string} hash - Base64-encoded scrypt hash (from IndexedDB)
 * @returns {Promise<boolean>}
 */
const verifyPassword = async (password, hash) => {
  try {
    // Hash format: "scrypt$N$r$p$<salt>$<derivedKey>"
    const [_, nStr, rStr, pStr, saltB64, keyB64] = hash.split('$');
    if (!nStr || !rStr || !pStr || !saltB64 || !keyB64) {
      throw new Error('Invalid hash format');
    }

    const N = parseInt(nStr, 10);
    const r = parseInt(rStr, 10);
    const p = parseInt(pStr, 10);
    const salt = Buffer.from(saltB64, 'base64');
    const expectedKey = Buffer.from(keyB64, 'base64');

    const derivedKey = await scrypt.scrypt(
      Buffer.from(password),
      salt,
      N,
      r,
      p,
      64 // output length
    );

    return derivedKey.equals(expectedKey);
  } catch (error) {
    console.warn('Scrypt verification failed:', error.message);
    return false;
  }
};

/**
 * Generate scrypt hash (for initial online login only)
 * @param {string} password
 * @returns {Promise<string>} Format: "scrypt$16384$8$1$<salt>$<key>"
 */
const generateHash = async (password) => {
  const N = 16384; // 2^14 — secure for 2026
  const r = 8;
  const p = 1;
  const salt = crypto.randomBytes(32);
  const key = await scrypt.scrypt(
    Buffer.from(password),
    salt,
    N,
    r,
    p,
    64
  );

  return [
    'scrypt',
    N, r, p,
    salt.toString('base64'),
    key.toString('base64')
  ].join('$');
};

module.exports = { verifyPassword, generateHash };