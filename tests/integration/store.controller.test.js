import { expect } from 'expect';
import Store from '../../models/store.model.js';
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

const URL = `${BASE_URL}/stores`;
const MIN = Number(5);
const MAX = Number(100);
const CONST_ONEU = Number(1);
const CONST_ZEROU = Number(0);

describe('StoreControllers_Tests', () => {
  let user;
  let header;
  let userId;
  before(async () => {
    // Delete all users first
    await Store.deleteMany({});

    // Create a user
    user = await createUser();

    // Get Id as a string
    userId = user._id.toString();

    // Get header
    header = getHeader(user);
  });
  afterEach(async () => {
    // Delete all categories
    await Store.deleteMany({});
  });
  after(() => {
    // Close server
    closeServer();
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * ******************CREATE STORE TESTS***********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`POST ${URL}`, () => {
    it('Test_CreateStore It should return 201 for store successfully created', async () => {
      // 1. Generate random valid store
      const store = UnitTestBases.GenRandomValidStore(userId);

      // 2. Send request
      const res = await api
        .post(`${URL}`)
        .send(store)
        .set('Authorization', header);

      // 3. Expect results
      expect(res.status).toBe(201);

      const { data } = JSON.parse(res.text);
      expect(data.doc).toHaveProperty('_id');
      expect(data.doc).toHaveProperty('name');
      expect(data.doc.name).toEqual(store.name);
      expect(data.doc.owner).toEqual(user._id.toString());
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * *****************GET ALL STORES TESTS**********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`GET ${URL}`, () => {
    it('Test_GetAllStores It should return 200 with and empty array of stored', async () => {
      // 1. Send request
      const res = await api.get(`${URL}`).set('Authorization', header);

      // 2. Expect result
      expect(res.status).toBe(200);
      const { results } = JSON.parse(res.text);
      expect(results).toBe(CONST_ZEROU);
    });
    it('Test_GetAllStores It should return 200 with array of values', async () => {
      // 1. Generate random valid integer
      const num = GenRandomVal.GenRandomIntegerInRange(CONST_ONEU, MAX);

      // 2. Generate random valid users with password
      const genUsers = UnitTestBases.GenRandValidUsers(num);

      // 3. Create users
      const users = await User.insertMany(genUsers);

      // 4. Get users ids
      const ids = [];
      users.forEach((user) => ids.push(user._id.toString()));

      // 5. Generate random valid stores
      const genStores = UnitTestBases.GenRandomValidStores(ids);

      // 6. Create stores
      const stores = await Store.insertMany(genStores);

      // 7. Send request
      const res = await api.get(`${URL}`).set('Authorization', header);

      // 8. Expect result
      expect(res.status).toBe(200);
      const { results } = JSON.parse(res.text);
      expect(results).toBe(stores.length);
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * *******************UPDATE STORE TESTS**********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`PATCH ${URL}`, () => {
    it('Test_UpdateStore It should return 404 store for not found', async () => {
      // 1. Generate random valid mongo id
      const id = GenRandomVal.GenRandomValidID();

      // 2. Send request
      const res = await api.patch(`${URL}/${id}`).set('Authorization', header);

      // 3. Expect result
      expect(res.status).toBe(404);
    });
    it('Test_UpdateStore It should return 200 for store successfully updated', async () => {
      // 1. Generate random valid store
      const genStore = UnitTestBases.GenRandomValidStore(userId);

      // 2. Create store
      const store = await Store.create(genStore);

      // 3. Get store id
      const id = store._id.toString();

      // 4. Generate store update
      const updatedStore = UnitTestBases.GenRandomValidStore(userId);

      // 5. Send request
      const res = await api
        .patch(`${URL}/${id}`)
        .send(updatedStore)
        .set('Authorization', header);

      // 6. Expect result
      expect(res.status).toBe(200);
      const { data } = JSON.parse(res.text);
      expect(data.name).toBe(updatedStore.name);
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * *******************DELETE STORE TESTS**********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`DELETE ${URL}`, () => {
    it('Test_DeleteStore It should return 404 for store not found', async () => {
      // 1. Generate random valid mongo id
      const id = GenRandomVal.GenRandomValidID();

      // 2. Send request
      const res = await api.delete(`${URL}/${id}`).set('Authorization', header);

      // 3. Expect result
      expect(res.status).toBe(404);
    });
    it('Test_DeleteStore It should return 204 for store successfull deleted', async () => {
      // 1. Generate random valid store
      const genStore = UnitTestBases.GenRandomValidStore(userId);

      // 2. Create store
      const store = await Store.create(genStore);

      // 3. Get store id
      const id = store._id.toString();

      // 4. Send request
      const res = await api.delete(`${URL}/${id}`).set('Authorization', header);

      // 5. Expect result
      expect(res.status).toBe(204);
    });
  });
});
