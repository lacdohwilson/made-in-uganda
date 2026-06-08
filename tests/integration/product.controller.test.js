import { expect } from 'expect';
import Product from '../../models/product.model.js';
import User from '../../models/user.model.js';
import {
  api,
  BASE_URL,
  createUser,
  getHeader,
  closeServer,
} from '../config/index.js';
import GenRandomVal from '../utilities/genRandVal.js';
import UnitTestBases from '../utilities/unitTestBases.js';
import Category from '../../models/category.model.js';

const URL = `${BASE_URL}/products`;
const PATH_TO_FILE = '../../dev-data/images';

const CONST_MIN = Number(10);
const CONST_MAX = Number(30);

describe('ProductController_Test', () => {
  let user;
  let header;
  let categoryId;
  before(async () => {
    // Delete all users before test begins
    await User.deleteMany({});

    // Create a normal user
    user = await createUser();

    // Create a category
    const category = await Category.create(
      UnitTestBases.GenRandomValidCategory()
    );
    categoryId = category._id.toString(); // convert id to string

    // Get header
    header = getHeader(user);
  });
  afterEach(async () => {
    // Delete all Category
    await Category.deleteMany({});

    // Delete all products
    await Product.deleteMany({});
  });
  after(async () => {
    // Delete all users first
    await User.deleteMany({});
    // Close server
    closeServer();
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * ***************CREATE PRODUCT TESTS**********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`POST ${URL}`, () => {
    it('Test_create-product It should return 201 for successfully created', async () => {
      // 1. Generate random valid product
      const product = UnitTestBases.GenRandomValidProduct(user._id, categoryId);

      // 2. Send request
      const res = await api
        .post(`${URL}`)
        .send(product)
        .set('Authorization', header);

      // 3. Expect results
      expect(res.status).toBe(201);
      const { data } = JSON.parse(res.text);
      expect(data.doc).toHaveProperty('_id');
      expect(data.doc).toHaveProperty('store');
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * ***************PATCH PRODUCT TESTS**********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`PATCH ${URL}/:id`, () => {
    it('Test_UpdateProduct It should return 404 for not found', async () => {
      // 1. Generate valid mongo id
      const id = GenRandomVal.GenRandomValidID();

      // 2. Send request
      const res = await api.patch(`${URL}/${id}`).set('Authorization', header);

      // 3. Expect result
      expect(res.status).toBe(404);
    });
    it('Test_UpdateProduct It should return 200 if the product is successfully updated', async () => {
      // 1. Generate product
      const genProduct = UnitTestBases.GenRandomValidProduct(
        user._id,
        categoryId
      );

      // 2. Create product
      const product = await Product.create(genProduct);

      // 3. Generate product update
      const productUpdate = UnitTestBases.GenRandomValidProduct(
        user._id,
        categoryId
      );

      productUpdate.price.value = 5000;
      productUpdate.priceDiscount = 350;

      // 4. Get product id
      const id = product._id;

      // 5. Send request
      const res = await api
        .patch(`${URL}/${id}`)
        .field(productUpdate)
        .attach('imageCover', `${PATH_TO_FILE}/${product.imageCover}`)
        .set('Authorization', header);

      // 6. Expect result
      expect(res.status).toBe(200);
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * ***************GET ALL PRODUCTS TESTS**********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`GET ${URL}`, () => {
    it('Test_GetAllProducts It should return 200 with an empty array', async () => {
      // 1. Send Request
      const res = await api.get(`${URL}`);

      // 2. Expect result
      expect(res.status).toBe(200);
      const data = JSON.parse(res.text);
      expect(data.results).toEqual(0);
    });
    it('Test_GetAllProducts It should return 200 with array of products', async () => {
      // 1. Generate random products
      const products = UnitTestBases.GenRandomValidProducts(
        GenRandomVal.GenRandomIntegerInRange(CONST_MIN, CONST_MAX),
        user._id,
        categoryId
      );

      // 2. Create products in Product collection
      await Product.insertMany(products);

      // 3. Send Request
      const res = await api.get(`${URL}`).set('Authorization', header);

      // 4. Expect result
      expect(res.status).toBe(200);
      const data = JSON.parse(res.text);
      expect(data.results).toEqual(products.length);
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * ******************GET PRODUCT TEST************************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`PATCH ${URL}/:id`, () => {
    it('Test_GetProduct It should return 404 for no found', async () => {
      // 1. Generate random mongo ID
      const id = GenRandomVal.GenRandomValidID();

      // 2. Send request with invalid id
      const res = await api.get(`${URL}/${id}`);

      // 3. Expect results
      expect(res.status).toBe(404);
    });
    it('Test_GetProduct It should return 200 if the product is successfully found', async () => {
      // 1. Generate random product
      const genProduct = UnitTestBases.GenRandomValidProduct(
        user._id,
        categoryId
      );

      // 2. Save product and get ID
      const product = await Product.create(genProduct);

      // 3. Send request to get product
      const res = await api
        .get(`${URL}/${product._id}`)
        .set('Authorization', header);

      // 4. Expect results
      expect(res.status).toBe(200);
      const { data } = JSON.parse(res.text);
      expect(data).toHaveProperty('_id');
      expect(data).toHaveProperty('store');
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * ******************DeLETE PRODUCT TEST**********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`DELETE ${URL}/:id`, () => {
    it('Test_DeleteProduct It should return 404 for not found', async () => {
      // 1. Generate random mongo ID
      const id = GenRandomVal.GenRandomValidID();

      // 2. Send request with invalid id
      const res = await api.delete(`${URL}/${id}`).set('Authorization', header);

      // 3. Expect results
      expect(res.status).toBe(404);
    });
    it('Test_DeleteProduct It should return 204 for the product successfully deleted', async () => {
      // 1. Generate random product
      const genProduct = UnitTestBases.GenRandomValidProduct(
        user._id,
        categoryId
      );

      // 2. Save product and get ID
      const product = await Product.create(genProduct);

      // . Send request to get product
      const res = await api
        .delete(`${URL}/${product._id}`)
        .set('Authorization', header);

      // 4. Expect results
      expect(res.status).toBe(204);
    });
  });
});
