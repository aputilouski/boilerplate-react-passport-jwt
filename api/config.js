const debug = require('debug')('api:server');

const config = {
  is_production: process.env.NODE_ENV === 'production',
  is_development: process.env.NODE_ENV === 'development',

  jwt_secret: process.env.JWT_SECRET,
};

debug(config);

Object.keys(config).forEach(key => {
  if (config[key] === undefined) throw new Error(`Need to set value for environment variable: ${key}`);
});

module.exports = config;
