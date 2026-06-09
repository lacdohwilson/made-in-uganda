import { Worker } from 'bullmq';
import Product from '../models/product.model.js';
import redisConnection from '../utils/redis.js';

const imageUploadWorker = new Worker(
  'image-upload',
  async (job) => {
    const { productId, imageCover, images, folder, dimensions } = job.data;

    const update = {};

    if (imageCover) {
      update.imageCover = await uploadToCloudinary(
        Buffer.from(imageCover.buffer),
        imageCover.publicId,
        folder,
        dimensions
      );
    }

    if (images?.length > 0) {
      update.images = await Promise.all(
        images.map(({ buffer, publicId }) =>
          uploadToCloudinary(Buffer.from(buffer), publicId, folder, dimensions)
        )
      );
    }

    await Product.findByIdAndUpdate(productId, update);
  },
  { connection: redisConnection }
);

export default imageUploadWorker;
