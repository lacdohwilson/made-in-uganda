import { expect } from 'expect';
import Category from '../../models/category.model.js';
import {
  api,
  BASE_URL,
  createAdminUser,
  getHeader,
  closeServer,
} from '../config/index.js';
import GenRandomVal from '../utilities/genRandVal.js';
import UnitTestBases from '../utilities/unitTestBases.js';

const URL = `${BASE_URL}/categories`;
const MIN = Number(5);
const MAX = Number(100);
const CONST_ZEROU = Number(0);

describe('CategoryControllers_Tests', () => {
  let user;
  let header;
  before(async () => {
    // Delete all users first
    await Category.deleteMany({});

    // Create a admin user
    user = await createAdminUser();

    // Get header
    header = getHeader(user);
  });
  afterEach(async () => {
    // Delete all categories
    await Category.deleteMany({});
  });
  after(() => {
    // Close server
    closeServer();
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * ***************CREATE CATEGORY TESTS***********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`POST ${URL}`, () => {
    it('Test_CreateCatgory It should return 201 for category successfully created', async () => {
      // 1. Generate random valid category
      const category = UnitTestBases.GenRandomValidCategory();

      // 2. Send request
      const res = await api
        .post(`${URL}`)
        .send(category)
        .set('Authorization', header);

      // 3. Expect results
      expect(res.status).toBe(201);

      const { data } = JSON.parse(res.text);
      expect(data.doc).toHaveProperty('_id');
      expect(data.doc).toHaveProperty('name');
      expect(data.doc.name).toEqual(category.name);
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * ***************GET CATEGORY TESTS***********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`GET ${URL}/:id`, () => {
    it('Test_GetCategory It should return 404 for category not found', async () => {
      // 1. Generate mongo id
      const id = GenRandomVal.GenRandomValidID();

      // 2. Send request
      const res = await api.get(`${URL}/${id}`).set('Authorization', header);

      // 3. Expect result
      expect(res.status).toBe(404);
    });
    it('Test_GetCategory It should return 200 if the category is successfully found', async () => {
      // 1. Generate random valid category
      const genCategory = UnitTestBases.GenRandomValidCategory();

      // 2. Save category
      const newCategory = await Category.create(genCategory);

      // 3. Send request
      const res = await api
        .get(`${URL}/${newCategory._id}`)
        .set('Authorization', header);

      // 4. Expect result
      expect(res.status).toBe(200);
      const { data } = JSON.parse(res.text);
      expect(data.name).toEqual(newCategory.name);
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * *************GET ALL CATEGORIES TESTS**********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`GET ${URL}`, () => {
    it('Test_GetAllCategories It should return 200 with and empty array of categories', async () => {
      // 1. Send request
      const res = await api.get(`${URL}`).set('Authorization', header);

      // 2. Expect result
      expect(res.status).toBe(200);
      const { results } = JSON.parse(res.text);
      expect(results).toBe(CONST_ZEROU);
    });
    it('Test_GetAllCategories It should return 200 with array of values', async () => {
      // 1. Generate random valid categories
      const categories = UnitTestBases.GenRandomValidCategories(
        GenRandomVal.GenRandomIntegerInRange(MIN, MAX)
      );

      // 2. Insert categories
      await Category.insertMany(categories);

      // 3. Send request
      const res = await api.get(`${URL}`).set('Authorization', header);

      // 4. Expect result
      expect(res.status).toBe(200);
      const { results } = JSON.parse(res.text);
      expect(results).toBe(categories.length);
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * *************UPDATE CATEGORY TESTS**********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`PATCH ${URL}`, () => {
    it('Test_UpdateCategory It should return 404 category for not found', async () => {
      // 1. Generate random valid mongo id
      const id = GenRandomVal.GenRandomValidID();

      // 2. Send request
      const res = await api.patch(`${URL}/${id}`).set('Authorization', header);

      // 3. Expect result
      expect(res.status).toBe(404);
    });
    it('Test_UpdateCategory It should return 200 for category successfully updated', async () => {
      // 1. Generate random valid category
      const genCategory = UnitTestBases.GenRandomValidCategory();

      // 2. Create category
      const category = await Category.create(genCategory);

      // 3. Get category id
      const id = category._id.toString();

      // 4. Generate product update
      const updateCategory = UnitTestBases.GenRandomValidCategory();

      // 5. Send request
      const res = await api
        .patch(`${URL}/${id}`)
        .send(updateCategory)
        .set('Authorization', header);

      // 6. Expect result
      expect(res.status).toBe(200);
      const { data } = JSON.parse(res.text);
      expect(data.name).toBe(updateCategory.name);
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * *************DELETE CATEGORY TESTS**********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`DELETE ${URL}`, () => {
    it('Test_DeleteCategory It should return 404 for category not found', async () => {
      // 1. Generate random valid mongo id
      const id = GenRandomVal.GenRandomValidID();

      // 2. Send request
      const res = await api.delete(`${URL}/${id}`).set('Authorization', header);

      // 3. Expect result
      expect(res.status).toBe(404);
    });
    it('Test_DeleteCategory It should return 204 for category successfull deleted', async () => {
      // 1. Generate random valid category
      const genCategory = UnitTestBases.GenRandomValidCategory();

      // 2. Create category
      const category = await Category.create(genCategory);

      // 3. Get category id
      const id = category._id.toString();

      // 4. Send request
      const res = await api.delete(`${URL}/${id}`).set('Authorization', header);

      // 5. Expect result
      expect(res.status).toBe(204);
    });
  });
});
