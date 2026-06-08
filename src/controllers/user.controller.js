import cron from 'node-cron';
import User from '../models/user.model.js';

import factory from './handler.factory.js';
import AppError from '../utilities/appError.js';
import catchAsync from '../utilities/catchAsync.js';
import { filterObj } from '../utilities/util.js';
import { MONTHLY_SUBCRIPTIONS_TIME } from '../utilities/constants/index.js';

/**
 * @breif Create a cron job to run a script that updates
 * the subscription status of users who haven't paid in the last 30 days:
 * The function is then scheduled to run every day at midnight
 */
cron.schedule('0 0 * * *', async () => {
  // 1. Set number of days for job to run
  const thirtyDaysAgo = new Date(Date.now() * MONTHLY_SUBCRIPTIONS_TIME);

  // 2. Fetch all the users
  const users = await User.find({
    subscriptionStatus: 'active',
    lastPaymentDate: { $lt: thirtyDaysAgo },
  });

  // 3. Update all users subcription status
  for (const user of users) {
    user.subscriptionStatus = 'inactive';
    await user.save();
  }
});

/**
 * @bref Set parameter id in getting current user
 */
const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

/**
 * @breif Controller for updating user profile
 */
const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'username', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Account successfully updated!',
    data: {
      user: updatedUser,
    },
  });
});

/**
 * @breif Controller for deleting user profile, by setting active status to false.
 */
const deleteMe = catchAsync(async (req, res, next) => {
  // 1. Find user and update active to false
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  // 2. Send response
  res.status(204).json({
    status: 'success',
    message: 'Account successfully deleted!',
    data: null,
  });
});

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

const getUser = factory.getOne(User, {
  path: 'store',
});
const getAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
const updateUser = factory.updateOne(User);
const deleteUser = factory.deleteOne(User);

export default {
  getMe,
  updateMe,
  deleteMe,
  createUser,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
};
