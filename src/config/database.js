require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'dev',
    password: process.env.DB_PASSWORD || 'dev',
    database: process.env.DB_NAME || 'erp',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3307', 10),
    dialect: 'mysql',
    logging: false
  },
  test: {
    username: process.env.DB_USERNAME || 'dev',
    password: process.env.DB_PASSWORD || 'dev',
    database: process.env.DB_NAME || 'erp_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3307', 10),
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    logging: false
  }
};
