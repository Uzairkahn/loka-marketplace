/**
 * Wraps an async route handler so rejected promises are forwarded to
 * Express's error middleware automatically, instead of every controller
 * needing its own try/catch block.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
