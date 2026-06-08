import request from 'supertest';
import jwt from 'jsonwebtoken';

import User from '../../models/user.model.js';
import server from '../../server.js';
import config from '../../configurations/config.js';
import UnitTest from '../utilities/unitTestBases.js';

/// @breif API request services
export const api = request(server);

/// @breif application base url
export const BASE_URL = config.prefix;

const signToken = (user) => {
  return jwt.sign({ user }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

const user = UnitTest.GenRandomValidUserWithPassword();

/**
 * @breif method to create a simple user
 */
export const createUser = async () => {
  // TODO: Find out why the generated user role is admin
  user.role = 'user';
  return await User.create(user);
};

/**
 * @breif method to create admin user
 */
export const createAdminUser = async () => {
  user.role = 'admin';
  return await User.create(user);
};

/**
 * Generate a new request header token, set the authorization to Bearer.
 * This header token is generated from the user id
 * @param {Object} user -> User object
 * @returns {String} token
 */
export const getHeader = (user) => {
  const token = signToken(user);
  return 'Bearer ' + token;
};

export const closeServer = () => {
  server.close();
};
