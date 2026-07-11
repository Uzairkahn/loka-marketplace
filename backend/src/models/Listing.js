const mongoose = require('mongoose');

/**
 * A single collection backs both "product" and "service" listings via the
 * `type` discriminator. They share ~90% of their fields (title, price,
 * images, category, owner, status), and modelling them separately would
 * duplicate the search/filter/pagination logic for no real benefit.
 * Service-only fields (deliveryTime, availability) are simply left unset
 * on product documents.
 */
const listingSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['product', 'service'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 3000,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    location: {
      city: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    // --- service-specific fields ---
    deliveryTime: {
      type: String, // e.g. "3-5 days" — free text is deliberate, sellers phrase this differently
    },
    availability: {
      type: [String], // e.g. ["Mon", "Wed", "Fri"]
      default: undefined,
    },
    portfolioImages: [
      {
        url: String,
        publicId: String,
      },
    ],
    // --- shared metadata ---
    status: {
      type: String,
      enum: ['pending', 'active', 'removed'],
      default: 'active',
      index: true,
    },
    favoritesCount: {
      type: Number,
      default: 0,
    },
    ratingAverage: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Supports keyword search across title/description/category.
listingSchema.index({ title: 'text', description: 'text', category: 'text' });
// Supports the common "latest active listings in category X" query pattern.
listingSchema.index({ status: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model('Listing', listingSchema);
