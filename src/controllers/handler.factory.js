import { Types } from 'mongoose';
import AppError from '../utilities/appError.js';
import catchAsync from '../utilities/catchAsync.js';
import APIFeatures from '../utilities/apiFeatures.js';

/**
 * @breif Create a new document in a database collection
 * @param {Collection} Model -> Database collection
 * @returns {function}
 */
const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1. Create document
    const doc = await Model.create(req.body);

    // 2. Send resposne
    res.status(201).json({
      status: 'success',
      message: 'data saved',
      data: doc,
    });
  });

/**
 * @breif Get a single document in the database collection
 * using the parameter request id
 * @param {Collection} Model -> Database collection
 * @param {Object} popOptions -> Populate options
 * @returns {function}
 */
const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // 1. Get document
    let query = await Model.findById(req.params.id);

    // 2. Populate with options
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    // 3. Check if document exist's
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    // 4. Send response
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

/**
 * @breif Update a single a documnent in the collection, from the
 * request paramter id
 * @param {Collection} Model -> Database collection
 * @returns {function}
 */
const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new AppError('No document found with that ID!', 404));

    res.status(200).json({
      status: 'success',
      message: 'Resource updated!',
      data: doc,
    });
  });

/**
 * @breif Retrieve all document from a collection, documents are filtered, sorted,
 * limited and paginated
 * @param {Collection} Model -> Database collection
 * @returns {function}
 */
const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1. To allow for nested GET product & subcription o
    let filter = {};
    if (req.params.storeId) filter = { store: req.params.storeId };
    if (req.params.categoryId) filter = { category: req.params.categoryId };
    if (req.param.userId) filter = { user: req.params.userId };

    // 2. EXECUTE THE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    // 3. SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: docs,
    });
  });

/**
 * @breif Delete a single document in the database collection
 * NB: We set the status code here to 200 (OK) because we want the
 * deleted data returned.
 * @param {Collection} Model -> Database collection
 * @returns {function}
 */
const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1. Find document and delete
    const doc = await Model.findByIdAndDelete(req.params.id);

    // 2. Check if document exist's
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    // 3. Send the response
    res.status(200).json({
      status: 'success',
      message: 'Resource deleted!',
      data: doc,
    });
  });

const search = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1. Get the query
    const { q } = req.query;

    // 2. Get the results
    const results = await Model.find(
      { name: { $regex: q, $options: 'i' } },
      'name id'
    );

    // 3. Send the response
    res.status(200).json({
      status: 'success',
      data: results,
    });
  });

/**
 * @breif Query distinct data from a model
 * @param {Collection} Model Collection to get distinct items
 * @returns {Function}
 */
const getDistinct = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // 1. Build pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // 2. Build match stage
    let match = {};
    if (req.query.name) match.name = req.query.name;
    if (req.query.category)
      match.category = new Types.ObjectId(req.query.category);
    if (req.query.store) match.store = new Types.ObjectId(req.query.store);
    const matchStage = { $match: match };

    // 3. Build sample stage
    const sampleStage = { $sample: { size: limit } };

    // 4. Build skip stage
    const skipStage = { $skip: skip };

    // 5. Build aggregation pipeline
    const pipeline = [matchStage, skipStage, sampleStage];

    // 6. Perform population
    if (popOptions) {
      pipeline.push({ $lookup: popOptions }, { $unwind: '$' + popOptions.as });
    }

    // 7. Perform aggregation
    const docs = await Model.aggregate(pipeline);

    // 8. Send results
    res.status(200).json({
      status: 'success',
      data: docs,
    });
  });

/**
 * @brief Count the number of document in a collection
 * @param {Collection} Model  -> Model
 * @returns {Function}
 */
const getCount = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1. Build filter
    let filtered = {};
    if (req.params.storeId) filtered.store = req.params.storeId;
    if (req.params.categoryId) filtered.category = req.params.categoryId;

    // 2. Create search query
    const searchQuery = { ...filtered, ...req.query };

    // 3. Execute query
    const count = await Model.count(searchQuery);

    // 4. Send response
    res.status(200).json({
      status: 'success',
      data: count,
    });
  });

export default {
  createOne,
  getOne,
  updateOne,
  getAll,
  deleteOne,
  search,
  getDistinct,
  getCount,
};
