import { MONTHLY_SUBCRIPTIONS_TIME } from './constants/index.js';

/**
 * @breif Filter out unwanted fields in an object
 * @param {Object} obj -> Provided object
 * @param  {...any} allowedFields -> Fields allowed to be updated
 * @returns {Object}
 */
export const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 * @breif Check if user monthly subscription has expired after 30 days.
 * @param {String} paymentDate Last payment date
 * @returns {Boolean}
 */
export const subcriptionIsExpired = (paymentDate) => {
  if (!paymentDate) return true;
  const currentDate = new Date();
  const dateToCheck = new Date(paymentDate);
  const timeDiffInMs = currentDate.getTime() - dateToCheck.getTime();
  return timeDiffInMs > MONTHLY_SUBCRIPTIONS_TIME;
};
