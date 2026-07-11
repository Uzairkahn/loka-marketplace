const express = require('express');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
} = require('../controllers/booking.controller');
const { createBookingRules, updateStatusRules } = require('../validators/booking.validator');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // every booking route requires authentication

router.get('/mine', getMyBookings);
router.post('/', createBookingRules, validate, createBooking);
router.get('/:id', getBookingById);
router.patch('/:id/status', updateStatusRules, validate, updateBookingStatus);

module.exports = router;
