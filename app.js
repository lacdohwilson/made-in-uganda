import express, { json, urlencoded } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';

import config from './configurations/config.js';
import globalErrorHandler from './controllers/error.controller.js';
import AppError from './utilities/appError.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import storeRouter from './routes/store.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import productRouter from './routes/product.routes.js';
import categoryRouter from './routes/category.routes.js';

// Start express app
const app = express();

// 1) GLOBAL MIDDLEWARES
// Serving static files
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use(limiter);

// Body parser, reading data from body into req.body
app.use(bodyParser.json());
app.use(json({ limit: '10kb' }));
app.use(urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Enable CORS for all routes
app.use(
  cors({
    origin: '*',
    methods: 'GET, PATCH, POST, PUT, DELETE, OPTIONS',
    credentials: true,
    allowedHeaders:
      'Content-Type, Authorization, Content-Length, X-Requested-With',
  })
);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'category',
      'price',
      'amount',
      'subscriptionStatus',
      'datePaid',
      'fee',
    ],
  })
);

app.use(compression());

// ROUTES
app.use(`${config.prefix}/auth`, authRouter);
app.use(`${config.prefix}/users`, userRouter);
app.use(`${config.prefix}/stores`, storeRouter);
app.use(`${config.prefix}/products`, productRouter);
app.use(`${config.prefix}/categories`, categoryRouter);
app.use(`${config.prefix}/subscriptions`, subscriptionRouter);

// INVALID ROUTES
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
