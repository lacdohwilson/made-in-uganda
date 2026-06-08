import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import User from '../models/user.model.js';
import Store from '../models/store.model.js';
import Subscription from '../models/subscription.model.js';
import email from '../utilities/email.js';
import config from '../configurations/config.js';
import catchAsync from '../utilities/catchAsync.js';
import AppError from '../utilities/appError.js';
import { subcriptionIsExpired } from '../utilities/util.js';

/**
 * @breif Generate user jwt access token
 * @param {String} id User id
 * @return {String}
 */
const genAccessToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * @breif Generate jwt refresh token
 * @param {String} id
 * @returns {String}
 */
const genRefreshToken = (id) => {
  return jwt.sign({ id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

/**
 * @breif Create and send as response jwt token
 * @param {Object} user -> User object
 * @param {String} message -> Response message
 * @param {statusCode} statusCode -> Response status code
 * @param {req} Request
 * @param {res} Response
 */
const createSendToken = (user, message, statusCode, req, res) => {
  // 1. Get access token
  const accessToken = genAccessToken(user._id);

  // 2. Get refresh token
  const refreshToken = genRefreshToken(user._id);

  // 3. Set cookie access token
  res.cookie('jwt', accessToken, {
    expires: new Date(Date.now() + config.jwt.cookieExpires * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // 3. Remove user password from output
  user.password = undefined;

  // 4. Send response
  res.status(statusCode).json({
    status: 'success',
    message,
    accessToken,
    refreshToken,
    data: {
      user,
    },
  });
};

const refreshToken = catchAsync(async (req, res, next) => {
  // 1. Get refresh token
  const { refreshToken } = req.body;

  // 2. Check refresh token
  if (!refreshToken) {
    return next(new AppError('Refresh token not found', 401));
  }

  // 3. Verify refresh token
  const decoded = await promisify(jwt.verify)(
    refreshToken,
    config.jwt.refreshSecret
  );
  // ? Is it not proper to find the user here?
  // 4. Check for id
  if (!decoded.id) {
    return next(new AppError('Invalid refresh token', 401));
  }

  // 5. Generate new access token
  const newToken = genAccessToken(decoded.id);

  // 6. Send response
  res.status(200).json({
    status: 'success',
    data: newToken,
  });
});

/**
 * @breif Controller to sigup a new user
 */
const signup = catchAsync(async (req, res, next) => {
  // 1. Pick required values
  const { username, email, password, passwordConfirm } = req.body;

  // 2. Create new user
  const newUser = await User.create({
    username,
    email,
    password,
    passwordConfirm,
  });

  // 3. Send response
  createSendToken(newUser, 'Successfully signup!', 201, req, res);
});

/**
 * @breif Controller to login an already registered user
 */
const login = catchAsync(async (req, res, next) => {
  // 1. Get email and password
  const { email, password } = req.body;

  // 2. Check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 3. Find user with email
  const user = await User.findOne({ email })
    .select('+password')
    .populate({ path: 'store' });

  // 4. Check if user exists && password is correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 400));
  }

  // 5. If everything ok, send token to client
  createSendToken(user, 'Successfully login!', 200, req, res);
});

const protect = catchAsync(async (req, res, next) => {
  // 1. Get token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2. Token verification
  const decoded = await promisify(jwt.verify)(token, config.jwt.secret);

  // 3. Check if user still exist's
  const currentUser = await User.findById(decoded.id).populate({
    path: 'store',
  });

  if (!currentUser) {
    return next(
      new AppError("User belonging to this token no longer exist's", 401)
    );
  }

  // 4. Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('You recently changed password! please login again.', 401)
    );
  }

  // 5. GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

/**
 * @breif Middleware to restrict route access only to user of
 * a particular role
 * @param  {...any} roles -> User roles
 * @returns {Function}
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'user']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

/**
 * @breif Register user new store
 */
const registerStore = catchAsync(async (req, res, next) => {
  // 1. Set store user
  req.body.user = req.user._id;

  // 2. Create new store
  const store = await Store.create(req.body);

  // 3. Check if store has been created
  if (!store) {
    return next(new AppError('Error creating store', 500));
  }

  // 4. Get user with new store object
  const user = await User.findById(req.user._id).populate({ path: 'store' });

  // 5. send response back
  res.status(201).json({
    status: 'success',
    message: 'Store successfully registered',
    data: { user },
  });
});

/**
 * @breif Check user subscription status
 */
const checkSubscriptionStatus = catchAsync(async (req, res, next) => {
  // 1. Get user
  const user = await User.findById(req.user.id);

  // 2. Check subcription status
  if (
    user.subscriptionStatus === 'inactive' &&
    subcriptionIsExpired(user.lastPaymentDate)
  ) {
    return next(
      new AppError(
        'Your subscription has expired. Please renew your subscription to continue using our service.',
        401
      )
    );
  }

  next();
});

/**
 * @breif Middleware for user subscription payment
 */
const paySubscription = catchAsync(async (req, res, next) => {
  // 1. Get user
  const user = await User.findById(req.user.id).populate({ path: 'store' });

  // 2. Check if subscription has expired
  if (
    !subcriptionIsExpired(user.lastPaymentDate) ||
    user.subscriptionStatus === 'active'
  ) {
    return next(new AppError('Your subscription has not expire!', 400));
  }

  // 3. Check if amount is pressent in request
  if (!req.body.amount || req.body.amount < 50000) {
    return next(new AppError('Invalid amount for subscription payment', 400));
  }

  // 4. Create subscription
  await Subscription.create({
    user: req.user.id,
    amount: req.body.amount,
  });

  // 5. Update user subscription details
  user.subscriptionStatus = 'active';
  user.lastPaymentDate = Date.now();
  await user.save({ validateBeforeSave: false });

  // 6. Send response
  res.status(201).json({
    status: 'success',
    message: 'Subscription paid successfully',
    data: { user },
  });
});

/**
 * @breif Controller for user to get token for password reset
 * after user forgot password
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on posted email and check if user exist
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }

  // 2. Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Send it to the user's email
  const resetURL = `${req.protocol}://${req.get('host')}/${
    config.prefix
  }/users/resetPassword/${resetToken}`;

  // 4. Construct message
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await email.sendEmailDev({
      email: user.email,
      subject: 'Your password reset token (valid for 10min)',
      message,
    }),
      // Send response
      res.status(200).json({
        status: 'success',
        message: 'Token sent to your email!',
      });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

/**
 * @breif Controller for user passsword reset
 */
const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 'Successfully reset password!', 200, req, res);
});

/**
 * @breif Controller for updating user password
 */
const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 'Successfully changed password!', 200, req, res);
});

export default {
  refreshToken,
  signup,
  login,
  protect,
  restrictTo,
  registerStore,
  checkSubscriptionStatus,
  paySubscription,
  forgotPassword,
  resetPassword,
  updatePassword,
};
