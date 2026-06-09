import { v2 as cloudinary } from 'cloudinary';
import config from '../configurations/config.js';

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

/**
 * Uploads an image buffer to Cloudinary.
 *
 * @param {Buffer} buffer - Image buffer from multer memory storage.
 * @param {string} publicId - Desired public ID for the asset (filename without extension).
 * @param {string} folder - Cloudinary folder path (e.g. 'made-in-cameroon/products').
 * @param {Object} [options] - Optional overrides (width, height, crop, quality).
 * @param {number} [options.width=640]
 * @param {number} [options.height=640]
 * @param {string} [options.crop='fill']
 * @param {number} [options.quality=90]
 * @returns {Promise<string>} Secure URL of the uploaded image.
 *
 * @example
 * // Product image
 * const url = await uploadToCloudinary(buffer, 'product-123-cover', 'made-in-cameroon/products');
 *
 * @example
 * // User photo
 * const url = await uploadToCloudinary(buffer, 'user-456-photo', 'made-in-cameroon/users');
 *
 * @example
 * // Store logo with custom dimensions
 * const url = await uploadToCloudinary(buffer, 'store-789-logo', 'made-in-cameroon/stores', { width: 300, height: 300 });
 */
export const uploadToCloudinary = (buffer, publicId, folder, options = {}) => {
  const { width = 640, height = 640, crop = 'fill', quality = 90 } = options;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite: true,
        format: 'jpeg',
        transformation: [{ width, height, crop, quality }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Deletes an image from Cloudinary by its full public ID (including folder path).
 *
 * @param {string} publicId - Full Cloudinary public ID including folder prefix.
 * @returns {Promise<Object>} Cloudinary deletion result.
 *
 * @example
 * await deleteFromCloudinary('made-in-cameroon/products/product-123-cover');
 */
export const deleteFromCloudinary = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
