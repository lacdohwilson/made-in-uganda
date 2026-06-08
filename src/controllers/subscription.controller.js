import Subscription from '../models/subscription.model.js';
import factory from './handler.factory.js';

/**
 *
 * @breif Set Subscription user id
 */
const setSubscriptionUserId = (req, res, next) => {
  // Allow for nested routes
  if (!req.params.userId) req.body.userId = req.user.id;
  next();
};

const createSubscription = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /pay-subscription instead',
  });
};

export default {
  setSubscriptionUserId,
  createSubscription,
  getSubscription: factory.getOne(Subscription),
  getAllSubscriptions: factory.getAll(Subscription),
  updateSubscription: factory.updateOne(Subscription),
  deleteSubscription: factory.deleteOne(Subscription),
  subscriptionCount: factory.getCount(Subscription),
};
