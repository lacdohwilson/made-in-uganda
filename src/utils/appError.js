export default class AppError extends Error {
  /**
   * @breif Constructor
   * @param {String} message -> Error message
   * @param {Number} statusCode -> Error status code
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
