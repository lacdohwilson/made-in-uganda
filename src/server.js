import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import config from './configurations/config.js';
import logger from './utils/logger.js';
// import imageUploadWorker from './workers/imageUpload.worker.js';

// // Start background workers (after env/config is loaded)
// imageUploadWorker();

// Handle synchronous crashes (must be FIRST)
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION 💥 Shutting down...', {
    message: err.message,
    stack: err.stack,
  });

  process.exit(1);
});

// Start HTTP server
const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} in ${config.env} mode`);
});

// Handle async errors
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION 💥 Shutting down...', {
    message: err.message,
    stack: err.stack,
  });

  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown for Docker / Kubernetes (IMPORTANT)
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(() => {
    logger.info('HTTP server closed.');

    // If you have DB connections, close them here too:
    // await mongoose.connection.close();

    process.exit(0);
  });

  // Force shutdown if hanging
  setTimeout(() => {
    logger.error('Force shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Docker / Kubernetes stop container
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Manual interrupt (Ctrl + C)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
