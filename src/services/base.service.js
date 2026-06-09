import { Types } from 'mongoose';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';

/**
 * Creates a single document in the given collection.
 * @param {Model} Model - Mongoose model
 * @param {Object} data - Data to insert
 * @returns {Promise<Document>}
 */
export const createOne = async (Model, data) => {
  return await Model.create(data);
};

/**
 * Finds a single document by ID, with optional population.
 * @param {Model} Model - Mongoose model
 * @param {string} id - Document ID
 * @param {Object} [popOptions] - Mongoose populate options
 * @returns {Promise<Document>}
 * @throws {AppError} 404 - If no document is found
 */
export const getOne = async (Model, id, popOptions) => {
  let query = Model.findById(id);

  if (popOptions) query = query.populate(popOptions);

  const doc = await query;

  if (!doc) throw new AppError('No document found with that ID', 404);

  return doc;
};

/**
 * Updates a single document by ID.
 * @param {Model} Model - Mongoose model
 * @param {string} id - Document ID
 * @param {Object} data - Update payload
 * @returns {Promise<Document>}
 * @throws {AppError} 404 - If no document is found
 */
export const updateOne = async (Model, id, data) => {
  const doc = await Model.findOneAndUpdate({ _id: id }, data, {
    new: true,
    runValidators: true,
  });

  if (!doc) throw new AppError('No document found with that ID!', 404);

  return doc;
};

/**
 * Retrieves all documents with filtering, sorting, field limiting, and pagination.
 * @param {Model} Model - Mongoose model
 * @param {Object} filter - Base filter (e.g. { store: storeId })
 * @param {Object} query - Express req.query object
 * @returns {Promise<Document[]>}
 */
export const getAll = async (Model, filter = {}, query = {}) => {
  const features = new APIFeatures(Model.find(filter), query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  return await features.query;
};

/**
 * Deletes a single document by ID.
 * @param {Model} Model - Mongoose model
 * @param {string} id - Document ID
 * @returns {Promise<Document>}
 * @throws {AppError} 404 - If no document is found
 */
export const deleteOne = async (Model, id) => {
  const doc = await Model.findByIdAndDelete(id);

  if (!doc) throw new AppError('No document found with that ID', 404);

  return doc;
};

/**
 * Searches documents by name using a case-insensitive regex.
 * @param {Model} Model - Mongoose model
 * @param {string} q - Search query string
 * @returns {Promise<Document[]>}
 */
export const search = async (Model, q) => {
  return await Model.find({ name: { $regex: q, $options: 'i' } }, 'name id');
};

/**
 * Retrieves a distinct randomised sample of documents using aggregation.
 * @param {Model} Model - Mongoose model
 * @param {Object} queryParams - Express req.query object
 * @param {Object} [popOptions] - Mongoose $lookup options
 * @returns {Promise<Document[]>}
 */
export const getDistinct = async (Model, queryParams = {}, popOptions) => {
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 12;
  const skip = (page - 1) * limit;

  let match = {};
  if (queryParams.name) match.name = queryParams.name;
  if (queryParams.category)
    match.category = new Types.ObjectId(queryParams.category);
  if (queryParams.store) match.store = new Types.ObjectId(queryParams.store);

  const pipeline = [
    { $match: match },
    { $skip: skip },
    { $sample: { size: limit } },
  ];

  if (popOptions) {
    pipeline.push({ $lookup: popOptions }, { $unwind: '$' + popOptions.as });
  }

  return await Model.aggregate(pipeline);
};

/**
 * Counts documents in a collection matching the given filter.
 * @param {Model} Model - Mongoose model
 * @param {Object} filter - Filter object
 * @param {Object} queryParams - Additional query filters from req.query
 * @returns {Promise<number>}
 */
export const getCount = async (Model, filter = {}, queryParams = {}) => {
  const searchQuery = { ...filter, ...queryParams };

  return await Model.countDocuments(searchQuery);
};
