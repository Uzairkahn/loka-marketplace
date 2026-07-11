const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'booking_request',
        'booking_status_update',
        'new_message',
        'new_review',
        'listing_approved',
        'listing_removed',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String, // relative frontend path to deep-link to, e.g. /bookings/:id
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
