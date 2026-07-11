const express = require('express');
const {
  getPlatformStats,
  getUsers,
  updateUserStatus,
  getAllListingsForModeration,
  updateListingStatusByAdmin,
  getReportedReviews,
  resolveReportedReview,
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getPlatformStats);

router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);

router.get('/listings', getAllListingsForModeration);
router.patch('/listings/:id/status', updateListingStatusByAdmin);

router.get('/reports', getReportedReviews);
router.patch('/reports/:id', resolveReportedReview);

module.exports = router;
