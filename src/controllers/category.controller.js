import Category from '../models/category.model.js';
import factory from './handler.factory.js';

/**
 * @breif Controllers for category
 */
export default {
  createCategory: factory.createOne(Category),
  getCategory: factory.getOne(Category, { path: 'products', select: '-__v' }),
  getAllCategories: factory.getAll(Category),
  updateCategory: factory.updateOne(Category),
  deleteCategory: factory.deleteOne(Category),
  searchCategory: factory.search(Category),
  getCategoryCount: factory.getCount(Category),
};
