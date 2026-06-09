import catchAsync from '../utils/catchAsync.js';
import Product from '../models/product.model.js';
import upload from '../utils/upload.js';
import * as repo from '../services/base.service.js';
import { imageUploadQueue } from '../queues/imageUpload.queue.js';
import logger from '../utils/logger.js';

/**
 * Injects the store ID from the authenticated user into req.body.
 * Used for nested routes where store is not explicitly provided.
 * @type {import('express').RequestHandler}
 */
const setProductStore = (req, res, next) => {
  if (!req.body.store) req.body.store = req.user.store.id;
  next();
};

/**
 * Sets the storeId route param from the authenticated user's store.
 * Enables reuse of factory handlers on nested store routes.
 * @type {import('express').RequestHandler}
 */
const setStoreParam = (req, res, next) => {
  req.params.storeId = req.user.store.id;
  next();
};

/**
 * Multer middleware to accept imageCover (1) and images (up to 10)
 * as multipart/form-data fields. Files are held in memory as buffers.
 * @type {import('express').RequestHandler}
 */
const uploadProductImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

/**
 * Alias middleware for top discounted products.
 * Pre-fills query params before getAll handler runs.
 * GET /api/v1/products/top-deals
 * @type {import('express').RequestHandler}
 */
const aliasTopProducts = (req, res, next) => {
  req.query.limit = '6';
  req.query.sort = '-percentageDiscount';
  req.query.fields =
    'price,priceDiscount,percentageDiscount,currency,name,imageCover';
  next();
};

/**
 * Creates a new product, then enqueues an image upload job if files are present.
 * Images are not immediately available — they are uploaded asynchronously via BullMQ.
 * POST /api/v1/products
 * @type {import('express').RequestHandler}
 */
const createProduct = catchAsync(async (req, res) => {
  const doc = await repo.createOne(Product, req.body);

  if (req.files) {
    const jobData = buildImageJobData(doc._id.toString(), req);
    await imageUploadQueue.add('upload-product-images', jobData);
    logger.info(`Image upload job queued for new product ${doc._id}`);
  }

  res.status(201).json({
    status: 'success',
    message: 'Product created. Images are being processed.',
    data: doc,
  });
});

/**
 * Retrieves a single product by ID, populated with its store.
 * GET /api/v1/products/:id
 * @type {import('express').RequestHandler}
 */
const getProduct = catchAsync(async (req, res) => {
  const doc = await repo.getOne(Product, req.params.id, { path: 'store' });
  res.status(200).json({ status: 'success', data: doc });
});

/**
 * Retrieves all products with filtering, sorting, field limiting, and pagination.
 * GET /api/v1/products
 * @type {import('express').RequestHandler}
 */
const getAllProducts = catchAsync(async (req, res) => {
  const filter = {};
  if (req.params.storeId) filter.store = req.params.storeId;
  if (req.params.categoryId) filter.category = req.params.categoryId;

  const docs = await repo.getAll(Product, filter, req.query);
  res.status(200).json({ status: 'success', results: docs.length, data: docs });
});

/**
 * Updates a product's data fields (not images).
 * PATCH /api/v1/products/:id
 * @type {import('express').RequestHandler}
 */
const updateProduct = catchAsync(async (req, res) => {
  const doc = await repo.updateOne(Product, req.params.id, req.body);
  res
    .status(200)
    .json({ status: 'success', message: 'Product updated!', data: doc });
});

/**
 * Deletes a product by ID.
 * DELETE /api/v1/products/:id
 * @type {import('express').RequestHandler}
 */
const deleteProduct = catchAsync(async (req, res) => {
  const doc = await repo.deleteOne(Product, req.params.id);
  res
    .status(200)
    .json({ status: 'success', message: 'Resource deleted!', data: doc });
});

/**
 * Searches products by name using a case-insensitive match.
 * GET /api/v1/products/search?q=shoes
 * @type {import('express').RequestHandler}
 */
const searchProduct = catchAsync(async (req, res) => {
  const results = await repo.search(Product, req.query.q);
  res
    .status(200)
    .json({ status: 'success', results: results.length, data: results });
});

/**
 * Returns total product count, optionally filtered by store or category.
 * GET /api/v1/products/count
 * @type {import('express').RequestHandler}
 */
const getProductCount = catchAsync(async (req, res) => {
  const filter = {};
  if (req.params.storeId) filter.store = req.params.storeId;
  if (req.params.categoryId) filter.category = req.params.categoryId;

  const count = await repo.getCount(Product, filter, req.query);
  res.status(200).json({ status: 'success', data: count });
});

/**
 * Returns a randomised distinct sample of products with store details.
 * GET /api/v1/products/distinct
 * @type {import('express').RequestHandler}
 */
const getDistinctProducts = catchAsync(async (req, res) => {
  const docs = await repo.getDistinct(Product, req.query, {
    from: 'stores',
    localField: 'store',
    foreignField: '_id',
    as: 'store',
  });
  res.status(200).json({ status: 'success', data: docs });
});

/**
 * Enqueues an image update job for an existing product.
 * Responds immediately — images are updated asynchronously.
 * PATCH /api/v1/products/:id/images
 * @type {import('express').RequestHandler}
 */
const saveProductImages = catchAsync(async (req, res) => {
  if (!req.files) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'No images provided' });
  }

  const jobData = buildImageJobData(req.params.id, req);
  await imageUploadQueue.add('update-product-images', jobData);
  logger.info(`Image update job queued for product ${req.params.id}`);

  res.status(202).json({
    status: 'success',
    message: 'Image update accepted and is being processed.',
  });
});

/**
 * Returns the top 9 stores ranked by product count.
 * GET /api/v1/products/top-stores
 * @type {import('express').RequestHandler}
 */
const getTopStores = catchAsync(async (req, res) => {
  const docs = await Product.aggregate([
    { $group: { _id: '$store', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 9 },
    {
      $lookup: {
        from: 'stores',
        localField: '_id',
        foreignField: '_id',
        as: 'store',
      },
    },
    { $unwind: '$store' },
    { $project: { name: '$store.name', logo: '$store.logo', id: '$store.id' } },
  ]);

  res.status(200).json({ status: 'success', data: docs });
});

/**
 * Builds the BullMQ job payload from multer file buffers.
 * Converts buffers to plain arrays so they can be serialised into Redis.
 *
 * @param {string} productId - The product document ID
 * @param {import('express').Request} req - Express request with req.files
 * @returns {{
 *   productId: string,
 *   imageCover: { buffer: number[], publicId: string } | null,
 *   images: Array<{ buffer: number[], publicId: string }>
 * }}
 */
const buildImageJobData = (productId, req) => {
  const timestamp = Date.now();

  const imageCover = req.files?.imageCover?.[0]
    ? {
        buffer: Array.from(req.files.imageCover[0].buffer),
        publicId: `product-${productId}-${timestamp}-cover`,
      }
    : null;

  const images = (req.files?.images || []).map((file, i) => ({
    buffer: Array.from(file.buffer),
    publicId: `product-${productId}-${timestamp}-${i + 1}`,
  }));

  return {
    productId,
    imageCover,
    images,
    folder: CLOUDINARY_FOLDERS.PRODUCTS,
    dimensions: CLOUDINARY_DIMENSIONS.PRODUCT,
  };
};

export default {
  setProductStore,
  setStoreParam,
  aliasTopProducts,
  uploadProductImages,
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  searchProduct,
  getProductCount,
  getDistinctProducts,
  saveProductImages,
  getTopStores,
};
