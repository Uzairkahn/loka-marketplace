const asyncHandler = require('../utils/asyncHandler');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @route  GET /api/dashboard/summary
// @access Private
// Real aggregates for the logged-in user's own activity — no dummy numbers.
const getMySummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [
    activeListingsCount,
    pendingBookingsAsSeller,
    upcomingBookingsAsBuyer,
    unreadNotificationsCount,
    favoritesCount,
    earningsAgg,
    recentBookings,
  ] = await Promise.all([
    Listing.countDocuments({ owner: userId, status: 'active' }),
    Booking.countDocuments({ seller: userId, status: 'pending' }),
    Booking.countDocuments({ buyer: userId, status: { $in: ['pending', 'accepted'] } }),
    Notification.countDocuments({ user: userId, isRead: false }),
    User.findById(userId).then((u) => u.favorites.length),
    // Sum of completed bookings where this user was the seller — real
    // revenue from real transactions, not a placeholder figure.
    Booking.aggregate([
      { $match: { seller: userId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$priceAtBooking' }, count: { $sum: 1 } } },
    ]),
    Booking.find({ $or: [{ buyer: userId }, { seller: userId }] })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('listing', 'title')
      .populate('buyer', 'fullName')
      .populate('seller', 'fullName'),
  ]);

  const earnings = earningsAgg[0]?.total || 0;
  const completedSalesCount = earningsAgg[0]?.count || 0;

  res.status(200).json({
    success: true,
    summary: {
      activeListingsCount,
      pendingBookingsAsSeller,
      upcomingBookingsAsBuyer,
      unreadNotificationsCount,
      favoritesCount,
      earnings,
      completedSalesCount,
      recentBookings,
    },
  });
});

module.exports = { getMySummary };
