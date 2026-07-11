const express = require('express');
const {
  createListing,
  getListings,
  getMyListings,
  getFavorites,
  getListingById,
  updateListing,
  deleteListing,
  toggleFavorite,
  getCategoryCounts,
} = require('../controllers/listing.controller');
const {
  createListingRules,
  updateListingRules,
  listQueryRules,
} = require('../validators/listing.validator');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Specific routes before the /:id catch-all.
router.get('/mine', protect, getMyListings);
router.get('/favorites', protect, getFavorites);
router.get('/meta/category-counts', getCategoryCounts);

router
  .route('/')
  .get(listQueryRules, validate, getListings)
  .post(protect, upload.array('images', 6), createListingRules, validate, createListing);

router.post('/:id/favorite', protect, toggleFavorite);

router
  .route('/:id')
  .get(getListingById)
  .put(protect, upload.array('images', 6), updateListingRules, validate, updateListing)
  .delete(protect, deleteListing);

module.exports = router;
