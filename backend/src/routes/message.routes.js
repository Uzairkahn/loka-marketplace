const express = require('express');
const { getConversations, getMessagesWithUser } = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/with/:userId', getMessagesWithUser);

module.exports = router;
