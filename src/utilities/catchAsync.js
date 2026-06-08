/**
 * @breif Method to handle asynchronous error exceptions occuring in async
 * method calles
 * @param {function} fn -> function
 */
export default (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
