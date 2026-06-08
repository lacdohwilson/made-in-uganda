import { expect } from 'expect';
import User from '../../models/user.model.js';
import {
  api,
  BASE_URL,
  createUser,
  getHeader,
  closeServer,
} from '../config/index.js';
import UnitTestBases from '../utilities/unitTestBases.js';
import GenRandomVal from '../utilities/genRandVal.js';

const URL = `${BASE_URL}/users`;

describe('AuthController_Tests', () => {
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
   * *******************SIGN TESTS******************************
   * ***********************************************************
   * ***********************************************************
   */
  describe(`POST ${URL}/signup`, () => {
    it('Test_Signup It should return 201 if the user is registered', async () => {
      // 1. Generate user with password
      const genUser = UnitTestBases.GenRandomValidUserWithPassword();

      // 2. Send Request
      const res = await api.post(`${URL}/signup`).send(genUser);

      // 3. Expect results
      expect(res.status).toBe(201);
      const data = JSON.parse(res.text);
      expect(data).toHaveProperty('token');
      const { user } = data.data;
      expect(user).toHaveProperty('_id');
    });
  });
  /**
   * ***********************************************************
   * **********************************************************
   * *******************LOGIN TESTS**************************
   * ********************************************************
   * ********************************************************
   */
  describe(`POST ${URL}/login`, () => {
    it('Test_Login It should return 400 if the email or password is not provided', async () => {
      // 1. Generate random boolean;
      const bRes = GenRandomVal.GenRandomBoolean();

      // 2. Generate random email and password
      const email = GenRandomVal.GenRandomValidEmail();
      const password = GenRandomVal.GenRandomValidString(
        GenRandomVal.GenRandomIntegerInRange(8, 16)
      );

      // 3. Send request with email or password
      let res;
      if (bRes) {
        res = await api.post(`${URL}/login`).send({ email });
      } else {
        res = await api.post(`${URL}/login`).send({ password });
      }

      // 4. Expect response
      expect(res.status).toBe(400);
    });
    it('Test_Login It should return 400 if user with email is not found', async () => {
      // 1. Generate random valid email
      const email = GenRandomVal.GenRandomValidEmail();

      // 2. Send request
      const res = await api.post(`${URL}/login`).send({ email });

      // 3. Expect result
      expect(res.status).toBe(400);
    });
  });
  /**
   * ***********************************************************
   * **********************************************************
   * *******************PROTECTED TESTS**************************
   * ********************************************************
   * ********************************************************
   */
  describe(`GET ${URL} Protected`, () => {
    it('Test_Protected It should return 401 for no Token', async () => {
      // 1. Send request with no authorization
      const res = await api.get(`${URL}`);

      // 2. Expect results
      expect(res.status).toBe(401);
    });
    it('Test_Protected It should return 401 for Invalid Token', async () => {
      // 1. Create user to get make token
      const user = await createUser();

      // 2. Make token header
      const header = getHeader(user);

      // 3. Delete user belonging to token
      await User.findByIdAndDelete(user._id);

      // 4. Send request
      const res = await api.get(`${URL}`).set('Authorization', header);

      // 5. Expect result
      expect(res.status).toBe(401);
    });
    it('Test_Protected It should return 401 after user changed password', async () => {
      // 1. Create user to get make token
      const user = await createUser();

      // 2. Make token header
      const header = getHeader(user);

      // 3. Change password
      user.password = GenRandomVal.GenRandomValidString(
        GenRandomVal.GenRandomIntegerInRange(8, 16)
      );
      user.passwordConfirm = user.password;

      await user.save();

      // 4. Send request
      const res = await api.get(`${URL}`).set('Authorization', header);

      // 5. Expect result
      expect(res.status).toBe(401);
    });
  });
  /**
   * **********************************************************
   * **********************************************************
   * *************UPDATE PASSWORD TESTS************************
   * **********************************************************
   * **********************************************************
   */
  describe(`PATCH ${URL}/updateMyPassword`, () => {
    it('Test_UpdateMyPassword It should return 401 if passwords mismatch', async () => {
      // 1. Create User
      await createUser();

      // 2. Generate a different current password
      const passwordCurrent = GenRandomVal.GenRandomValidString(
        GenRandomVal.GenRandomIntegerInRange(8, 16)
      );

      // 3. Send request
      const res = await api
        .patch(`${URL}/updateMyPassword`)
        .send({ passwordCurrent });

      // 4. Expect result
      expect(res.status).toBe(401);
    });
    it('Test_UpdateMyPassword It should return 200 if the password was updated', async () => {
      // 1. Create User
      const user = await createUser();

      // 2. Assign user password to password current
      const passwordCurrent = user.password;

      // 3. Generate new password
      const password = GenRandomVal.GenRandomValidString(
        GenRandomVal.GenRandomIntegerInRange(8, 16)
      );
      const passwordConfirm = password;

      // 4. Send request
      const res = await api
        .patch(`${URL}/updateMyPassword`)
        .send({ passwordCurrent, password, passwordConfirm });

      // 5. Expect result
      expect(res.status).toBe(401);
    });
  });
});
