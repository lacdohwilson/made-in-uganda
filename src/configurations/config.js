import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

/**
 * @breif Configuration object to hold all environmental variables
 */

const config = {
  /**
   * @breif The basic API environment, port and prefix configuration values
   */
  env: process.env.NODE_ENV,
  port: process.env.PORT || 9000,
  prefix: process.env.API_PREFIX || '/api',
  origin: process.env.HOME_PAGE,
  /**
   * @breif Database for various environments
   */
  db: {
    prod: process.env.DATABASE_PROD,
    dev: process.env.DATABASE_DEV,
    test: process.env.DATABASE_TEST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
  /**
   * @breif JWT important variables
   * */
  jwt: {
    // The secret used to sign and validate signature
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    cookieExpires: process.env.JWT_COOKIE_EXPIRES_IN,
  },
  /**
   * @breif Mail trap variables
   */
  mailTrap: {
    user: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
  },
  /**
   * @breif Pay pay variable
   */
  paypay: {
    id: process.env.PAYPAL_CLIENT_ID,
    key: process.env.PAYPAY_KEY,
  },
};

export default config;
