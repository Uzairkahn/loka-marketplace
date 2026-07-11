const Notification = require('../models/Notification');
const { emitToUser } = require('../socket');

/**
 * Thin wrapper so every part of the app creates notifications the same
 * shape. Failures here are logged, not thrown — a notification failing
 * to save should never roll back the booking/review it's describing.
 *
 * Emits the same payload over the socket to the recipient's room so the
 * navbar bell updates instantly; falls back to nothing if sockets aren't
 * connected — the frontend's polling still catches it within 30s.
 */
const notify = async ({ userId, type, message, link = '' }) => {
  try {
    const notification = await Notification.create({ user: userId, type, message, link });
    emitToUser(userId, 'new_notification', notification);
  } catch (error) {
    console.error(`[notifications] Failed to create notification: ${error.message}`);
  }
};

module.exports = notify;
