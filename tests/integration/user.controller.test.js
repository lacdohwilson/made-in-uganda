import { expect } from 'expect';
import User from '../../models/user.model.js';
import {
  api,
  BASE_URL,
  createUser,
  createAdminUser,
  getHeader,
  closeServer,
} from '../config/index.js';
import GenRandomVal from '../utilities/genRandVal.js';
import UnitTestBases from '../utilities/unitTestBases.js';

const URL = `${BASE_URL}/users`;

describe('UserController_Tests', () => {
  before(async () => {
    // Delete all users before test begins
    await User.deleteMany({});
  });
  afterEach(async () => {
    // Delete all users
    await User.deleteMany({});
  });
  after(() => {
    // Close server
    closeServer();
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * *******************UPDATE ME TESTS*************************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`PATCH ${URL}/updateMe`, () => {
    it('Test_UpdateMe It should return 400 if password or passwordConfirm is provided', async () => {
      // 1. Create user
      const user = await createUser();

      // 2. Create header
      const header = getHeader(user);

      // 3. Generate random password and password confirm
      const password = GenRandomVal.GenRandomValidString(
        GenRandomVal.GenRandomIntegerInRange(8, 16)
      );
      const passwordConfirm = password;

      // 4. Send request
      const res = await api
        .patch(`${URL}/updateMe`)
        .send({ password, passwordConfirm })
        .set('Authorization', header);

      // 5. Expect result
      expect(res.status).toBe(400);
    });
    it('Test_UpdateMe It should return 200 if the user was successfully updated', async () => {
      // 1. Create user
      const user = await createUser();

      // 2. Generate new user info
      const updatedUser = UnitTestBases.GenRandomValidUser();

      // 3. Create header
      const header = getHeader(user);

      // 4. Send request
      const res = await api
        .patch(`${URL}/updateMe`)
        .send(updatedUser)
        .set('Authorization', header);

      // 5. Expect result
      expect(res.status).toBe(200);
    });
  });
  describe(`PATCH ${URL}/deleteMe`, () => {
    it('Test_DeleteMe It should return 204 if the user active status is set to false', async () => {
      // 1. Create user
      const user = await createUser();

      // 2. Get header
      const header = getHeader(user);

      // 3. Send request
      const res = await api
        .patch(`${URL}/deleteMe`)
        .set('Authorization', header);

      // 4. Expect result
      expect(res.status).toBe(204);
      // TODO: Evaluate this result
      // 5. Find user and inspect active status to be false
      // expect(deletedUser.active).toBeFalsy();
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * *******************GET ME TESTS*************************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`GET ${URL}/me`, () => {
    // ? How can we test for 404
    it('Test_Me It should return 200 if the account is found', async () => {
      // 1. Create user
      const user = await createUser();

      // 2. Get header
      const header = getHeader(user);

      // 3. Send request
      const res = await api.get(`${URL}/me`).set('Authorization', header);

      // 4. Expect result
      expect(res.status).toBe(200);
      const value = JSON.parse(res.text);
      const { data } = value;
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('email');
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * *******************RESTRICT TO TESTS***********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`GET ${URL} RestrictTo`, () => {
    it('It should should 403 for permission denied', async () => {
      // 1. Create user
      const user = await createUser();

      // 2. Get header
      const header = getHeader(user);

      // 3. Send request
      const res = await api.get(`${URL}`).set('Authorization', header);

      // 4. Expect result
      expect(res.status).toBe(403);
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * *******************CREATE USER TESTS***********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`POST ${URL}`, () => {
    it('Test_CreateUser It should return 500 for invalid route', async () => {
      // 1. Create admin user
      const user = await createAdminUser();

      // 2. Get header
      const header = getHeader(user);

      // 3. Send request
      const res = await api.post(`${URL}`).set('Authorization', header);

      // 4. Expect result
      expect(res.status).toBe(500);
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * *****************GET ALL USERS TESTS***********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`GET ${URL}`, () => {
    it('Test_GetAllUsers It should return 200 with a single array item', async () => {
      // 1. Create admin user
      const user = await createAdminUser();

      // 2. Get header
      const header = getHeader(user);

      // 3. Send request
      const res = await api.get(`${URL}`).set('Authorization', header);

      // 4. Expect result
      expect(res.status).toBe(200);
      const data = JSON.parse(res.text);
      expect(data.results).toEqual(1);
    });
    it('Test_GetAllUsers It should return 200 with users save', async () => {
      // 1. Create admin user
      const adminUser = await createAdminUser();

      // 2. Get header
      const header = getHeader(adminUser);

      // 3. Generate random users
      const users = UnitTestBases.GenRandValidUsers(
        GenRandomVal.GenRandomIntegerInRange(5, 20)
      );

      // 4. Create users
      await User.insertMany(users);

      // 5. Send request
      const res = await api.get(`${URL}`).set('Authorization', header);

      // 6. Expect result
      expect(res.status).toBe(200);
      const data = JSON.parse(res.text);
      expect(data.results).toEqual(users.length + 1);
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * *******************GET USER TESTS***********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`GET ${URL}/:id`, () => {
    it('Test_GetUser It should return 404 for not found', async () => {
      // 1. Create admin user
      const adminUser = await createAdminUser();

      // 2. Get authorization header
      const header = getHeader(adminUser);

      // 3. Generate random tex as user id
      const id = GenRandomVal.GenRandomValidID();

      // 4. Send request with invalid id
      const res = await api.get(`${URL}/${id}`).set('Authorization', header);

      // 5. Expect result
      expect(res.status).toBe(404);
    });
    it('Test_GetUser It should return 200 if the user successfully found', async () => {
      // 1. Create admin user
      const adminUser = await createAdminUser();

      // 2. Get authorization header
      const header = getHeader(adminUser);

      // 3. Get admin id
      const id = adminUser._id.toString();

      // 4. Send request with admin id
      const res = await api.get(`${URL}/${id}`).set('Authorization', header);

      // 5. Expect results
      expect(res.status).toBe(200);
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * *******************UPDATE USER TESTS***********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`PATCH ${URL}/:id`, () => {
    it('Test_UpdateUser It should return 404 for user not found', async () => {
      // 1. Create admin user
      const adminUser = await createAdminUser();

      // 2. Get authorization header
      const header = getHeader(adminUser);

      // 3. Generate random tex as user id
      const id = GenRandomVal.GenRandomValidID();

      // 4. Send request with invalid id
      const res = await api.patch(`${URL}/${id}`).set('Authorization', header);

      // 5. Expect result
      expect(res.status).toBe(404);
    });
    it('Test_UpdateUser It should return 200 for user successfully updated', async () => {
      // 1. Create admin user
      const adminUser = await createAdminUser();

      // 2. Get authorization header
      const header = getHeader(adminUser);

      // 3. Get user id
      const id = adminUser._id.toString();

      // 4. Generate new user
      const user = UnitTestBases.GenRandomValidUser();

      // 5. Send request with valid id
      const res = await api
        .patch(`${URL}/${id}`)
        .send(user)
        .set('Authorization', header);

      // 5. Expect result
      expect(res.status).toBe(200);
      const { data } = JSON.parse(res.text);
      expect(data.name).toEqual(user.name);
      expect(data.email).toEqual(user.email);
      expect(data.telephone).toEqual(user.telephone);
      expect(data.employees).toEqual(user.employees);
    });
  });
  /**
   * ***********************************************************
   * ***********************************************************
   * *******************DELETe USER TESTS***********************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`DELETE ${URL}/:id`, () => {
    it('Test_DeleteUser It should return 404 for user not found', async () => {
      // 1. Create admin user
      const adminUser = await createAdminUser();

      // 2. Get authorization header
      const header = getHeader(adminUser);

      // 3. Generate random user id
      const id = GenRandomVal.GenRandomValidID();

      // 4. Send request with invalid id
      const res = await api.delete(`${URL}/${id}`).set('Authorization', header);

      // 5. Expect result
      expect(res.status).toBe(404);
    });
    it('Test_DeleteUser It should return 204 if the user is successfully deleted', async () => {
      // 1. Create admin user
      const adminUser = await createAdminUser();

      // 2. Get authorization header
      const header = getHeader(adminUser);

      // 3. Get user id
      const id = adminUser._id.toString();

      // 4. Send request to delete user
      const res = await api.delete(`${URL}/${id}`).set('Authorization', header);

      // 5. Expect result
      expect(res.status).toBe(204);
    });
  });
});
