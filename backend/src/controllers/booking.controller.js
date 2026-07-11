const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const notify = require('../utils/notify');
const { paginate, buildPaginationMeta } = require('../utils/pagination');

/**
 * Defines which role may move a booking from one status to another.
 * 'both' means either the buyer or the seller may perform that transition.
 * Anything not listed here is an illegal transition.
 */
const ALLOWED_TRANSITIONS = {
  pending: { accepted: 'seller', rejected: 'seller', cancelled: 'buyer' },
  accepted: { completed: 'seller', cancelled: 'both' },
};

// @route  POST /api/bookings
// @access Private
const createBooking = asyncHandler(async (req, res) => {
  const { listingId, scheduledDate, notes } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing || listing.status !== 'active') {
    throw ApiError.notFound('Listing not found or no longer available');
  }

  if (listing.owner.toString() === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot book your own listing');
  }

  const booking = await Booking.create({
    listing: listing._id,
    buyer: req.user._id,
    seller: listing.owner,
    scheduledDate,
    notes,
    priceAtBooking: listing.price,
  });

  await notify({
    userId: listing.owner,
    type: 'booking_request',
    message: `${req.user.fullName} requested to book "${listing.title}"`,
    link: `/bookings/${booking._id}`,
  });

  const populated = await booking.populate([
    { path: 'listing', select: 'title images price type' },
    { path: 'buyer', select: 'fullName avatarUrl' },
    { path: 'seller', select: 'fullName avatarUrl' },
  ]);

  res.status(201).json({ success: true, booking: populated });
});

// @route  GET /api/bookings/mine?role=buyer|seller&status=pending
// @access Private
const getMyBookings = asyncHandler(async (req, res) => {
  const { role, status } = req.query;
  const { page, limit, skip } = paginate(req.query);

  const filter = {};
  if (role === 'seller') {
    filter.seller = req.user._id;
  } else if (role === 'buyer') {
    filter.buyer = req.user._id;
  } else {
    filter.$or = [{ buyer: req.user._id }, { seller: req.user._id }];
  }
  if (status) filter.status = status;

  const [bookings, totalCount] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('listing', 'title images price type')
      .populate('buyer', 'fullName avatarUrl')
      .populate('seller', 'fullName avatarUrl'),
    Booking.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    bookings,
    pagination: buildPaginationMeta(page, limit, totalCount),
  });
});

// @route  GET /api/bookings/:id
// @access Private (buyer, seller, or admin only)
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('listing', 'title images price type owner')
    .populate('buyer', 'fullName avatarUrl')
    .populate('seller', 'fullName avatarUrl');

  if (!booking) throw ApiError.notFound('Booking not found');

  const isParticipant =
    booking.buyer._id.toString() === req.user._id.toString() ||
    booking.seller._id.toString() === req.user._id.toString();

  if (!isParticipant && req.user.role !== 'admin') {
    throw ApiError.forbidden('You do not have access to this booking');
  }

  res.status(200).json({ success: true, booking });
});

// @route  PATCH /api/bookings/:id/status
// @access Private (buyer or seller, depending on transition)
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status: nextStatus } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');

  const isBuyer = booking.buyer.toString() === req.user._id.toString();
  const isSeller = booking.seller.toString() === req.user._id.toString();
  if (!isBuyer && !isSeller) {
    throw ApiError.forbidden('You are not a participant in this booking');
  }

  const transitionsFromCurrent = ALLOWED_TRANSITIONS[booking.status] || {};
  const requiredRole = transitionsFromCurrent[nextStatus];

  if (!requiredRole) {
    throw ApiError.badRequest(`Cannot move a "${booking.status}" booking to "${nextStatus}"`);
  }
  if (requiredRole === 'seller' && !isSeller) {
    throw ApiError.forbidden('Only the seller can perform this action');
  }
  if (requiredRole === 'buyer' && !isBuyer) {
    throw ApiError.forbidden('Only the buyer can perform this action');
  }
  // requiredRole === 'both' → either participant may proceed.

  booking.status = nextStatus;
  await booking.save();

  const recipientId = isSeller ? booking.buyer : booking.seller;
  await notify({
    userId: recipientId,
    type: 'booking_status_update',
    message: `Your booking is now "${nextStatus}"`,
    link: `/bookings/${booking._id}`,
  });

  res.status(200).json({ success: true, booking });
});

module.exports = { createBooking, getMyBookings, getBookingById, updateBookingStatus };
