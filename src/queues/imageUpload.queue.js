import { Queue } from 'bullmq';
import redisConnection from '../utils/redis.js';

export const imageUploadQueue = new Queue('image-upload', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
