import catchAsync from '../utils/catchAsync.js';
import Category from '../models/category.model.js';
import * as repo from '../services/base.service.js';

/**
 * @fileoverview Category controller.
 * Handles HTTP request/response for category resources.
 * All database operations are delegated to the base repository.
 */

/**
 * Creates a new category.
 * POST /api/v1/categories
 *
 * @type {import('express').RequestHandler}
 */
const createCategory = catchAsync(async (req, res) => {
  const doc = await repo.createOne(Category, req.body);

  res.status(201).json({
    status: 'success',
    message: 'Category created successfully',
    data: doc,
  });
});

/**
 * Retrieves a single category by ID, populated with its products.
 * GET /api/v1/categories/:id
 *
 * @type {import('express').RequestHandler}
 */
const getCategory = catchAsync(async (req, res) => {
  const doc = await repo.getOne(Category, req.params.id, {
    path: 'products',
    select: '-__v',
  });

  res.status(200).json({
    status: 'success',
    data: doc,
  });
});

/**
 * Retrieves all categories with filtering, sorting, field limiting, and pagination.
 * GET /api/v1/categories
 *
 * @type {import('express').RequestHandler}
 */
const getAllCategories = catchAsync(async (req, res) => {
  const docs = await repo.getAll(Category, {}, req.query);

  res.status(200).json({
    status: 'success',
    results: docs.length,
    data: docs,
  });
});

/**
 * Updates a single category by ID.
 * PATCH /api/v1/categories/:id
 *
 * @type {import('express').RequestHandler}
 */
const updateCategory = catchAsync(async (req, res) => {
  const doc = await repo.updateOne(Category, req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    message: 'Category updated successfully',
    data: doc,
  });
});

/**
 * Deletes a single category by ID.
 * DELETE /api/v1/categories/:id
 *
 * @type {import('express').RequestHandler}
 */
const deleteCategory = catchAsync(async (req, res) => {
  const doc = await repo.deleteOne(Category, req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Category deleted successfully',
    data: doc,
  });
});

/**
 * Searches categories by name using a case-insensitive match.
 * GET /api/v1/categories/search?q=electronics
 *
 * @type {import('express').RequestHandler}
 */
const searchCategory = catchAsync(async (req, res) => {
  const results = await repo.search(Category, req.query.q);

  res.status(200).json({
    status: 'success',
    results: results.length,
    data: results,
  });
});

/**
 * Returns the total count of categories, with optional filtering.
 * GET /api/v1/categories/count
 *
 * @type {import('express').RequestHandler}
 */
const getCategoryCount = catchAsync(async (req, res) => {
  const count = await repo.getCount(Category, {}, req.query);

  res.status(200).json({
    status: 'success',
    data: count,
  });
});

export default {
  createCategory,
  getCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  searchCategory,
  getCategoryCount,
};
