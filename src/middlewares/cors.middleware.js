import cors from 'cors';
import config from '../configurations/config.js'; // or process.env

const devCorsOptions = {
  origin: '*',
  methods: 'GET, PATCH, POST, PUT, DELETE, OPTIONS',
  credentials: true,
  allowedHeaders:
    'Content-Type, Authorization, Content-Length, X-Requested-With',
};

const prodCorsOptions = {
  origin: ['https://your-frontend.com'], // strict in prod
  methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  credentials: true,
  allowedHeaders: 'Content-Type, Authorization',
};

const stagingCorsOptions = {
  origin: ['https://staging.your-frontend.com'],
  methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  credentials: true,
  allowedHeaders: 'Content-Type, Authorization',
};

const corsOptionsMap = {
  development: devCorsOptions,
  production: prodCorsOptions,
  staging: stagingCorsOptions,
};

const corsMiddleware = cors(corsOptionsMap[config.NODE_ENV || 'development']);

export default corsMiddleware;
