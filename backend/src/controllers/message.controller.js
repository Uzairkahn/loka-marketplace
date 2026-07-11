const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Message = require('../models/Message');
const User = require('../models/User');
const { buildConversationId } = require('../socket');

// @route  GET /api/messages/conversations
// @access Private
// Returns one row per conversation the user is part of: the other
// participant, the last message, and how many are unread.
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Message.aggregate([
    { $match: { $or: [{ sender: userId }, { recipient: userId }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$recipient', userId] }, { $eq: ['$isRead', false] }] },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
  ]);

  // Resolve "the other participant" for each conversation and attach their
  // public profile info — done as a second pass since it's cleaner than a
  // conditional $lookup inside the aggregation above.
  const withParticipants = await Promise.all(
    conversations.map(async (conv) => {
      const otherUserId =
        conv.lastMessage.sender.toString() === userId.toString()
          ? conv.lastMessage.recipient
          : conv.lastMessage.sender;
      const otherUser = await User.findById(otherUserId).select('fullName avatarUrl');
      return {
        conversationId: conv._id,
        otherUser,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount,
      };
    })
  );

  res.status(200).json({ success: true, conversations: withParticipants });
});

// @route  GET /api/messages/with/:userId
// @access Private
// Full history with a specific user, oldest first (ready to render top-to-bottom).
const getMessagesWithUser = asyncHandler(async (req, res) => {
  const otherUserId = req.params.userId;
  if (otherUserId === req.user._id.toString()) {
    throw ApiError.badRequest('Cannot fetch a conversation with yourself');
  }

  const conversationId = buildConversationId(req.user._id.toString(), otherUserId);
  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

  res.status(200).json({ success: true, conversationId, messages });
});

module.exports = { getConversations, getMessagesWithUser };
