import sharp from 'sharp';
import Store from '../models/store.model.js';
import factory from './handler.factory.js';
import upload from '../utilities/upload.js';
import catchAsync from '../utilities/catchAsync.js';

/**
 * @bref Set parameter id in getting current user store
 */
const getMyStore = (req, res, next) => {
  req.params.id = req.user.store.id;
  next();
};

// Set store owner
const setStoreUser = (req, res, next) => {
  // Allowed for nested routes
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// Upload store logo
const uploadStoreLogo = upload.single('logo');

// Resize store logo
const resizeStoreLogo = catchAsync(async (req, res, next) => {
  // 1. Check if file is present
  if (!req.file) return next();

  // 2. Change file name
  req.file.filename = `logo-${req.params.id}-${Date.now()}.png`;

  // 3. Upload and resize logo
  await sharp(req.file.buffer)
    .toFormat('png')
    .png({ quality: 90 })
    .toFile(`public/images/stores/${req.file.filename}`);

  // 4. Set filename on request body
  req.body.logo = req.file.filename;

  next();
});

const saveLogo = catchAsync(async (req, res, next) => {
  // 1. Get store
  const store = await Store.findById(req.params.id);

  // 2. Save new logo
  store.logo = req.body.logo;
  await store.save({ validateBeforeSave: false });

  // 3. Send back response
  res.status(200).json({
    status: 'success',
    message: 'Store logo changed!',
    data: store,
  });
});

export default {
  getMyStore, //  Get current user store
  setStoreUser, // Set store owner
  uploadStoreLogo, // Upload store logo
  resizeStoreLogo, // resize store logo
  saveLogo, // Save new store logo
  createStore: factory.createOne(Store), //  Create a new store
  getAllStores: factory.getAll(Store), // Get all stores
  getStore: factory.getOne(Store, { path: 'user', select: '-__v' }), // Get a store
  updateStore: factory.updateOne(Store), // Update a store
  deleteStore: factory.deleteOne(Store), // Delete a store
  searchStore: factory.search(Store), // Search a store
  getDistinctStores: factory.getDistinct(Store), // Get distinct stores
  getStoresCount: factory.getCount(Store), // Count stores
};
