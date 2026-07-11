const multer = require('multer');
const ApiError = require('../utils/ApiError');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 5;

/**
 * Memory storage — files stay as buffers in RAM and are streamed straight
 * to Cloudinary in the controller, so nothing ever touches this server's
 * disk. Fine at this scale; a heavier-traffic version would offload
 * directly from the client via signed upload URLs instead.
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(ApiError.badRequest('Only JPEG, PNG, or WEBP images are allowed'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, files: 6 },
});

module.exports = upload;
