const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const notify = require('../utils/notify');
const { paginate, buildPaginationMeta } = require('../utils/pagination');

// @route  GET /api/admin/stats
// @access Private (admin)
const getPlatformStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    totalListings,
    pendingListings,
    activeListings,
    totalBookings,
    completedBookings,
    flaggedReviewsCount,
    revenueAgg,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Listing.countDocuments(),
    Listing.countDocuments({ status: 'pending' }),
    Listing.countDocuments({ status: 'active' }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'completed' }),
    Review.countDocuments({ isFlagged: true }),
    Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$priceAtBooking' } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      activeUsers,
      suspendedUsers: totalUsers - activeUsers,
      totalListings,
      pendingListings,
      activeListings,
      totalBookings,
      completedBookings,
      flaggedReviewsCount,
      platformGMV: revenueAgg[0]?.total || 0,
    },
  });
});

// @route  GET /api/admin/users?search=&role=&status=&page=
// @access Private (admin)
const getUsers = asyncHandler(async (req, res) => {
  const { search, role, status } = req.query;
  const { page, limit, skip } = paginate(req.query, 20);

  const filter = {};
  if (search) {
    filter.$or = [
      { fullName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }
  if (role) filter.role = role;
  if (status === 'active') filter.isActive = true;
  if (status === 'suspended') filter.isActive = false;

  const [users, totalCount] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    users,
    pagination: buildPaginationMeta(page, limit, totalCount),
  });
});

// @route  PATCH /api/admin/users/:id/status
// @access Private (admin)
// body: { isActive: boolean } — suspend or reactivate an account.
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') {
    throw ApiError.badRequest('isActive must be true or false');
  }

  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'admin') {
    throw ApiError.forbidden('Admin accounts cannot be suspended from this panel');
  }

  user.isActive = isActive;
  await user.save();

  res.status(200).json({ success: true, user });
});

// @route  GET /api/admin/listings?status=&page=
// @access Private (admin)
const getAllListingsForModeration = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const { page, limit, skip } = paginate(req.query, 20);

  const filter = {};
  if (status) filter.status = status;

  const [listings, totalCount] = await Promise.all([
    Listing.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('owner', 'fullName email'),
    Listing.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    listings,
    pagination: buildPaginationMeta(page, limit, totalCount),
  });
});

// @route  PATCH /api/admin/listings/:id/status
// @access Private (admin)
// body: { status: 'active' | 'removed' | 'pending' }
const updateListingStatusByAdmin = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'removed', 'pending'].includes(status)) {
    throw ApiError.badRequest('Invalid status value');
  }

  const listing = await Listing.findById(req.params.id);
  if (!listing) throw ApiError.notFound('Listing not found');

  listing.status = status;
  await listing.save();

  await notify({
    userId: listing.owner,
    type: status === 'removed' ? 'listing_removed' : 'listing_approved',
    message:
      status === 'removed'
        ? `Your listing "${listing.title}" was removed by an admin`
        : `Your listing "${listing.title}" is now live`,
    link: `/listings/${listing._id}`,
  });

  res.status(200).json({ success: true, listing });
});

// @route  GET /api/admin/reports
// @access Private (admin)
// Reported (flagged) reviews awaiting moderation.
const getReportedReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query, 20);
  const filter = { isFlagged: true };

  const [reviews, totalCount] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reviewer', 'fullName email')
      .populate('targetUser', 'fullName email')
      .populate('listing', 'title'),
    Review.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    reviews,
    pagination: buildPaginationMeta(page, limit, totalCount),
  });
});

// @route  PATCH /api/admin/reports/:id
// @access Private (admin)
// body: { action: 'dismiss' | 'delete' } — dismiss un-flags it, delete removes it
// and rolls its rating contribution back out of the listing/seller averages.
const resolveReportedReview = asyncHandler(async (req, res) => {
  const { action } = req.body;
  if (!['dismiss', 'delete'].includes(action)) {
    throw ApiError.badRequest('Action must be "dismiss" or "delete"');
  }

  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');

  if (action === 'dismiss') {
    review.isFlagged = false;
    await review.save();
    return res.status(200).json({ success: true, message: 'Report dismissed' });
  }

  // action === 'delete': roll the rating back out.
  const [listing, targetUser] = await Promise.all([
    Listing.findById(review.listing),
    User.findById(review.targetUser),
  ]);

  const rollBack = (avg, count, rating) => {
    const newCount = Math.max(count - 1, 0);
    if (newCount === 0) return { average: 0, count: 0 };
    const newAverage = (avg * count - rating) / newCount;
    return { average: Math.round(newAverage * 10) / 10, count: newCount };
  };

  if (listing) {
    const rolled = rollBack(listing.ratingAverage, listing.ratingCount, review.rating);
    listing.ratingAverage = rolled.average;
    listing.ratingCount = rolled.count;
    await listing.save();
  }
  if (targetUser) {
    const rolled = rollBack(targetUser.ratingAverage, targetUser.ratingCount, review.rating);
    targetUser.ratingAverage = rolled.average;
    targetUser.ratingCount = rolled.count;
    await targetUser.save();
  }

  await review.deleteOne();
  res.status(200).json({ success: true, message: 'Review deleted and ratings recalculated' });
});

module.exports = {
  getPlatformStats,
  getUsers,
  updateUserStatus,
  getAllListingsForModeration,
  updateListingStatusByAdmin,
  getReportedReviews,
  resolveReportedReview,
};
