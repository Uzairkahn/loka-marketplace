const express = require('express');
const { getMySummary } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/summary', protect, getMySummary);

module.exports = router;
