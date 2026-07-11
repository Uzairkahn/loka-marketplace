const { body, query } = require('express-validator');

const CATEGORIES = [
  'Graphic Designing',
  'Web Development',
  'Photography',
  'Home Services',
  'Tutoring',
  'Content Writing',
  'Digital Marketing',
  'Video Editing',
  'Furniture & Goods',
  'Electronics',
  'Fashion & Apparel',
  'Other',
];

const createListingRules = [
  body('type').isIn(['product', 'service']).withMessage('Type must be product or service'),
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 3000 }),
  body('category').trim().isIn(CATEGORIES).withMessage('Select a valid category'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('city').optional().trim(),
  body('country').optional().trim(),
  body('deliveryTime').optional().trim().isLength({ max: 60 }),
  // availability arrives as a JSON string in multipart form-data; parsed in the controller.
];

const updateListingRules = [
  body('title').optional().trim().isLength({ max: 120 }),
  body('description').optional().trim().isLength({ max: 3000 }),
  body('category').optional().trim().isIn(CATEGORIES).withMessage('Select a valid category'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('status').optional().isIn(['pending', 'active', 'removed']),
];

const listQueryRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('type').optional().isIn(['product', 'service']),
  query('sort').optional().isIn(['newest', 'price_asc', 'price_desc', 'rating']),
];

module.exports = { CATEGORIES, createListingRules, updateListingRules, listQueryRules };
