const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');

let ioInstance = null;

/**
 * Deterministic conversation id for a 1:1 chat — sorted, joined user ids.
 * Keeps chat history queryable by a single indexed field without a
 * separate Conversation collection, which isn't needed until group chat exists.
 */
const buildConversationId = (userIdA, userIdB) => [userIdA, userIdB].sort().join('_');

const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // Authenticate the socket handshake using the same access token the
  // REST API uses — no separate auth scheme to maintain.
  ioInstance.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.sub);
      if (!user || !user.isActive) return next(new Error('User not found or suspended'));

      socket.userId = user._id.toString();
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  ioInstance.on('connection', (socket) => {
    // Every user gets a personal room — this is how notify.js and the
    // message handlers below target "this specific user" regardless of
    // how many tabs/devices they have connected.
    socket.join(`user:${socket.userId}`);

    socket.on('send_message', async ({ recipientId, text, imageUrl }, callback) => {
      try {
        if (!recipientId || (!text && !imageUrl)) {
          return callback?.({ success: false, message: 'Recipient and content are required' });
        }

        const conversationId = buildConversationId(socket.userId, recipientId);
        const message = await Message.create({
          conversationId,
          sender: socket.userId,
          recipient: recipientId,
          text: text?.trim() || '',
          imageUrl: imageUrl || '',
        });

        const payload = {
          _id: message._id,
          conversationId,
          sender: socket.userId,
          recipient: recipientId,
          text: message.text,
          imageUrl: message.imageUrl,
          isRead: false,
          createdAt: message.createdAt,
        };

        // Deliver to the recipient's room and echo back to the sender's
        // other connected devices/tabs, so every client stays in sync.
        ioInstance.to(`user:${recipientId}`).emit('receive_message', payload);
        ioInstance.to(`user:${socket.userId}`).emit('receive_message', payload);

        callback?.({ success: true, message: payload });
      } catch (error) {
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on('typing', ({ recipientId, isTyping }) => {
      if (!recipientId) return;
      ioInstance.to(`user:${recipientId}`).emit('typing', {
        senderId: socket.userId,
        isTyping: !!isTyping,
      });
    });

    socket.on('mark_read', async ({ conversationId }) => {
      if (!conversationId) return;
      await Message.updateMany(
        { conversationId, recipient: socket.userId, isRead: false },
        { isRead: true }
      );

      // The conversationId is "<idA>_<idB>" sorted — the other participant
      // is whichever half isn't the current user, so we can notify exactly
      // them that their sent messages were seen.
      const [idA, idB] = conversationId.split('_');
      const otherUserId = idA === socket.userId ? idB : idA;
      if (otherUserId) {
        ioInstance.to(`user:${otherUserId}`).emit('messages_read', {
          conversationId,
          readBy: socket.userId,
        });
      }
    });
  });

  return ioInstance;
};

/**
 * Emits an event to a specific user's room from anywhere in the app
 * (e.g. the notify() helper). Safe to call before the socket server has
 * initialized — it's a no-op rather than a crash, since notifications
 * must still work even if sockets are unavailable.
 */
const emitToUser = (userId, event, payload) => {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
};

module.exports = { initSocket, emitToUser, buildConversationId };
