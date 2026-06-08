import sharp from 'sharp';

import Product from '../models/product.model.js';
import factory from './handler.factory.js';
import upload from '../utilities/upload.js';
import catchAsync from '../utilities/catchAsync.js';

const setProductStore = (req, res, next) => {
  // Allow for nested routes
  if (!req.body.store) req.body.store = req.user.store.id;
  next();
};
/**
 * @breif Set Store parameter
 * @param {Request} req Request
 * @param {Response} res Response
 * @param {Function} next Next
 */
const setStoreParam = (req, res, next) => {
  // For nested route
  req.params.storeId = req.user.store.id;
  next();
};

/**
 * @breif Middleware to upload a product imageCover and images
 */
const uploadProductImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

/**
 * @breif Resize product images to size 640x640 and convert format to jpeg
 * then product image in folder public/images/products
 */
const resizeProductImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  // 1) Cover image
  req.body.imageCover = `product-${
    req.params.id || req.user.store.id
  }-${Date.now()}-cover.jpeg`; // Set image cover name field

  //Upload image
  await sharp(req.files.imageCover[0].buffer)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/images/products/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];
  if (req.files.images.length > 0) {
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `product-${
          req.params.id || req.user.store.id
        }-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/images/products/${filename}`);

        req.body.images.push(filename);
      })
    );
  }

  next();
});

const aliasTopProducts = (req, res, next) => {
  req.query.limit = '6';
  req.query.sort = '-percentageDiscount';
  req.query.fields =
    'price,priceDiscount,percentageDiscount,currency,name,imageCover';
  next();
};

/**
 * @breif Update store product images
 */
const saveProductImages = catchAsync(async (req, res, next) => {
  // 1. Get Product
  const product = await Product.findById(req.params.id);

  // 2. Save new images
  product.imageCover = req.body.imageCover;
  product.images = req.body.images;
  await product.save({ validateBeforeSave: false });

  // 3. Send response
  res.status(200).json({
    status: 'success',
    message: 'Product images changed!',
    data: product,
  });
});

const getTopStores = catchAsync(async (req, res, next) => {
  // 1. Get stores with highest number of products
  const docs = await Product.aggregate([
    {
      $group: {
        _id: '$store',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 9,
    },
    {
      $lookup: {
        from: 'stores',
        localField: '_id',
        foreignField: '_id',
        as: 'store',
      },
    },
    {
      $unwind: '$store',
    },
    {
      $project: {
        name: '$store.name',
        logo: '$store.logo',
        id: '$store.id',
      },
    },
  ]);

  // 2. Send Response
  res.status(200).json({
    status: 'success',
    data: docs,
  });
});

export default {
  setProductStore,
  setStoreParam,
  aliasTopProducts,
  uploadProductImages,
  resizeProductImages,
  saveProductImages,
  createProduct: factory.createOne(Product),
  getAllProducts: factory.getAll(Product),
  updateProduct: factory.updateOne(Product),
  getProduct: factory.getOne(Product, { path: 'store' }),
  deleteProduct: factory.deleteOne(Product),
  searchProduct: factory.search(Product),
  getProductCount: factory.getCount(Product),
  getDistinctProducts: factory.getDistinct(Product, {
    from: 'stores',
    localField: 'store',
    foreignField: '_id',
    as: 'store',
  }),
  getTopStores,
};
