const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Notification = require('../models/Notification');
const { paginate, buildPaginationMeta } = require('../utils/pagination');

// @route  GET /api/notifications
// @access Private
const getMyNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query, 20);

  const [notifications, totalCount, unreadCount] = await Promise.all([
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments({ user: req.user._id }),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);

  res.status(200).json({
    success: true,
    notifications,
    unreadCount,
    pagination: buildPaginationMeta(page, limit, totalCount),
  });
});

// @route  PATCH /api/notifications/:id/read
// @access Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw ApiError.notFound('Notification not found');
  if (notification.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('This notification does not belong to you');
  }

  notification.isRead = true;
  await notification.save();
  res.status(200).json({ success: true, notification });
});

// @route  PATCH /api/notifications/read-all
// @access Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
