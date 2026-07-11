const cloudinary = require('../config/cloudinary');

/**
 * Streams a single in-memory buffer to Cloudinary. Wrapped in a Promise
 * since Cloudinary's upload_stream is callback-based.
 */
const uploadBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });

/**
 * Uploads multiple files in parallel. If any single upload fails, the
 * successful ones that already landed on Cloudinary are cleaned up so we
 * don't leave orphaned assets behind from a partially-failed request.
 */
const uploadMany = async (files, folder) => {
  const uploaded = [];
  try {
    for (const file of files) {
      // Sequential, not Promise.all — keeps memory bounded when someone
      // uploads the max 6 large images at once.
      // eslint-disable-next-line no-await-in-loop
      uploaded.push(await uploadBuffer(file.buffer, folder));
    }
    return uploaded;
  } catch (error) {
    await deleteMany(uploaded.map((u) => u.publicId));
    throw error;
  }
};

const deleteMany = async (publicIds = []) => {
  if (!publicIds.length) return;
  await Promise.allSettled(publicIds.map((id) => cloudinary.uploader.destroy(id)));
};

module.exports = { uploadBuffer, uploadMany, deleteMany };
