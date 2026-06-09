import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 15 mins
  limit: 100, // requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
});

export default apiLimiter;
