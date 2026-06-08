import logger from '../utils/logger.js';

export const requestLogger = (req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  next();
};
