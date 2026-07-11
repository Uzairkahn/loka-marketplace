const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

/**
 * Verifies the access token from the Authorization header, attaches the
 * authenticated user to req.user. Rejects suspended accounts explicitly
 * so a valid-but-suspended token can't be used to keep acting on the platform.
 */
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('No authentication token provided');
  }

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

  const user = await User.findById(decoded.sub);
  if (!user) {
    throw ApiError.unauthorized('User belonging to this token no longer exists');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been suspended');
  }

  req.user = user;
  next();
});

/**
 * Role guard, used after `protect`. Usage: authorize('admin')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw ApiError.forbidden('You do not have permission to perform this action');
  }
  next();
};

module.exports = { protect, authorize };
