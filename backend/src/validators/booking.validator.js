const { body } = require('express-validator');

const createBookingRules = [
  body('listingId').isMongoId().withMessage('Valid listing ID is required'),
  body('scheduledDate')
    .isISO8601()
    .withMessage('A valid date is required')
    .custom((value) => new Date(value).getTime() > Date.now())
    .withMessage('Scheduled date must be in the future'),
  body('notes').optional().trim().isLength({ max: 1000 }),
];

const updateStatusRules = [
  body('status')
    .isIn(['accepted', 'rejected', 'completed', 'cancelled'])
    .withMessage('Invalid status value'),
];

module.exports = { createBookingRules, updateStatusRules };
