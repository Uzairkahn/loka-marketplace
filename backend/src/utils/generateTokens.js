const jwt = require('jsonwebtoken');

/**
 * Issues a short-lived access token (sent to the client, used on every
 * request) and a long-lived refresh token (stored as an httpOnly cookie,
 * used only to mint new access tokens). Keeping the access token short
 * limits the damage window if it's ever leaked.
 */
const generateAccessToken = (userId, role) =>
  jwt.sign({ sub: userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth',
  });
};

module.exports = { generateAccessToken, generateRefreshToken, setRefreshTokenCookie };
