require('pg').defaults.parseInt8 = true;
const debug = require('debug')('api:database');
const { Sequelize } = require('sequelize');
const env = require('../config/env');

const db = new Sequelize(env.postgres_db, env.postgres_user, env.postgres_user_password, {
  host: env.postgres_host,
  port: env.postgres_port,
  dialect: 'postgres',
  logging: env.is_development ? str => debug(str) : false,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

const User = require('./User')(db);
const RefreshToken = require('./RefreshToken')(db);

const models = {
  User,
  RefreshToken,
};

Object.values(models).forEach(Model => {
  if (Model.associate) Model.associate(models);
});

db.authenticate()
  .then(() => debug('Database connected.'))
  .catch(error => debug('DATABASE CONNECTION ERROR', error));

// db.sync({ alter: true })
//   .then(() => debug('All tables were successfully synced.'))
//   .catch(err => debug('ON TABLE SYNC', err));

module.exports = models;
