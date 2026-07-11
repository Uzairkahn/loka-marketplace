const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { uploadMany, deleteMany } = require('../utils/cloudinaryUpload');
const { paginate, buildPaginationMeta } = require('../utils/pagination');
const { CATEGORIES } = require('../validators/listing.validator');

// @route  GET /api/listings/meta/category-counts
// @access Public
// Real counts of active listings per category, for the landing page's
// category grid — replaces what used to be hardcoded placeholder numbers.
const getCategoryCounts = asyncHandler(async (req, res) => {
  const counts = await Listing.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const countByCategory = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  const categories = CATEGORIES.map((name) => ({ name, count: countByCategory[name] || 0 }));

  res.status(200).json({ success: true, categories });
});

// @route  POST /api/listings
// @access Private
const createListing = asyncHandler(async (req, res) => {
  const { type, title, description, category, price, city, country, deliveryTime } = req.body;

  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('At least one image is required');
  }

  const uploaded = await uploadMany(req.files, `loka/listings/${req.user._id}`);

  // availability arrives as a JSON-stringified array from multipart form-data.
  let availability;
  if (req.body.availability) {
    try {
      availability = JSON.parse(req.body.availability);
    } catch {
      throw ApiError.badRequest('Availability must be a valid JSON array of days');
    }
  }

  const listing = await Listing.create({
    owner: req.user._id,
    type,
    title,
    description,
    category,
    price,
    images: uploaded,
    location: { city: city || '', country: country || '' },
    ...(type === 'service' && { deliveryTime, availability }),
  });

  res.status(201).json({ success: true, listing });
});

// @route  GET /api/listings
// @access Public
// Supports: keyword search, category, type, price range, city, sort, pagination.
const getListings = asyncHandler(async (req, res) => {
  const { keyword, category, type, minPrice, maxPrice, city, sort } = req.query;
  const { page, limit, skip } = paginate(req.query);

  const filter = { status: 'active' };
  if (keyword) filter.$text = { $search: keyword };
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (city) filter['location.city'] = new RegExp(city, 'i');
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { ratingAverage: -1 },
  };
  const sortOption = sortMap[sort] || sortMap.newest;

  const [listings, totalCount] = await Promise.all([
    Listing.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('owner', 'fullName avatarUrl ratingAverage'),
    Listing.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    listings,
    pagination: buildPaginationMeta(page, limit, totalCount),
  });
});

// @route  GET /api/listings/mine
// @access Private
const getMyListings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);

  const filter = { owner: req.user._id };
  const [listings, totalCount] = await Promise.all([
    Listing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Listing.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    listings,
    pagination: buildPaginationMeta(page, limit, totalCount),
  });
});

// @route  GET /api/listings/favorites
// @access Private
const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'favorites',
    match: { status: 'active' },
    populate: { path: 'owner', select: 'fullName avatarUrl ratingAverage' },
  });

  res.status(200).json({ success: true, listings: user.favorites });
});

// @route  GET /api/listings/:id
// @access Public
const getListingById = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate(
    'owner',
    'fullName avatarUrl bio ratingAverage ratingCount location'
  );

  if (!listing) throw ApiError.notFound('Listing not found');

  res.status(200).json({ success: true, listing });
});

const ensureOwnerOrAdmin = (listing, user) => {
  const isOwner = listing.owner.toString() === user._id.toString();
  if (!isOwner && user.role !== 'admin') {
    throw ApiError.forbidden('You do not have permission to modify this listing');
  }
};

// @route  PUT /api/listings/:id
// @access Private (owner or admin)
const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw ApiError.notFound('Listing not found');
  ensureOwnerOrAdmin(listing, req.user);

  const editableFields = ['title', 'description', 'category', 'price', 'deliveryTime'];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) listing[field] = req.body[field];
  });

  if (req.body.city !== undefined || req.body.country !== undefined) {
    listing.location = {
      city: req.body.city ?? listing.location.city,
      country: req.body.country ?? listing.location.country,
    };
  }

  // Admin-only: status changes (approve/remove) go through this same route
  // guarded by role, rather than a separate admin endpoint duplicating the logic.
  if (req.body.status && req.user.role === 'admin') {
    listing.status = req.body.status;
  }

  // New images, if provided, are appended; removing individual images is
  // handled by `removedImageIds` (comma-separated publicIds) from the client.
  if (req.files && req.files.length > 0) {
    const uploaded = await uploadMany(req.files, `loka/listings/${req.user._id}`);
    listing.images.push(...uploaded);
  }

  if (req.body.removedImageIds) {
    const idsToRemove = req.body.removedImageIds.split(',').filter(Boolean);
    if (idsToRemove.length) {
      await deleteMany(idsToRemove);
      listing.images = listing.images.filter((img) => !idsToRemove.includes(img.publicId));
    }
  }

  if (listing.images.length === 0) {
    throw ApiError.badRequest('A listing must have at least one image');
  }

  await listing.save();
  res.status(200).json({ success: true, listing });
});

// @route  DELETE /api/listings/:id
// @access Private (owner or admin)
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw ApiError.notFound('Listing not found');
  ensureOwnerOrAdmin(listing, req.user);

  await deleteMany(listing.images.map((img) => img.publicId));
  await listing.deleteOne();

  res.status(200).json({ success: true, message: 'Listing deleted' });
});

// @route  POST /api/listings/:id/favorite
// @access Private
// Toggles the listing in the user's favorites array.
const toggleFavorite = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw ApiError.notFound('Listing not found');

  const user = await User.findById(req.user._id);
  const index = user.favorites.findIndex((id) => id.toString() === listing._id.toString());

  let isFavorited;
  if (index === -1) {
    user.favorites.push(listing._id);
    listing.favoritesCount += 1;
    isFavorited = true;
  } else {
    user.favorites.splice(index, 1);
    listing.favoritesCount = Math.max(listing.favoritesCount - 1, 0);
    isFavorited = false;
  }

  await Promise.all([user.save(), listing.save()]);
  res.status(200).json({ success: true, isFavorited, favoritesCount: listing.favoritesCount });
});

module.exports = {
  createListing,
  getListings,
  getMyListings,
  getFavorites,
  getListingById,
  updateListing,
  deleteListing,
  toggleFavorite,
  getCategoryCounts,
};
