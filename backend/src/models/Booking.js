const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Preferred date is required'],
    },
    notes: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    priceAtBooking: {
      type: Number,
      required: true, // snapshot — protects the buyer if the seller edits the price later
    },
  },
  { timestamps: true }
);

bookingSchema.index({ buyer: 1, status: 1 });
bookingSchema.index({ seller: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
