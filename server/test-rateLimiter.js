const rateLimit = require('./middleware/rateLimiter');
const req = { ip: '127.0.0.1' };
const res = { status: (code) => ({ json: (data) => console.log('Rate limit:', code, data) }) };

// Trigger 5 failures
for (let i = 0; i < 6; i++) {
  rateLimit(req, res, () => console.log('Allowed on attempt', i+1));
}