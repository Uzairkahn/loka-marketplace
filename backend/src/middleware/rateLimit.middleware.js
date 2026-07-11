const rateLimit = require('express-rate-limit');

/**
 * Tighter limit specifically on auth endpoints (login/register/forgot-password)
 * since those are the realistic brute-force / credential-stuffing targets.
 * A looser, general limiter on the whole API is applied separately in app.js.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts from this IP. Please try again in a few minutes.',
  },
});

module.exports = { authLimiter };
