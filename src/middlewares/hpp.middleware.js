import hpp from 'hpp';
import config from '../configurations/config.js';

const hppMiddleware = hpp({
  whitelist: config.hpp.whitelist,
});

export default hppMiddleware;
