const express = require('express');
const {
  createReview,
  getReviewsForListing,
  getReviewsForUser,
  flagReview,
} = require('../controllers/review.controller');
const { createReviewRules } = require('../validators/review.validator');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/listing/:listingId', getReviewsForListing);
router.get('/user/:userId', getReviewsForUser);
router.post('/', protect, createReviewRules, validate, createReview);
router.post('/:id/flag', protect, flagReview);

module.exports = router;
