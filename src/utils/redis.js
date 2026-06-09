import config from '../configurations/config.js';

const redisConnection = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  tls: config.redis.tls === 'true' ? {} : undefined,
};

export default redisConnection;
