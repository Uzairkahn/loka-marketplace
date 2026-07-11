const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const User = require('../models/User');
const notify = require('../utils/notify');
const { paginate, buildPaginationMeta } = require('../utils/pagination');

/**
 * Incrementally rolls a new rating into an existing average rather than
 * re-aggregating every review on each submission — O(1) instead of O(n)
 * per review, which matters once a listing/seller has a real review history.
 */
const rollInRating = (currentAverage, currentCount, newRating) => {
  const newCount = currentCount + 1;
  const newAverage = (currentAverage * currentCount + newRating) / newCount;
  return { average: Math.round(newAverage * 10) / 10, count: newCount };
};

// @route  POST /api/reviews
// @access Private (must be the buyer on a completed booking, once per booking)
const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking not found');

  if (booking.buyer.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only the buyer on this booking can leave a review');
  }
  if (booking.status !== 'completed') {
    throw ApiError.badRequest('You can only review a completed booking');
  }

  const existing = await Review.findOne({ booking: bookingId, reviewer: req.user._id });
  if (existing) throw ApiError.conflict('You have already reviewed this booking');

  const review = await Review.create({
    booking: bookingId,
    listing: booking.listing,
    reviewer: req.user._id,
    targetUser: booking.seller,
    rating,
    comment,
  });

  const [listing, seller] = await Promise.all([
    Listing.findById(booking.listing),
    User.findById(booking.seller),
  ]);

  if (listing) {
    const rolled = rollInRating(listing.ratingAverage, listing.ratingCount, rating);
    listing.ratingAverage = rolled.average;
    listing.ratingCount = rolled.count;
    await listing.save();
  }
  if (seller) {
    const rolled = rollInRating(seller.ratingAverage, seller.ratingCount, rating);
    seller.ratingAverage = rolled.average;
    seller.ratingCount = rolled.count;
    await seller.save();
  }

  await notify({
    userId: booking.seller,
    type: 'new_review',
    message: `${req.user.fullName} left you a ${rating}-star review`,
    link: `/listings/${booking.listing}`,
  });

  res.status(201).json({ success: true, review });
});

// @route  GET /api/reviews/listing/:listingId
// @access Public
const getReviewsForListing = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = { listing: req.params.listingId, isFlagged: false };

  const [reviews, totalCount] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reviewer', 'fullName avatarUrl'),
    Review.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    reviews,
    pagination: buildPaginationMeta(page, limit, totalCount),
  });
});

// @route  GET /api/reviews/user/:userId
// @access Public
const getReviewsForUser = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = { targetUser: req.params.userId, isFlagged: false };

  const [reviews, totalCount] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reviewer', 'fullName avatarUrl')
      .populate('listing', 'title'),
    Review.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    reviews,
    pagination: buildPaginationMeta(page, limit, totalCount),
  });
});

// @route  POST /api/reviews/:id/flag
// @access Private
const flagReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');

  review.isFlagged = true;
  await review.save();

  res.status(200).json({ success: true, message: 'Review reported for moderation' });
});

module.exports = { createReview, getReviewsForListing, getReviewsForUser, flagReview };
